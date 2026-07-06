import { invoke } from './api'

export const saleService = {
  list: (filters = {}) => invoke('db:sales:list', filters),
  get: (id) => invoke('db:sales:get', id),
  create: (data) => invoke('db:sales:create', data),
  void: (id) => invoke('db:sales:void', id),
}
