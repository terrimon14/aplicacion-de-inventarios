import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useApp } from '../../contexts/AppContext'
import { mainNavItems, bottomNavItems } from '../../data/menuConfig'

export default function Sidebar() {
  const { activeModule, setActiveModule } = useApp()
  const navigate = useNavigate()

  const handleNav = (item) => {
    setActiveModule(item.id)
    navigate(item.path)
  }

  return (
    <aside className="w-16 bg-[#131318] border-r border-[#2a2a38] flex flex-col items-center py-3 shrink-0 select-none">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25 shrink-0">
        <span className="text-white font-bold text-sm">IN</span>
      </div>

      <div className="w-full px-2 mb-2">
        <div className="h-px bg-[#2a2a38]" />
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              title={item.label}
              className={clsx(
                'w-full h-10 flex items-center justify-center rounded-xl transition-all duration-150 group relative',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-[#5c5e78] hover:bg-[#1e1e27] hover:text-[#9496b0]',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          )
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="w-full px-2 mb-2">
        <div className="h-px bg-[#2a2a38]" />
      </div>
      <nav className="flex flex-col items-center gap-1 w-full px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              title={item.label}
              className={clsx(
                'w-full h-10 flex items-center justify-center rounded-xl transition-all duration-150 relative',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-[#5c5e78] hover:bg-[#1e1e27] hover:text-[#9496b0]',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
