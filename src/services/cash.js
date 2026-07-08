import { invoke } from './api'

export const cashService = {
  currentSession: (userId = 1) => invoke('db:cash:currentSession', { user_id: userId }),
  summary: (userId = 1) => invoke('db:cash:summary', { user_id: userId }),
  activeRequired: (userId = 1) => invoke('db:cash:activeRequired', { user_id: userId }),
  openSession: ({ opening_balance, user_id = 1 }) =>
    invoke('db:cash:openSession', { opening_balance, user_id }),
  closeSession: ({ session_id, real_balance, user_id = 1 }) =>
    invoke('db:cash:closeSession', { session_id, real_balance, user_id }),
  movements: ({ session_id } = {}) => invoke('db:cash:movements', { session_id }),
  addMovement: ({ session_id, type = 'out', amount, description }) =>
    invoke('db:cash:addMovement', { session_id, type, amount, description }),
}
