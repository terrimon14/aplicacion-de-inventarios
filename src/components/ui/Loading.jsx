export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-sm text-[#5c5e78]">{text}</p>
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-sm rounded-xl">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
}
