const { ipcMain } = require('electron')
const { queryAll, queryOne, withTransaction } = require('../database/index')

function generateRef(prefix = 'COM') {
  const rows = queryAll(`SELECT COUNT(*) as cnt FROM purchases`)
  const cnt = (rows[0]?.cnt ?? 0) + 1
  return `${prefix}-${String(cnt).padStart(4, '0')}`
}

module.exports = function registerPurchaseHandlers() {
  ipcMain.handle('db:purchases:list', (_, { search = '', status } = {}) => {
    let sql = `SELECT pu.*, s.name as supplier_name_joined
      FROM purchases pu
      LEFT JOIN suppliers s ON pu.supplier_id = s.id
      WHERE 1=1`
    const params = []
    if (search) { sql += ` AND (pu.reference LIKE ? OR pu.supplier_name LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }
    if (status)  { sql += ` AND pu.status = ?`; params.push(status) }
    sql += ` ORDER BY pu.created_at DESC`
    return queryAll(sql, params)
  })

  ipcMain.handle('db:purchases:get', (_, id) => {
    const purchase = queryOne(`SELECT * FROM purchases WHERE id = ?`, [id])
    if (!purchase) return null
    const items = queryAll(`SELECT * FROM purchase_items WHERE purchase_id = ?`, [id])
    return { ...purchase, items }
  })

  ipcMain.handle('db:purchases:create', (_, { supplier_id, supplier_name, items, notes = '' }) => {
    const subtotal = items.reduce((acc, i) => acc + i.cost * i.quantity, 0)
    const tax = subtotal * 0.18
    const total = subtotal + tax
    const reference = generateRef('COM')

    const purchaseId = withTransaction((tx) => {
      tx.run(
        `INSERT INTO purchases (reference, supplier_id, supplier_name, subtotal, tax, total, notes) VALUES (?,?,?,?,?,?,?)`,
        [reference, supplier_id || null, supplier_name || '', subtotal, tax, total, notes],
      )
      const createdId = tx.lastInsertRowId()

      items.forEach(item => {
        tx.run(
          `INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, cost, subtotal) VALUES (?,?,?,?,?,?)`,
          [createdId, item.product_id || null, item.name, item.quantity, item.cost, item.cost * item.quantity],
        )

        if (item.product_id) {
          tx.run(
            `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 1, 0)`,
            [item.product_id],
          )
          tx.run(
            `UPDATE inventario_ubicacion
             SET cantidad = cantidad + ?, updated_at = datetime('now')
             WHERE producto_id = ? AND ubicacion_id = 1`,
            [item.quantity, item.product_id],
          )

          const row = tx.queryOne(
            `SELECT COALESCE(SUM(cantidad), 0) as stock_total FROM inventario_ubicacion WHERE producto_id = ?`,
            [item.product_id],
          )
          tx.run(
            `UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`,
            [Number(row?.stock_total ?? 0), item.product_id],
          )
        }
      })

      return createdId
    })

    return { id: purchaseId, reference, total }
  })
}
