const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

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
}
