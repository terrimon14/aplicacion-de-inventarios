import { invoke } from './api'

export const dashboardService = {
  stats: () => invoke('db:dashboard:stats'),
  recentActivity: () => invoke('db:dashboard:recentActivity'),
}

export const reportService = {
  sales: (filters = {}) => invoke('db:reports:sales', filters),
  topProducts: () => invoke('db:reports:topProducts'),
  inventory: () => invoke('db:reports:inventory'),
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
