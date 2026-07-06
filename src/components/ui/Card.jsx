import { clsx } from 'clsx'

export default function Card({ children, className, padding = true, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-[#252530] border border-[#2a2a38] rounded-xl',
        padding && 'p-5',
        hover && 'hover:border-[#33334a] hover:bg-[#2a2a36] cursor-pointer',
        'transition-all duration-150',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-sm font-semibold text-[#e2e4f0]', className)}>
      {children}
    </h3>
  )
}

export function CardSubtitle({ children, className }) {
  return (
    <p className={clsx('text-xs text-[#5c5e78] mt-0.5', className)}>
      {children}
    </p>
  )
}
