const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

// Generate sale reference like VTA-0001
function generateReference(prefix = 'VTA') {
  const rows = queryAll(`SELECT COUNT(*) as cnt FROM sales`)
  const cnt = (rows[0]?.cnt ?? 0) + 1
  return `${prefix}-${String(cnt).padStart(4, '0')}`
}

module.exports = function registerSaleHandlers() {
  ipcMain.handle('db:sales:list', (_, { search = '', status, from, to } = {}) => {
    let sql = `
      SELECT s.*, c.name as customer_name_joined,
             (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id = s.id) as item_count
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `
    const params = []
    if (search) {
      sql += ` AND (s.reference LIKE ? OR s.customer_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    if (status) { sql += ` AND s.status = ?`; params.push(status) }
    if (from)   { sql += ` AND date(s.created_at) >= ?`; params.push(from) }
    if (to)     { sql += ` AND date(s.created_at) <= ?`; params.push(to) }
    sql += ` ORDER BY s.created_at DESC`
    return queryAll(sql, params)
  })

  ipcMain.handle('db:sales:get', (_, id) => {
    const sale = queryOne(`SELECT * FROM sales WHERE id = ?`, [id])
    if (!sale) return null
    const items = queryAll(`SELECT * FROM sale_items WHERE sale_id = ?`, [id])
    return { ...sale, items }
  })

  ipcMain.handle('db:sales:create', (_, {
    customer_id,
    customer_name,
    items,
    payment_method,
    discount = 0,
    notes = '',
    cash_session_id,
    ubicacion_id = 2,
    installments = [],
  }) => {
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const tax = (subtotal - discount) * 0.18
    const total = subtotal - discount + tax
    const reference = generateReference('VTA')
    const dbPaymentMethod = payment_method === 'credit' ? 'other' : (payment_method || 'cash')

    const saleStatus = payment_method === 'credit' ? 'pending' : 'completed'

    run(`
      INSERT INTO sales (reference, customer_id, customer_name, subtotal, tax, discount, total, payment_method, cash_session_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [reference, customer_id || null, customer_name || 'Cliente general',
        subtotal, tax, discount, total, dbPaymentMethod,
        cash_session_id || null, notes])

    const saleId = lastInsertRowId()

    // Insert items and update stock
    items.forEach(item => {
      run(`
        INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [saleId, item.product_id || null, item.name, item.quantity, item.price, item.price * item.quantity])

      if (item.product_id) {
        run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, ?, 0)`,
          [item.product_id, ubicacion_id])
        run(
          `UPDATE inventario_ubicacion
           SET cantidad = MAX(0, cantidad - ?), updated_at = datetime('now')
           WHERE producto_id = ? AND ubicacion_id = ?`,
          [item.quantity, item.product_id, ubicacion_id],
        )

        const row = queryOne(
          `SELECT COALESCE(SUM(cantidad), 0) as stock_total FROM inventario_ubicacion WHERE producto_id = ?`,
          [item.product_id],
        )
        run(`UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`,
          [row?.stock_total ?? 0, item.product_id])
      }
    })

    run(`UPDATE sales SET status = ? WHERE id = ?`, [saleStatus, saleId])

    if (payment_method === 'credit' && Array.isArray(installments) && installments.length > 0) {
      installments.forEach((quota) => {
        if (!quota?.due_date) return
        run(
          `INSERT INTO sale_installments (sale_id, customer_id, amount, due_date, status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [saleId, customer_id || null, Number(quota.amount || 0), quota.due_date],
        )
      })
    }

    // Register cash movement if session open
    if (cash_session_id) {
      run(`INSERT INTO cash_movements (session_id, type, amount, description) VALUES (?, 'in', ?, ?)`,
        [cash_session_id, total, `Venta ${reference}`])
    }

    return { id: saleId, reference, total }
  })

  ipcMain.handle('db:sales:void', (_, id) => {
    const sale = queryOne('SELECT * FROM sales WHERE id = ?', [id])
    if (!sale || sale.status !== 'completed') throw new Error('No se puede anular esta venta')

    const items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [id])
    items.forEach(item => {
      if (item.product_id) {
        run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 2, 0)`, [item.product_id])
        run(`UPDATE inventario_ubicacion SET cantidad = cantidad + ?, updated_at = datetime('now') WHERE producto_id = ? AND ubicacion_id = 2`,
          [item.quantity, item.product_id])
        const row = queryOne(`SELECT COALESCE(SUM(cantidad), 0) as stock_total FROM inventario_ubicacion WHERE producto_id = ?`, [item.product_id])
        run(`UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`, [row?.stock_total ?? 0, item.product_id])
      }
    })
    run(`UPDATE sales SET status = 'cancelled' WHERE id = ?`, [id])
    return { id, status: 'cancelled' }
  })
}
