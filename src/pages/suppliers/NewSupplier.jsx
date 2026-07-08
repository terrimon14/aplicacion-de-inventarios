import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { supplierService } from '../../services/customers'

export default function NewSupplier() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    contact: '',
    ruc: '',
    email: '',
    phone: '',
    address: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveSupplier = async () => {
    if (!form.name.trim()) {
      setMessage('La razón social es obligatoria.')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      await supplierService.create(form)
      navigate('/suppliers')
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar el proveedor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-4xl">
      <div>
        <Breadcrumb items={['Proveedores', 'Nuevo Proveedor']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Nuevo Proveedor</h1>
        <p className="text-sm text-[#5c5e78]">Registrar proveedor para abastecimiento del inventario</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Datos del Proveedor</CardTitle>
            <CardSubtitle>Completa la información comercial y de contacto</CardSubtitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Razón social" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ej: Distribuidora TV Perú SAC" containerClassName="md:col-span-2" />
          <Input label="Persona de contacto" value={form.contact} onChange={(e) => updateField('contact', e.target.value)} placeholder="Ej: Jorge Lima" />
          <Input label="RUC" value={form.ruc} onChange={(e) => updateField('ruc', e.target.value)} placeholder="20000000000" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="ventas@empresa.com" />
          <Input label="Teléfono" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="019990001" />
          <Input label="Dirección" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Av. Industrial 100" containerClassName="md:col-span-2" />
        </div>

        {message && <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{message}</div>}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/suppliers')}>Cancelar</Button>
          <Button loading={saving} onClick={saveSupplier}>Guardar Proveedor</Button>
        </div>
      </Card>
    </div>
  )
}
