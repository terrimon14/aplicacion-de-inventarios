const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerCashHandlers() {
  ipcMain.handle('db:cash:currentSession', () => {
    const session = queryOne(`SELECT * FROM cash_sessions WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1`)
    if (!session) return null

    const movements = queryAll(`SELECT * FROM cash_movements WHERE session_id = ? ORDER BY created_at DESC`, [session.id])
    const income   = movements.filter(m => m.type === 'in').reduce((a, m) => a + m.amount, 0)
    const expenses = movements.filter(m => m.type === 'out').reduce((a, m) => a + m.amount, 0)
    const balance  = session.opening_balance + income - expenses

    return { ...session, movements, income, expenses, balance }
  })

  ipcMain.handle('db:cash:openSession', (_, { opening_balance, user_id }) => {
    // Close any previously open session first
    run(`UPDATE cash_sessions SET status='closed', closed_at=datetime('now') WHERE status='open'`)
    run(`INSERT INTO cash_sessions (opening_balance, user_id) VALUES (?, ?)`, [opening_balance ?? 0, user_id ?? 1])
    const id = lastInsertRowId()
    return { id, opening_balance, status: 'open' }
  })

  ipcMain.handle('db:cash:closeSession', (_, { session_id, closing_balance }) => {
    run(`UPDATE cash_sessions SET status='closed', closing_balance=?, closed_at=datetime('now') WHERE id=?`,
      [closing_balance, session_id])
    return { id: session_id, status: 'closed' }
  })

  ipcMain.handle('db:cash:movements', (_, { session_id } = {}) => {
    if (session_id) {
      return queryAll(`SELECT * FROM cash_movements WHERE session_id = ? ORDER BY created_at DESC`, [session_id])
    }
    return queryAll(`SELECT * FROM cash_movements ORDER BY created_at DESC LIMIT 100`)
  })

  ipcMain.handle('db:cash:addMovement', (_, { session_id, type, amount, description }) => {
    run(`INSERT INTO cash_movements (session_id, type, amount, description) VALUES (?,?,?,?)`,
      [session_id, type, amount, description || ''])
    const id = lastInsertRowId()
    return { id, session_id, type, amount, description }
  })
}
