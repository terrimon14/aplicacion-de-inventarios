import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic async state hook.
 * @param {Function} fn - async function to call
 * @param {any[]} deps - dependency array (re-fetches when these change)
 * @param {any} initialData - initial data value
 */
export function useAsync(fn, deps = [], initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mounted = useRef(true)
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const execute = useCallback(async () => {
    if (!fnRef.current) return
    setLoading(true)
    setError(null)
    try {
      const result = await fnRef.current()
      if (mounted.current) setData(result)
    } catch (err) {
      if (mounted.current) setError(err?.message ?? 'Error desconocido')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    execute()
    return () => { mounted.current = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...deps])

  const refetch = execute

  return { data, loading, error, refetch, setData }
}

/**
 * Mutation hook — for create/update/delete operations.
 * Returns { mutate, loading, error }
 */
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      return result
    } catch (err) {
      const msg = err?.message ?? 'Error al procesar la operación'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { mutate, loading, error }
}
