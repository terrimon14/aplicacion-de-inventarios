import Breadcrumb from '../../components/ui/Breadcrumb'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { Plus } from 'lucide-react'

export default function Invoices() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Ventas', 'Facturas']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Facturas</h1>
          <p className="text-sm text-[#5c5e78]">Gestiona boletas y facturas electrónicas</p>
        </div>
        <Button size="sm" icon={Plus}>Nueva Factura</Button>
      </div>
      <Card>
        <EmptyState
          title="No hay facturas"
          description="Las facturas generadas aparecerán aquí"
        />
      </Card>
    </div>
  )
}
