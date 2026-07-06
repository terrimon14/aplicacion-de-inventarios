import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Sin resultados', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#2a2a36] flex items-center justify-center">
        <Inbox size={24} className="text-[#5c5e78]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#9496b0]">{title}</p>
        {description && (
          <p className="text-xs text-[#5c5e78] mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
