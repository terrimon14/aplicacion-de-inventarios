import { invoke } from './api'

export const customerService = {
  list: (filters = {}) => invoke('db:customers:list', filters),
  get: (id) => invoke('db:customers:get', id),
  create: (data) => invoke('db:customers:create', data),
  update: (data) => invoke('db:customers:update', data),
  delete: (id) => invoke('db:customers:delete', id),
}

export const supplierService = {
  list: (filters = {}) => invoke('db:suppliers:list', filters),
  get: (id) => invoke('db:suppliers:get', id),
  create: (data) => invoke('db:suppliers:create', data),
  update: (data) => invoke('db:suppliers:update', data),
  delete: (id) => invoke('db:suppliers:delete', id),
}
