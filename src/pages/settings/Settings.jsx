import { Building2, Printer, Palette, Globe, Save } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Breadcrumb from '../../components/ui/Breadcrumb'

export default function Settings() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Configuración']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Configuración</h1>
        <p className="text-sm text-[#5c5e78]">Ajustes del sistema e información de la empresa</p>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-indigo-400" />
            <div>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardSubtitle>Datos que aparecen en comprobantes</CardSubtitle>
            </div>
          </div>
          <Button size="sm" icon={Save}>Guardar</Button>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Razón social" defaultValue="Mi Empresa SAC" />
          <Input label="RUC" defaultValue="20000000000" />
          <Input label="Dirección" defaultValue="Av. Principal 123, Lima" />
          <Input label="Teléfono" defaultValue="01-234-5678" />
          <Input label="Email" defaultValue="contacto@empresa.com" type="email" />
          <Input label="Sitio web" defaultValue="www.empresa.com" />
        </div>
      </Card>

      {/* General */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-sky-400" />
            <div>
              <CardTitle>Configuración General</CardTitle>
              <CardSubtitle>Moneda, zona horaria y otros ajustes</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Moneda" defaultValue="PEN">
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
          </Select>
          <Select label="Zona horaria">
            <option>America/Lima</option>
            <option>America/Bogota</option>
          </Select>
          <Input label="IGV (%)" defaultValue="18" type="number" />
          <Select label="Formato de fecha">
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
          </Select>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-violet-400" />
            <div>
              <CardTitle>Apariencia</CardTitle>
              <CardSubtitle>Tema y personalización visual</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-3">
          {[
            { id: 'dark', label: 'Oscuro', bg: 'bg-[#0d0d10]', border: 'border-indigo-500' },
            { id: 'dim', label: 'Tenue', bg: 'bg-[#1a1b2e]', border: 'border-[#2a2a38]' },
          ].map(theme => (
            <button
              key={theme.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${theme.border} transition-all`}
            >
              <div className={`w-20 h-12 rounded-lg ${theme.bg} border border-[#2a2a38]`} />
              <span className="text-xs text-[#9496b0] font-medium">{theme.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
