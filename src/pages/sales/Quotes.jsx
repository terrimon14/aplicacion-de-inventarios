import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Plus, FileText } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'

export default function Quotes() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Ventas', 'Cotizaciones']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Cotizaciones</h1>
          <p className="text-sm text-[#5c5e78]">Gestiona proformas y cotizaciones</p>
        </div>
        <Button size="sm" icon={Plus}>Nueva Cotización</Button>
      </div>
      <Card>
        <EmptyState
          title="No hay cotizaciones"
          description="Crea tu primera cotización para comenzar"
          action={<Button size="sm" icon={Plus}>Nueva Cotización</Button>}
        />
      </Card>
    </div>
  )
}
