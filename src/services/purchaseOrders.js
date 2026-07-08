import { invoke } from './api'

export const purchaseOrderService = {
  list: () => invoke('db:purchaseOrders:list'),
  get: (id) => invoke('db:purchaseOrders:get', id),
  suggestByLowStock: (filters = {}) => invoke('db:purchaseOrders:suggest', filters),
  create: (data) => invoke('db:purchaseOrders:create', data),
  receive: (id) => invoke('db:purchaseOrders:receive', id),
}
