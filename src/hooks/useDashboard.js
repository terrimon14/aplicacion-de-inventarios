import { useCallback, useEffect } from 'react'
import { useAsync, useMutation } from './useAsync'
import { dashboardService } from '../services/dashboard'
import { mockStats, mockRecentActivity, mockSalesChart } from '../data/mockData'

export function useDashboard() {
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useAsync(
    async () => {
      const result = await dashboardService.stats()
      if (result === null) return { ...mockStats, salesChart: mockSalesChart }
      return result
    },
    [],
    null,
  )

  const { data: activity, loading: activityLoading, refetch: refetchActivity } = useAsync(
    async () => {
      const result = await dashboardService.recentActivity()
      if (result === null) return mockRecentActivity
      return result
    },
    [],
    [],
  )

  const refetch = useCallback(() => {
    refetchStats()
    refetchActivity()
  }, [refetchStats, refetchActivity])

  useEffect(() => {
    const onDataChanged = () => {
      refetch()
    }

    window.addEventListener('app:data:changed', onDataChanged)
    return () => window.removeEventListener('app:data:changed', onDataChanged)
  }, [refetch])

  return {
    stats,
    activity: activity ?? [],
    loading: statsLoading || activityLoading,
    refetch,
  }
}
