const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerSupplierHandlers() {
  ipcMain.handle('db:suppliers:list', (_, { search = '' } = {}) => {
    const params = []
    let sql = `SELECT s.*, COUNT(p.id) as purchase_count
      FROM suppliers s
      LEFT JOIN purchases p ON p.supplier_id = s.id
      WHERE 1=1`
    if (search) {
      sql += ` AND (s.name LIKE ? OR s.contact LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    sql += ` GROUP BY s.id ORDER BY s.name ASC`
    return queryAll(sql, params)
  })

  ipcMain.handle('db:suppliers:get', (_, id) => queryOne(`SELECT * FROM suppliers WHERE id = ?`, [id]))

  ipcMain.handle('db:suppliers:create', (_, data) => {
    run(`INSERT INTO suppliers (name, contact, ruc, email, phone, address) VALUES (?,?,?,?,?,?)`,
      [data.name, data.contact || '', data.ruc || '', data.email || '', data.phone || '', data.address || ''])
    const id = lastInsertRowId()
    return { id, ...data }
  })

  ipcMain.handle('db:suppliers:update', (_, { id, ...data }) => {
    run(`UPDATE suppliers SET name=?, contact=?, ruc=?, email=?, phone=?, address=?, status=? WHERE id=?`,
      [data.name, data.contact || '', data.ruc || '', data.email || '', data.phone || '', data.address || '', data.status || 'active', id])
    return { id, ...data }
  })

  ipcMain.handle('db:suppliers:delete', (_, id) => {
    run(`UPDATE suppliers SET status = 'inactive' WHERE id = ?`, [id])
    return { id }
  })
}
