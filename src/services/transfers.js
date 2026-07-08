import { invoke } from './api'

export const transferService = {
  list: () => invoke('db:transfers:list'),
  create: (data) => invoke('db:transfers:create', data),
}
