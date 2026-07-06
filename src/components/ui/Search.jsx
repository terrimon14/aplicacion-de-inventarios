import { Search } from 'lucide-react'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

const SearchInput = forwardRef(function SearchInput({ placeholder = 'Buscar...', className, ...props }, ref) {
  return (
    <div className="relative flex items-center">
      <Search size={14} className="absolute left-3 text-[#5c5e78] pointer-events-none" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={clsx(
          'h-9 bg-[#1e1e27] border border-[#2a2a38] rounded-lg pl-9 pr-3',
          'text-sm text-[#e2e4f0] placeholder:text-[#5c5e78] outline-none',
          'hover:border-[#33334a] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10',
          'transition-all duration-150 w-full',
          className,
        )}
        {...props}
      />
    </div>
  )
})

export default SearchInput
