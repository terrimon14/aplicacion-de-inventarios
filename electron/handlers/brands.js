const { ipcMain } = require('electron')
const { queryAll, run, lastInsertRowId } = require('../database/index')

module.exports = function registerBrandHandlers() {
  ipcMain.handle('db:brands:list', () => {
    return queryAll(`SELECT b.*, COUNT(p.id) as product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id AND p.status = 'active'
      GROUP BY b.id ORDER BY b.name ASC`)
  })

  ipcMain.handle('db:brands:create', (_, { name }) => {
    run(`INSERT INTO brands (name) VALUES (?)`, [name])
    const id = lastInsertRowId()
    return { id, name, product_count: 0 }
  })

  ipcMain.handle('db:brands:update', (_, { id, name }) => {
    run(`UPDATE brands SET name = ? WHERE id = ?`, [name, id])
    return { id, name }
  })

  ipcMain.handle('db:brands:delete', (_, id) => {
    run(`DELETE FROM brands WHERE id = ?`, [id])
    return { id }
  })
}
