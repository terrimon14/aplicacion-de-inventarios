const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId, withTransaction } = require('../database/index')

module.exports = function registerCustomerHandlers() {
  ipcMain.handle('db:customers:list', (_, { search = '' } = {}) => {
    const params = []
    let sql = `SELECT c.*,
      COUNT(DISTINCT s.id) as total_purchases,
      COALESCE(SUM(CASE WHEN s.status='completed' THEN s.total ELSE 0 END), 0) as total_spent
      FROM customers c
      LEFT JOIN sales s ON s.customer_id = c.id
      WHERE 1=1`
    if (search) {
      sql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.document_number LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    sql += ` GROUP BY c.id ORDER BY c.name ASC`
    return queryAll(sql, params)
  })

  ipcMain.handle('db:customers:get', (_, id) => {
    return queryOne(`SELECT * FROM customers WHERE id = ?`, [id])
  })

  ipcMain.handle('db:customers:create', (_, data) => {
    run(`INSERT INTO customers (name, document_type, document_number, email, phone, address)
         VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.document_type || 'DNI', data.document_number || '',
       data.email || '', data.phone || '', data.address || ''])
    const id = lastInsertRowId()
    return { id, ...data }
  })

  ipcMain.handle('db:customers:update', (_, { id, ...data }) => {
    run(`UPDATE customers SET name=?, document_type=?, document_number=?, email=?, phone=?, address=?, status=? WHERE id=?`,
      [data.name, data.document_type || 'DNI', data.document_number || '',
       data.email || '', data.phone || '', data.address || '', data.status || 'active', id])
    return { id, ...data }
  })

  ipcMain.handle('db:customers:delete', (_, id) => {
    run(`UPDATE customers SET status = 'inactive' WHERE id = ?`, [id])
    return { id }
  })

  ipcMain.handle('db:customers:debtors', () => {
    return queryAll(`
      SELECT
        c.id as customer_id,
        c.name,
        c.phone,
        c.email,
        COUNT(si.id) as cuotas_pendientes,
        COALESCE(SUM(si.amount - si.paid_amount), 0) as saldo_pendiente,
        MIN(si.due_date) as proximo_vencimiento
      FROM sale_installments si
      JOIN customers c ON c.id = si.customer_id
      WHERE si.status IN ('pending', 'partial', 'overdue')
      GROUP BY c.id
      HAVING saldo_pendiente > 0
      ORDER BY proximo_vencimiento ASC
    `)
  })

  ipcMain.handle('db:customers:installments', (_, { customerId }) => {
    if (!customerId) throw new Error('customerId es requerido')

    return queryAll(`
      SELECT
        si.*,
        s.reference as sale_reference,
        c.name as customer_name,
        (si.amount - si.paid_amount) as pending_amount
      FROM sale_installments si
      LEFT JOIN sales s ON s.id = si.sale_id
      LEFT JOIN customers c ON c.id = si.customer_id
      WHERE si.customer_id = ?
      ORDER BY date(si.due_date) ASC, si.id ASC
    `, [customerId])
  })

  ipcMain.handle('db:customers:paymentHistory', (_, { customerId }) => {
    if (!customerId) throw new Error('customerId es requerido')

    return queryAll(`
      SELECT
        ip.id,
        ip.amount,
        ip.payment_date,
        ip.created_at,
        si.id as installment_id,
        si.due_date,
        s.reference as sale_reference
      FROM installment_payments ip
      LEFT JOIN sale_installments si ON si.id = ip.installment_id
      LEFT JOIN sales s ON s.id = si.sale_id
      WHERE ip.customer_id = ?
      ORDER BY date(ip.payment_date) DESC, ip.id DESC
    `, [customerId])
  })

  ipcMain.handle('db:customers:registerPayment', (_, { customerId, amount, paymentDate }) => {
    const paymentAmount = Number(amount || 0)
    const payDate = paymentDate || new Date().toISOString().slice(0, 10)
    if (!customerId) throw new Error('customerId es requerido')
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      throw new Error('El monto de pago debe ser mayor a 0')
    }

    const customer = queryOne(`SELECT name FROM customers WHERE id = ?`, [customerId])
    if (!customer) throw new Error('Cliente no encontrado')

    const quotas = queryAll(`
      SELECT *
      FROM sale_installments
      WHERE customer_id = ?
        AND status IN ('pending', 'partial', 'overdue')
      ORDER BY date(due_date) ASC, id ASC
    `, [customerId])

    if (quotas.length === 0) throw new Error('No hay cuotas pendientes para este cliente')

    let remaining = paymentAmount
    const applied = []

    try {
      withTransaction((tx) => {
        quotas.forEach((quota) => {
          if (remaining <= 0) return

          const pending = Number(quota.amount) - Number(quota.paid_amount)
          if (pending <= 0) return

          const appliedAmount = Math.min(remaining, pending)
          const newPaid = Number(quota.paid_amount) + appliedAmount
          const newStatus = newPaid >= Number(quota.amount) ? 'paid' : 'partial'

          tx.run(
            `UPDATE sale_installments
             SET paid_amount = ?,
                 status = ?,
                 paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE paid_at END
             WHERE id = ?`,
            [newPaid, newStatus, newStatus, quota.id],
          )

          tx.run(
            `INSERT INTO installment_payments (installment_id, customer_id, amount, payment_date)
             VALUES (?, ?, ?, ?)`,
            [quota.id, customerId, appliedAmount, payDate],
          )

          applied.push({ installment_id: quota.id, applied_amount: appliedAmount })
          remaining -= appliedAmount
        })

        if (applied.length === 0) {
          throw new Error('No se pudo aplicar el pago a cuotas activas')
        }

        // Register cash movement as incoming collection only if a real session is open.
        const session = tx.queryOne(
          `SELECT id FROM cash_sessions WHERE status = 'open' ORDER BY opening_date DESC, id DESC LIMIT 1`,
        )
        if (!session) {
          throw new Error('Debe abrir una caja para registrar cobranzas.')
        }

        tx.run(
          `INSERT INTO cash_movements (session_id, type, amount, description)
           VALUES (?, 'in', ?, ?)`,
          [session.id, paymentAmount - remaining, `Cobranza - ${customer.name}`],
        )
      })

      const summary = queryOne(`
        SELECT
          COUNT(*) as cuotas_pendientes,
          COALESCE(SUM(amount - paid_amount), 0) as saldo_pendiente
        FROM sale_installments
        WHERE customer_id = ?
          AND status IN ('pending', 'partial', 'overdue')
      `, [customerId])

      return {
        customerId,
        paidTotal: paymentAmount - remaining,
        unapplied: remaining,
        applied,
        summary,
      }
    } catch (error) {
      throw new Error(`No se pudo registrar el pago: ${error.message}`)
    }
  })
}
