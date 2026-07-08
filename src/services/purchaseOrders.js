import { invoke } from './api'

export const purchaseOrderService = {
  list: () => invoke('db:purchaseOrders:list'),
  suggestByLowStock: (filters = {}) => invoke('db:purchaseOrders:suggest', filters),
  create: (data) => invoke('db:purchaseOrders:create', data),
}
