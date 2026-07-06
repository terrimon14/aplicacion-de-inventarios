import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

const variants = {
  info: {
    container: 'bg-sky-500/8 border-sky-500/25 text-sky-300',
    icon: Info,
    iconClass: 'text-sky-400',
  },
  success: {
    container: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
  },
  warning: {
    container: 'bg-amber-500/8 border-amber-500/25 text-amber-300',
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
  },
  error: {
    container: 'bg-rose-500/8 border-rose-500/25 text-rose-300',
    icon: XCircle,
    iconClass: 'text-rose-400',
  },
}

export default function Alert({ type = 'info', title, children, onClose, className }) {
  const v = variants[type] ?? variants.info
  const Icon = v.icon

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm',
        v.container,
        className,
      )}
    >
      <Icon size={16} className={clsx('mt-0.5 shrink-0', v.iconClass)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <p className="opacity-80">{children}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
