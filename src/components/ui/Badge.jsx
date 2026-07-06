import { clsx } from 'clsx'

const colors = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export default function Badge({ children, color = 'slate', dot = false, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        colors[color] ?? colors.slate,
        className,
      )}
    >
      {dot && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full',
          color === 'emerald' && 'bg-emerald-400',
          color === 'rose' && 'bg-rose-400',
          color === 'amber' && 'bg-amber-400',
          color === 'sky' && 'bg-sky-400',
          color === 'indigo' && 'bg-indigo-400',
          color === 'violet' && 'bg-violet-400',
          color === 'slate' && 'bg-slate-400',
        )} />
      )}
      {children}
    </span>
  )
}
