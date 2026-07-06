import { useState } from 'react'
import { Plus, Edit2, Trash2, Truck } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Input from '../../components/ui/Input'
import { statusColor, statusLabel } from '../../utils/formatters'

const mockSuppliers = [
  { id: 1, name: 'TechCorp SAC', contact: 'Jorge Lima', email: 'ventas@techcorp.com', phone: '01-234-5678', products: 48, status: 'active' },
  { id: 2, name: 'DistribuPeru', contact: 'Ana Ramos', email: 'info@distribuperu.com', phone: '01-345-6789', products: 32, status: 'active' },
  { id: 3, name: 'ImportaTech', contact: 'Miguel Torres', email: 'compras@importatech.com', phone: '01-456-7890', products: 15, status: 'inactive' },
]

export default function Suppliers() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = mockSuppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Proveedores']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Proveedores</h1>
          <p className="text-sm text-[#5c5e78]">{mockSuppliers.length} proveedores registrados</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nuevo Proveedor</Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchInput
            placeholder="Buscar proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <THead>
            <Th>Proveedor</Th>
            <Th>Contacto</Th>
            <Th>Email</Th>
            <Th>Teléfono</Th>
            <Th align="center">Productos</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Acciones</Th>
          </THead>
          <TBody>
            {filtered.map(s => (
              <Tr key={s.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/12 flex items-center justify-center shrink-0">
                      <Truck size={14} className="text-sky-400" />
                    </div>
                    <span className="font-medium text-[#e2e4f0]">{s.name}</span>
                  </div>
                </Td>
                <Td muted>{s.contact}</Td>
                <Td muted>{s.email}</Td>
                <Td muted>{s.phone}</Td>
                <Td align="center" muted>{s.products}</Td>
                <Td align="center">
                  <Badge color={statusColor[s.status]} dot>{statusLabel[s.status]}</Badge>
                </Td>
                <Td align="center">
                  <div className="flex items-center justify-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                      <Edit2 size={13} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Proveedor"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button>Guardar Proveedor</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Razón social" placeholder="Ej: TechCorp SAC" containerClassName="col-span-2" />
          <Input label="Nombre de contacto" placeholder="Ej: Jorge Lima" />
          <Input label="Teléfono" placeholder="01-000-0000" />
          <Input label="Email" placeholder="ventas@empresa.com" type="email" />
          <Input label="RUC" placeholder="20000000000" />
          <Input label="Dirección" placeholder="Av. Industrial 100" containerClassName="col-span-2" />
        </div>
      </Modal>
    </div>
  )
}
