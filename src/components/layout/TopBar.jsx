import { Bell, Search, Maximize2, Minimize2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { useApp } from '../../contexts/AppContext'
import { mainNavItems, bottomNavItems } from '../../data/menuConfig'

const allNavItems = [...mainNavItems, ...bottomNavItems]

export default function TopBar() {
  const { activeModule, unreadCount, notifications, markNotificationRead } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const activeNavItem = allNavItems.find(i => i.id === activeModule)

  const notifColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    info: 'text-sky-400',
  }

  return (
    <header className="h-12 bg-[#131318] border-b border-[#2a2a38] flex items-center px-4 gap-4 shrink-0 select-none">
      {/* Breadcrumb / Title */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {activeNavItem?.icon && (
          <activeNavItem.icon size={15} className="text-[#5c5e78] shrink-0" strokeWidth={1.8} />
        )}
        <span className="text-sm font-medium text-[#9496b0] truncate">
          {activeNavItem?.label ?? 'Dashboard'}
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Search */}
        <button className="hidden md:flex items-center gap-2 h-7 px-3 bg-[#1e1e27] border border-[#2a2a38] rounded-lg text-xs text-[#5c5e78] hover:text-[#9496b0] hover:border-[#33334a] transition-all">
          <Search size={12} />
          <span>Buscar</span>
          <kbd className="px-1 py-0.5 bg-[#2a2a36] rounded text-[10px] font-mono">Ctrl+K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(prev => !prev)}
            className={clsx(
              'relative w-8 h-8 flex items-center justify-center rounded-lg transition-all',
              showNotifs
                ? 'bg-[#2a2a36] text-[#e2e4f0]'
                : 'text-[#5c5e78] hover:bg-[#1e1e27] hover:text-[#9496b0]',
            )}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse-soft" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-[#1e1e27] border border-[#2a2a38] rounded-xl shadow-2xl shadow-black/40 z-50 animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a38]">
                <span className="text-sm font-semibold text-[#e2e4f0]">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 text-xs rounded-full font-medium">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#2a2a38]/60">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#2a2a36] transition-colors text-left"
                  >
                    <div className={clsx(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      !n.read && 'bg-indigo-400',
                      n.read && 'bg-transparent',
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className={clsx(
                        'text-xs font-medium',
                        notifColors[n.type] ?? 'text-[#9496b0]',
                      )}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[#5c5e78] mt-0.5 truncate">{n.message}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg hover:bg-[#1e1e27] transition-all group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-xs text-[#9496b0] group-hover:text-[#e2e4f0] hidden sm:block font-medium">Admin</span>
          <ChevronDown size={11} className="text-[#5c5e78]" />
        </button>
      </div>
    </header>
  )
}
