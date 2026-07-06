import { useState, useCallback } from 'react'
import { useAsync, useMutation } from './useAsync'
import { saleService } from '../services/sales'
import { mockSales } from '../data/mockData'

export function useSales(filters = {}) {
  const [search, setSearch] = useState(filters.search ?? '')
  const [status, setStatus] = useState(filters.status ?? '')

  const { data, loading, error, refetch } = useAsync(
    async () => {
      const result = await saleService.list({ search, status })
      if (result === null) return mockSales
      return result
    },
    [search, status],
    [],
  )

  const { mutate: createSale, loading: creating } = useMutation(
    useCallback(async (saleData) => {
      const result = await saleService.create(saleData)
      await refetch()
      return result
    }, [refetch])
  )

  const { mutate: voidSale } = useMutation(
    useCallback(async (id) => {
      await saleService.void(id)
      await refetch()
    }, [refetch])
  )

  return {
    sales: data ?? [],
    loading, error, refetch,
    search, setSearch,
    status, setStatus,
    createSale, creating,
    voidSale,
  }
}
