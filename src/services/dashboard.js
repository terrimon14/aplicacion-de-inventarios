import { invoke } from './api'

export const dashboardService = {
  stats: () => invoke('db:dashboard:stats'),
  recentActivity: () => invoke('db:dashboard:recentActivity'),
}

export const reportService = {
  sales: (filters = {}) => invoke('db:reports:sales', filters),
  purchases: (filters = {}) => invoke('db:reports:purchases', filters),
  profits: (filters = {}) => invoke('db:reports:profits', filters),
  summary: (filters = {}) => invoke('db:reports:summary', filters),
  topProducts: (filters = {}) => invoke('db:reports:topProducts', filters),
  inventory: (filters = {}) => invoke('db:reports:inventory', filters),
}

export const cashService = {
  currentSession: () => invoke('db:cash:currentSession'),
  openSession: (data) => invoke('db:cash:openSession', data),
  closeSession: (data) => invoke('db:cash:closeSession', data),
  movements: (data) => invoke('db:cash:movements', data),
  addMovement: (data) => invoke('db:cash:addMovement', data),
}

export const purchaseService = {
  list: (filters = {}) => invoke('db:purchases:list', filters),
  get: (id) => invoke('db:purchases:get', id),
  create: (data) => invoke('db:purchases:create', data),
}

export const userService = {
  list: () => invoke('db:users:list'),
  create: (data) => invoke('db:users:create', data),
  update: (data) => invoke('db:users:update', data),
  delete: (id) => invoke('db:users:delete', id),
}
