import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-[#5c5e78]">
        Mostrando <span className="text-[#9496b0]">{start}–{end}</span> de <span className="text-[#9496b0]">{totalItems}</span> registros
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9496b0] hover:bg-[#2a2a36] hover:text-[#e2e4f0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={clsx(
              'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all',
              p === page
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-[#9496b0] hover:bg-[#2a2a36] hover:text-[#e2e4f0]',
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9496b0] hover:bg-[#2a2a36] hover:text-[#e2e4f0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
