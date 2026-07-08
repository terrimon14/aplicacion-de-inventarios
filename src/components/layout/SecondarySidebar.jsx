import { useNavigate, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useApp } from '../../contexts/AppContext'
import { secondaryMenus, mainNavItems, bottomNavItems } from '../../data/menuConfig'

const allNavItems = [...mainNavItems, ...bottomNavItems]

export default function SecondarySidebar() {
  const { activeModule } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = secondaryMenus[activeModule] ?? []
  const navItem = allNavItems.find(item => item.id === activeModule)

  if (!menuItems.length) return null

  return (
    <aside className="w-52 bg-[#18181f] border-r border-[#2a2a38] flex flex-col shrink-0 animate-slide-left">
      {/* Module header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-1">
          {navItem?.icon && (
            <navItem.icon size={16} className="text-indigo-400" strokeWidth={2} />
          )}
          <h2 className="text-sm font-semibold text-[#e2e4f0]">
            {navItem?.label ?? 'Módulo'}
          </h2>
        </div>
        <div className="h-px bg-[#2a2a38] mt-3" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left',
                isActive
                  ? 'bg-indigo-500/12 text-indigo-300 font-medium'
                  : 'text-[#9496b0] hover:bg-[#1e1e27] hover:text-[#e2e4f0]',
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs rounded-md bg-amber-500/15 text-amber-400 font-medium">
                  !
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
