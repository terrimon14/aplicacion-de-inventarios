import { useState } from 'react'
import { Plus, Edit2, Trash2, BadgeInfo } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { brandService } from '../../services/products'

export default function Brands() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { data: brands = [], refetch } = useAsync(
    async () => {
      const result = await brandService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const openCreate = () => {
    setEditing(null)
    setName('')
    setMessage('')
    setShowModal(true)
  }

  const openEdit = (brand) => {
    setEditing(brand)
    setName(brand.name || '')
    setMessage('')
    setShowModal(true)
  }

  const saveBrand = async () => {
    if (!name.trim()) {
      setMessage('El nombre de la marca es obligatorio.')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      if (editing?.id) {
        await brandService.update({ id: editing.id, name: name.trim() })
      } else {
        await brandService.create({ name: name.trim() })
      }
      await refetch()
      setShowModal(false)
      setName('')
    } catch (error) {
      setMessage(error.message || 'No se pudo guardar la marca.')
    } finally {
      setSaving(false)
    }
  }

  const removeBrand = async (brandId) => {
    if (!window.confirm('¿Eliminar esta marca?')) return
    await brandService.delete(brandId)
    await refetch()
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Inventario', 'Marcas']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Marcas</h1>
          <p className="text-sm text-[#5c5e78]">Gestiona las marcas de televisores y accesorios</p>
        </div>
        <Button size="sm" icon={Plus} onClick={openCreate}>Nueva Marca</Button>
      </div>

      <Card>
        <Table>
          <THead>
            <Th>Marca</Th>
            <Th align="center">Productos asociados</Th>
            <Th align="center">Acciones</Th>
          </THead>
          <TBody>
            {brands.length === 0 ? (
              <Tr>
                <Td colSpan={3} className="text-center text-[#5c5e78]">No hay marcas registradas.</Td>
              </Tr>
            ) : brands.map((brand) => (
              <Tr key={brand.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <BadgeInfo size={14} className="text-indigo-300" />
                    <span className="font-medium text-[#e2e4f0]">{brand.name}</span>
                  </div>
                </Td>
                <Td align="center" muted>{brand.product_count || 0}</Td>
                <Td align="center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(brand)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => removeBrand(brand.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
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
        title={editing ? 'Editar Marca' : 'Nueva Marca'}
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button loading={saving} onClick={saveBrand}>Guardar</Button>
          </>
        )}
      >
        <div className="space-y-4">
          {message && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {message}
            </div>
          )}
          <Input
            label="Nombre de la marca"
            placeholder="Ej: Samsung"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
