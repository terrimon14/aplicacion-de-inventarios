const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerCategoryHandlers() {
  ipcMain.handle('db:categories:list', () => {
    return queryAll(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
  })

  ipcMain.handle('db:categories:create', (_, { name, description }) => {
    run(`INSERT INTO categories (name, description) VALUES (?, ?)`, [name, description || ''])
    const id = lastInsertRowId()
    return { id, name, description, product_count: 0 }
  })

  ipcMain.handle('db:categories:update', (_, { id, name, description }) => {
    run(`UPDATE categories SET name = ?, description = ? WHERE id = ?`, [name, description || '', id])
    return { id, name, description }
  })

  ipcMain.handle('db:categories:delete', (_, id) => {
    run(`DELETE FROM categories WHERE id = ?`, [id])
    return { id }
  })
}
