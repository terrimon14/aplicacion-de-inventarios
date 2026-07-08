import { useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Plus } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

export default function Quotes() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Ventas', 'Cotizaciones']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Cotizaciones</h1>
          <p className="text-sm text-[#5c5e78]">Gestiona proformas y cotizaciones</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nueva Cotización</Button>
      </div>
      <Card>
        <EmptyState
          title="No hay cotizaciones"
          description="Crea tu primera cotización para comenzar"
          action={<Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nueva Cotización</Button>}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Cotización"
        size="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={() => setShowModal(false)}>Guardar Cotización</Button>
          </>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Cliente" placeholder="Nombre del cliente" containerClassName="md:col-span-2" />
          <Input label="Fecha de vigencia" type="date" />
          <Input label="Monto estimado" type="number" placeholder="0.00" />
          <Input label="Observaciones" placeholder="Detalle de la cotización" containerClassName="md:col-span-2" />
        </div>
      </Modal>
    </div>
  )
}
