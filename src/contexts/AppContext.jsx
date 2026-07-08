import { createContext, useContext, useState, useCallback } from 'react'
import { mainNavItems, bottomNavItems } from '../data/menuConfig'

const AppContext = createContext(null)

const allNavItems = [...mainNavItems, ...bottomNavItems]

export function AppProvider({ children }) {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Stock bajo detectado', message: '47 productos con stock bajo', type: 'warning', read: false },
    { id: 2, title: 'Venta completada', message: 'Venta #0892 procesada exitosamente', type: 'success', read: false },
    { id: 3, title: 'Producto agotado', message: 'Sony Google TV 65" sin stock', type: 'error', read: false },
  ])

  const activeNavItem = allNavItems.find(item => item.id === activeModule)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      activeModule,
      setActiveModule,
      sidebarCollapsed,
      toggleSidebar,
      notifications,
      markNotificationRead,
      unreadCount,
      activeNavItem,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
