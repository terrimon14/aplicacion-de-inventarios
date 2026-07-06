import { ChevronRight, Home } from 'lucide-react'
import { clsx } from 'clsx'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-[#5c5e78]">
      <Home size={12} />
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight size={11} className="opacity-50" />
          <span
            className={clsx(
              idx === items.length - 1
                ? 'text-[#9496b0] font-medium'
                : 'hover:text-[#9496b0] cursor-pointer transition-colors',
            )}
          >
            {item}
          </span>
        </span>
      ))}
    </nav>
  )
}
