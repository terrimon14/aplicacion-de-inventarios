import { useState } from 'react'
import { Plus, Edit2, Trash2, Shield, UserCog } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Input, { Select } from '../../components/ui/Input'

const mockUsers = [
  { id: 1, name: 'Admin Principal', email: 'admin@empresa.com', role: 'Administrador', lastLogin: '2026-07-06', status: 'active' },
  { id: 2, name: 'María Vendedora', email: 'maria@empresa.com', role: 'Vendedor', lastLogin: '2026-07-05', status: 'active' },
  { id: 3, name: 'Juan Almacén', email: 'juan@empresa.com', role: 'Almacenero', lastLogin: '2026-07-03', status: 'inactive' },
]

const roleColors = { Administrador: 'violet', Vendedor: 'sky', Almacenero: 'emerald' }

export default function Users() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Usuarios']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Usuarios del Sistema</h1>
          <p className="text-sm text-[#5c5e78]">{mockUsers.length} usuarios registrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Shield}>Roles</Button>
          <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nuevo Usuario</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total usuarios', value: mockUsers.length, color: 'text-indigo-400' },
          { label: 'Activos', value: mockUsers.filter(u => u.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Roles', value: 3, color: 'text-violet-400' },
        ].map((s, i) => (
          <Card key={i}>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#5c5e78] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <Table>
          <THead>
            <Th>Usuario</Th>
            <Th>Email</Th>
            <Th align="center">Rol</Th>
            <Th>Último acceso</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Acciones</Th>
          </THead>
          <TBody>
            {mockUsers.map(u => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-400">{u.name[0]}</span>
                    </div>
                    <span className="font-medium text-[#e2e4f0]">{u.name}</span>
                  </div>
                </Td>
                <Td muted>{u.email}</Td>
                <Td align="center">
                  <Badge color={roleColors[u.role] ?? 'slate'}>{u.role}</Badge>
                </Td>
                <Td muted>{u.lastLogin}</Td>
                <Td align="center">
                  <Badge color={u.status === 'active' ? 'emerald' : 'slate'} dot>
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
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
        title="Nuevo Usuario"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button>Crear Usuario</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nombre completo" placeholder="Ej: María García" />
          <Input label="Email" placeholder="usuario@empresa.com" type="email" />
          <Select label="Rol">
            <option>Administrador</option>
            <option>Vendedor</option>
            <option>Almacenero</option>
          </Select>
          <Input label="Contraseña temporal" placeholder="••••••••" type="password" />
        </div>
      </Modal>
    </div>
  )
}
