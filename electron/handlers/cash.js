const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerCashHandlers() {
  const getCurrentSession = (userId = 1) => {
    const session = queryOne(
      `SELECT *
       FROM cash_sessions
       WHERE status = 'open' AND (user_id = ? OR user_id IS NULL)
       ORDER BY opening_date DESC, id DESC
       LIMIT 1`,
      [userId],
    )
    if (!session) return null

    const totals = queryOne(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as income_total,
         COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as expense_total,
         COALESCE(SUM(CASE WHEN type = 'in' AND description LIKE 'Venta %' THEN amount ELSE 0 END), 0) as sales_cash,
         COALESCE(SUM(CASE WHEN type = 'in' AND description LIKE 'Cobranza%' THEN amount ELSE 0 END), 0) as debt_collections,
         COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as manual_expenses
       FROM cash_movements
       WHERE session_id = ?`,
      [session.id],
    )

    const movements = queryAll(
      `SELECT * FROM cash_movements WHERE session_id = ? ORDER BY created_at DESC`,
      [session.id],
    )

    const openingBalance = Number(session.opening_balance || 0)
    const income = Number(totals?.income_total || 0)
    const expenses = Number(totals?.expense_total || 0)
    const expectedBalance = openingBalance + income - expenses

    return {
      ...session,
      movements,
      opening_balance: openingBalance,
      sales_cash: Number(totals?.sales_cash || 0),
      debt_collections: Number(totals?.debt_collections || 0),
      manual_expenses: Number(totals?.manual_expenses || 0),
      income,
      expenses,
      expected_balance: expectedBalance,
      balance: expectedBalance,
    }
  }

  ipcMain.handle('db:cash:currentSession', (_, { user_id } = {}) => {
    return getCurrentSession(Number(user_id || 1))
  })

  ipcMain.handle('db:cash:summary', (_, { user_id } = {}) => {
    const uid = Number(user_id || 1)
    const current = getCurrentSession(uid)
    const lastClosed = queryOne(
      `SELECT *
       FROM cash_sessions
       WHERE status = 'closed' AND (user_id = ? OR user_id IS NULL)
       ORDER BY closing_date DESC, id DESC
       LIMIT 1`,
      [uid],
    )

    return { current, lastClosed }
  })

  ipcMain.handle('db:cash:activeRequired', (_, { user_id } = {}) => {
    const current = getCurrentSession(Number(user_id || 1))
    return { hasOpenSession: !!current, session: current }
  })

  ipcMain.handle('db:cash:openSession', (_, { opening_balance, user_id }) => {
    const uid = Number(user_id || 1)
    const openingBalance = Number(opening_balance || 0)

    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      throw new Error('El monto inicial debe ser un numero valido mayor o igual a 0.')
    }

    const currentOpen = getCurrentSession(uid)
    if (currentOpen) {
      throw new Error('Ya existe una caja abierta para este usuario.')
    }

    run(
      `INSERT INTO cash_sessions (user_id, opening_date, opening_balance, status, opened_at)
       VALUES (?, datetime('now'), ?, 'open', datetime('now'))`,
      [uid, openingBalance],
    )

    const id = lastInsertRowId()
    return { id, opening_balance: openingBalance, status: 'open' }
  })

  ipcMain.handle('db:cash:closeSession', (_, { session_id, real_balance, user_id } = {}) => {
    const uid = Number(user_id || 1)
    const sid = Number(session_id || 0)
    const realBalance = Number(real_balance)

    if (!Number.isFinite(realBalance) || realBalance < 0) {
      throw new Error('El monto real en caja debe ser un numero valido mayor o igual a 0.')
    }

    const session = sid
      ? queryOne(`SELECT * FROM cash_sessions WHERE id = ? AND status = 'open'`, [sid])
      : getCurrentSession(uid)

    if (!session) throw new Error('No existe una caja abierta para cerrar.')

    const current = getCurrentSession(Number(session.user_id || uid))
    if (!current || Number(current.id) !== Number(session.id)) {
      throw new Error('La sesion de caja ya no esta disponible para cierre.')
    }

    const expected = Number(current.expected_balance || 0)
    run(
      `UPDATE cash_sessions
       SET status='closed',
           expected_balance=?,
           real_balance=?,
           closing_balance=?,
           closing_date=datetime('now'),
           closed_at=datetime('now')
       WHERE id=?`,
      [expected, realBalance, realBalance, session.id],
    )

    return {
      id: session.id,
      status: 'closed',
      expected_balance: expected,
      real_balance: realBalance,
      difference: realBalance - expected,
    }
  })

  ipcMain.handle('db:cash:movements', (_, { session_id } = {}) => {
    if (session_id) {
      return queryAll(`SELECT * FROM cash_movements WHERE session_id = ? ORDER BY created_at DESC`, [session_id])
    }
    return queryAll(`SELECT * FROM cash_movements ORDER BY created_at DESC LIMIT 100`)
  })

  ipcMain.handle('db:cash:addMovement', (_, { session_id, type, amount, description }) => {
    const sid = Number(session_id || 0)
    const value = Number(amount || 0)
    if (!sid) throw new Error('session_id es requerido')
    if (!Number.isFinite(value) || value <= 0) throw new Error('El monto debe ser mayor a 0')
    if (!['in', 'out'].includes(type)) throw new Error('Tipo de movimiento invalido')

    const session = queryOne(`SELECT id, status FROM cash_sessions WHERE id = ?`, [sid])
    if (!session || session.status !== 'open') throw new Error('La sesion de caja no esta abierta')

    run(`INSERT INTO cash_movements (session_id, type, amount, description) VALUES (?,?,?,?)`,
      [sid, type, value, description || ''])
    const id = lastInsertRowId()
    return { id, session_id: sid, type, amount: value, description }
  })
}
