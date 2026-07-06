const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerUserHandlers() {
  ipcMain.handle('db:users:list', () =>
    queryAll(`SELECT id, name, email, role, status, last_login, created_at FROM users ORDER BY name ASC`)
  )

  ipcMain.handle('db:users:create', (_, data) => {
    run(`INSERT INTO users (name, email, role, password_hash, status) VALUES (?,?,?,?,?)`,
      [data.name, data.email, data.role || 'vendedor', data.password_hash || '', 'active'])
    const id = lastInsertRowId()
    return { id, ...data }
  })

  ipcMain.handle('db:users:update', (_, { id, ...data }) => {
    run(`UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?`,
      [data.name, data.email, data.role || 'vendedor', data.status || 'active', id])
    return { id, ...data }
  })

  ipcMain.handle('db:users:delete', (_, id) => {
    run(`UPDATE users SET status = 'inactive' WHERE id = ?`, [id])
    return { id }
  })
}
