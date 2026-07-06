import { Minus, Square, X, Maximize2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { isElectron } from '../../services/api'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!isElectron()) return
    window.electron.invoke('window:isMaximized').then(setIsMaximized).catch(() => {})
  }, [])

  const minimize = useCallback(() => {
    if (isElectron()) window.electron.invoke('window:minimize')
  }, [])

  const toggleMaximize = useCallback(() => {
    if (!isElectron()) return
    window.electron.invoke('window:maximize').then(() =>
      window.electron.invoke('window:isMaximized').then(setIsMaximized)
    )
  }, [])

  const close = useCallback(() => {
    if (isElectron()) window.electron.invoke('window:close')
  }, [])

  // Don't render in browser dev mode
  if (!isElectron()) return null

  return (
    <div
      className="flex items-center justify-between h-8 bg-[#0d0d10] border-b border-[#1e1e27] select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* App name */}
      <div className="flex items-center gap-2 px-4">
        <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-indigo-500 to-violet-600" />
        <span className="text-xs text-[#5c5e78] font-medium tracking-wide">Inventario Desktop</span>
      </div>

      {/* Window Controls — no drag */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={minimize}
          className="w-11 h-8 flex items-center justify-center text-[#5c5e78] hover:text-[#e2e4f0] hover:bg-[#1e1e27] transition-all"
          title="Minimizar"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={toggleMaximize}
          className="w-11 h-8 flex items-center justify-center text-[#5c5e78] hover:text-[#e2e4f0] hover:bg-[#1e1e27] transition-all"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? <Square size={11} /> : <Maximize2 size={11} />}
        </button>
        <button
          onClick={close}
          className="w-11 h-8 flex items-center justify-center text-[#5c5e78] hover:text-white hover:bg-rose-600 transition-all"
          title="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
