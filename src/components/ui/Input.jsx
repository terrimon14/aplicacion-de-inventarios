import { clsx } from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
  className,
  containerClassName,
  size = 'md',
  ...props
}, ref) {
  const sizes = {
    sm: 'h-8 text-xs px-3',
    md: 'h-9 text-sm px-3',
    lg: 'h-11 text-base px-4',
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-[#9496b0]">{label}</label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-[#5c5e78] pointer-events-none">
            <Icon size={14} />
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-[#1e1e27] border rounded-lg text-[#e2e4f0] placeholder:text-[#5c5e78]',
            'outline-none transition-all duration-150',
            'focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10',
            error
              ? 'border-rose-500/50 focus:border-rose-500/60'
              : 'border-[#2a2a38] hover:border-[#33334a]',
            sizes[size] ?? sizes.md,
            Icon && 'pl-9',
            IconRight && 'pr-9',
            className,
          )}
          {...props}
        />
        {IconRight && (
          <span className="absolute right-3 text-[#5c5e78] pointer-events-none">
            <IconRight size={14} />
          </span>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[#5c5e78]">{hint}</p>}
    </div>
  )
})

export default Input

export function Select({ label, error, className, containerClassName, children, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && <label className="text-xs font-medium text-[#9496b0]">{label}</label>}
      <select
        className={clsx(
          'h-9 w-full bg-[#1e1e27] border border-[#2a2a38] rounded-lg',
          'text-sm text-[#e2e4f0] px-3 outline-none cursor-pointer',
          'hover:border-[#33334a] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10',
          'transition-all duration-150',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, containerClassName, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && <label className="text-xs font-medium text-[#9496b0]">{label}</label>}
      <textarea
        className={clsx(
          'w-full bg-[#1e1e27] border border-[#2a2a38] rounded-lg',
          'text-sm text-[#e2e4f0] placeholder:text-[#5c5e78] px-3 py-2.5',
          'outline-none resize-none transition-all duration-150',
          'hover:border-[#33334a] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
