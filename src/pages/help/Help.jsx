import { HelpCircle, BookOpen, Keyboard, Info, ExternalLink } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Breadcrumb from '../../components/ui/Breadcrumb'

const shortcuts = [
  { keys: ['Ctrl', 'K'], action: 'Búsqueda rápida' },
  { keys: ['Ctrl', 'N'], action: 'Nueva venta' },
  { keys: ['Ctrl', 'P'], action: 'Nuevo producto' },
  { keys: ['Esc'], action: 'Cerrar modal' },
  { keys: ['Ctrl', ','], action: 'Configuración' },
]

export default function Help() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Ayuda']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Centro de Ayuda</h1>
        <p className="text-sm text-[#5c5e78]">Documentación y guías del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: BookOpen, title: 'Documentación', desc: 'Guías detalladas del sistema', color: 'indigo' },
          { icon: Keyboard, title: 'Atajos', desc: 'Acciones rápidas de teclado', color: 'sky' },
          { icon: Info, title: 'Acerca de', desc: 'Versión y licencias', color: 'violet' },
        ].map(({ icon: Icon, title, desc, color }, i) => {
          const colorMap = { indigo: 'bg-indigo-500/12 text-indigo-400', sky: 'bg-sky-500/12 text-sky-400', violet: 'bg-violet-500/12 text-violet-400' }
          const [bg, text] = colorMap[color].split(' ')
          return (
            <Card key={i} hover>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={text} />
              </div>
              <p className="text-sm font-semibold text-[#e2e4f0]">{title}</p>
              <p className="text-xs text-[#5c5e78] mt-1">{desc}</p>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard size={15} className="text-sky-400" />
            <CardTitle>Atajos de teclado</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a38]/50 last:border-0">
              <span className="text-sm text-[#9496b0]">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="px-2 py-0.5 bg-[#2a2a36] border border-[#33334a] rounded-md text-xs font-mono text-[#9496b0]">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={15} className="text-violet-400" />
            <CardTitle>Acerca del sistema</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {[
            ['Aplicación', 'Sistema de Inventario Desktop'],
            ['Versión', '1.0.0-beta'],
            ['Tecnología', 'Electron + React + Tailwind CSS'],
            ['Base de datos', 'SQLite (próximamente)'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-[#2a2a38]/50 last:border-0">
              <span className="text-[#5c5e78]">{label}</span>
              <span className="text-[#9496b0] font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
