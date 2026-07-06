import { invoke } from './api'

export const productService = {
  list: (filters = {}) => invoke('db:products:list', filters),
  get: (id) => invoke('db:products:get', id),
  create: (data) => invoke('db:products:create', data),
  update: (data) => invoke('db:products:update', data),
  delete: (id) => invoke('db:products:delete', id),
  updateStock: (id, delta) => invoke('db:products:updateStock', { id, delta }),
}

export const categoryService = {
  list: () => invoke('db:categories:list'),
  create: (data) => invoke('db:categories:create', data),
  update: (data) => invoke('db:categories:update', data),
  delete: (id) => invoke('db:categories:delete', id),
}

export const brandService = {
  list: () => invoke('db:brands:list'),
  create: (data) => invoke('db:brands:create', data),
  update: (data) => invoke('db:brands:update', data),
  delete: (id) => invoke('db:brands:delete', id),
}
