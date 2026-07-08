import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Input from '../../components/ui/Input'
import { mockCustomers } from '../../data/mockData'
import { formatCurrency, statusColor, statusLabel } from '../../utils/formatters'

export default function Customers() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Clientes']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Clientes</h1>
          <p className="text-sm text-[#5c5e78]">{mockCustomers.length} clientes registrados</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nuevo Cliente</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total clientes', value: mockCustomers.length, color: 'text-indigo-400' },
          { label: 'Activos', value: mockCustomers.filter(c => c.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Total facturado', value: formatCurrency(mockCustomers.reduce((a, c) => a + c.totalSpent, 0)), color: 'text-violet-400' },
        ].map((s, i) => (
          <Card key={i}>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#5c5e78] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <SearchInput
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        <Table>
          <THead>
            <Th>Cliente</Th>
            <Th>Email</Th>
            <Th>Teléfono</Th>
            <Th align="center">Compras</Th>
            <Th align="right">Total gastado</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Acciones</Th>
          </THead>
          <TBody>
            {filtered.map(c => (
              <Tr key={c.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-indigo-400">{c.name[0]}</span>
                    </div>
                    <span className="font-medium text-[#e2e4f0]">{c.name}</span>
                  </div>
                </Td>
                <Td muted>{c.email}</Td>
                <Td muted>{c.phone}</Td>
                <Td align="center" muted>{c.totalPurchases}</Td>
                <Td align="right">
                  <span className="font-semibold text-[#e2e4f0]">{formatCurrency(c.totalSpent)}</span>
                </Td>
                <Td align="center">
                  <Badge color={statusColor[c.status]} dot>{statusLabel[c.status]}</Badge>
                </Td>
                <Td align="center">
                  <div className="flex items-center justify-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-sky-400 hover:bg-sky-500/10 transition-all">
                      <Eye size={13} />
                    </button>
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
        title="Nuevo Cliente"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button>Guardar Cliente</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre completo" placeholder="Ej: Carlos Mendoza" containerClassName="col-span-2" />
          <Input label="Email" placeholder="correo@email.com" type="email" />
          <Input label="Teléfono" placeholder="999-000-111" />
          <Input label="DNI / RUC" placeholder="00000000" />
          <Input label="Dirección" placeholder="Av. Principal 123" />
        </div>
      </Modal>
    </div>
  )
}
