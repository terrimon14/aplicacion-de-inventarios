import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { customerService } from '../../services/customers'

export default function NewCustomer() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    document_type: 'DNI',
    document_number: '',
    email: '',
    phone: '',
    address: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveCustomer = async () => {
    if (!form.name.trim()) {
      setMessage('El nombre del cliente es obligatorio.')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      await customerService.create(form)
      navigate('/customers')
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar el cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-4xl">
      <div>
        <Breadcrumb items={['Clientes', 'Nuevo Cliente']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Nuevo Cliente</h1>
        <p className="text-sm text-[#5c5e78]">Registrar cliente para ventas y cobranza</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Datos del Cliente</CardTitle>
            <CardSubtitle>Completa los datos básicos del comprador</CardSubtitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre completo" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ej: Carlos Mendoza" containerClassName="md:col-span-2" />
          <Input label="Tipo de documento" value={form.document_type} onChange={(e) => updateField('document_type', e.target.value)} placeholder="DNI" />
          <Input label="Número de documento" value={form.document_number} onChange={(e) => updateField('document_number', e.target.value)} placeholder="00000000" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="correo@email.com" />
          <Input label="Teléfono" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="999000111" />
          <Input label="Dirección" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Av. Principal 123" containerClassName="md:col-span-2" />
        </div>

        {message && <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{message}</div>}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/customers')}>Cancelar</Button>
          <Button loading={saving} onClick={saveCustomer}>Guardar Cliente</Button>
        </div>
      </Card>
    </div>
  )
}
