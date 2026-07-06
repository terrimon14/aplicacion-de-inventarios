import { clsx } from 'clsx'

export default function Table({ children, className }) {
  return (
    <div className={clsx('w-full overflow-auto', className)}>
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead>
      <tr className="border-b border-[#2a2a38]">
        {children}
      </tr>
    </thead>
  )
}

export function Th({ children, className, align = 'left' }) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-xs font-semibold text-[#5c5e78] uppercase tracking-wider whitespace-nowrap',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-[#2a2a38]/60">{children}</tbody>
}

export function Tr({ children, className, onClick }) {
  return (
    <tr
      className={clsx(
        'group transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-[#2a2a36]' : 'hover:bg-[#252530]/50',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className, align = 'left', muted = false }) {
  return (
    <td
      className={clsx(
        'px-4 py-3 whitespace-nowrap',
        muted ? 'text-[#5c5e78]' : 'text-[#e2e4f0]',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}
