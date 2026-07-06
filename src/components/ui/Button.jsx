import { clsx } from 'clsx'

const variants = {
  primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20',
  secondary: 'bg-[#2a2a36] hover:bg-[#33334a] text-[#e2e4f0] border border-[#2a2a38]',
  ghost: 'bg-transparent hover:bg-[#2a2a36] text-[#9496b0] hover:text-[#e2e4f0]',
  danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20',
  success: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20',
  outline: 'bg-transparent border border-[#2a2a38] hover:border-indigo-500/50 text-[#9496b0] hover:text-indigo-400',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium cursor-pointer',
        'transition-all duration-150 active:scale-95 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 15} strokeWidth={2} />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight size={14} strokeWidth={2} />
      )}
    </button>
  )
}
