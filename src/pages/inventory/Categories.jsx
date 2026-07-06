import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { mockCategories } from '../../data/mockData'

export default function Categories() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Inventario', 'Categorías']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Categorías</h1>
          <p className="text-sm text-[#5c5e78]">{mockCategories.length} categorías registradas</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>Nueva Categoría</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {mockCategories.map(cat => (
          <Card key={cat.id} hover className="group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/12 flex items-center justify-center">
                <Tag size={18} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 flex items-center justify-center rounded text-[#5c5e78] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                  <Edit2 size={12} />
                </button>
                <button className="w-6 h-6 flex items-center justify-center rounded text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#e2e4f0]">{cat.name}</p>
            <p className="text-xs text-[#5c5e78] mt-1">{cat.products} productos</p>
          </Card>
        ))}

        {/* Add new card */}
        <button
          onClick={() => setShowModal(true)}
          className="min-h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2a2a38] hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[#5c5e78] hover:text-indigo-400 transition-all"
        >
          <Plus size={20} />
          <span className="text-xs font-medium">Nueva categoría</span>
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Categoría"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button>Guardar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nombre de la categoría" placeholder="Ej: Laptops" />
          <Input label="Descripción (opcional)" placeholder="Descripción breve..." />
        </div>
      </Modal>
    </div>
  )
}
