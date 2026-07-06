import { useState, useCallback } from 'react'
import { useAsync, useMutation } from './useAsync'
import { productService, categoryService, brandService } from '../services/products'
import { mockProducts, mockCategories } from '../data/mockData'
import { isElectron } from '../services/api'

export function useProducts(filters = {}) {
  const [search, setSearch] = useState(filters.search ?? '')
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? null)
  const [status, setStatus] = useState(filters.status ?? '')

  const { data, loading, error, refetch } = useAsync(
    async () => {
      const result = await productService.list({ search, categoryId, status })
      // Fallback to mock data when running in browser
      if (result === null) return mockProducts.map(p => ({ ...p, stockStatus: p.status }))
      return result
    },
    [search, categoryId, status],
    [],
  )

  const { mutate: createProduct, loading: creating } = useMutation(
    useCallback(async (data) => {
      const result = await productService.create(data)
      await refetch()
      return result
    }, [refetch])
  )

  const { mutate: updateProduct, loading: updating } = useMutation(
    useCallback(async (data) => {
      const result = await productService.update(data)
      await refetch()
      return result
    }, [refetch])
  )

  const { mutate: deleteProduct } = useMutation(
    useCallback(async (id) => {
      await productService.delete(id)
      await refetch()
    }, [refetch])
  )

  return {
    products: data ?? [],
    loading, error, refetch,
    search, setSearch,
    categoryId, setCategoryId,
    status, setStatus,
    createProduct, creating,
    updateProduct, updating,
    deleteProduct,
  }
}

export function useCategories() {
  const { data, loading, refetch } = useAsync(
    async () => {
      const result = await categoryService.list()
      if (result === null) return mockCategories
      return result
    },
    [],
    [],
  )

  const { mutate: createCategory } = useMutation(
    useCallback(async (d) => { await categoryService.create(d); await refetch() }, [refetch])
  )
  const { mutate: updateCategory } = useMutation(
    useCallback(async (d) => { await categoryService.update(d); await refetch() }, [refetch])
  )
  const { mutate: deleteCategory } = useMutation(
    useCallback(async (id) => { await categoryService.delete(id); await refetch() }, [refetch])
  )

  return { categories: data ?? [], loading, refetch, createCategory, updateCategory, deleteCategory }
}
