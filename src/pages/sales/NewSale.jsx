import { useMemo, useState } from 'react'
import { Plus, ShoppingCart, User, Trash2, CreditCard, Banknote } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import SearchInput from '../../components/ui/Search'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { useAsync } from '../../hooks/useAsync'
import { productService } from '../../services/products'
import { customerService } from '../../services/customers'
import { saleService } from '../../services/sales'
import { cashService } from '../../services/cash'
import { useUbicacion } from '../../contexts/UbicacionContext'
import { formatCurrency } from '../../utils/formatters'
import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'

export default function NewSale() {
  const navigate = useNavigate()
  const { ubicacionActiva, ubicacionId } = useUbicacion()
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [schedule, setSchedule] = useState([
    { amount: '', due_date: '' },
  ])

  const { data: products = [] } = useAsync(
    async () => {
      const result = await productService.list({ ubicacionId })
      return Array.isArray(result) ? result : []
    },
    [ubicacionId],
    [],
  )

  const { data: customers = [] } = useAsync(
    async () => {
      const result = await customerService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const { data: cashStatus, loading: cashLoading } = useAsync(
    async () => {
      const result = await cashService.activeRequired(1)
      return result || { hasOpenSession: false }
    },
    [],
    { hasOpenSession: false },
  )

  const hasOpenCashSession = !!cashStatus?.hasOpenSession

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))

  const filteredProducts = products.filter(p =>
    Number(p.stock_vista) > 0 && (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.sku || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.id) === String(selectedCustomerId)),
    [customers, selectedCustomerId],
  )

  const saveSale = async () => {
    if (cart.length === 0) return

    setSaving(true)
    setMessage('')
    try {
      const installments = paymentMethod === 'credit'
        ? schedule
            .filter((row) => row.amount && row.due_date)
            .map((row) => ({ amount: Number(row.amount), due_date: row.due_date }))
        : []

      await saleService.create({
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        customer_name: selectedCustomer ? selectedCustomer.name : 'Cliente general',
        payment_method: paymentMethod,
        ubicacion_id: ubicacionId,
        items: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.qty,
          price: item.price,
        })),
        installments,
      })

      setCart([])
      setSchedule([{ amount: '', due_date: '' }])
      setMessage('Venta registrada correctamente.')
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar la venta.')
    } finally {
      setSaving(false)
    }
  }

  const setScheduleField = (index, field, value) => {
    setSchedule((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in h-full">
      <div>
        <Breadcrumb items={['Ventas', 'Nueva Venta']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Nueva Venta</h1>
        <p className="text-sm text-[#5c5e78]">Descuento de stock desde {ubicacionActiva.emoji} {ubicacionActiva.label}</p>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      {!cashLoading && !hasOpenCashSession ? (
        <Card className="border-rose-500/20 bg-rose-500/5 max-w-3xl">
          <p className="text-sm font-semibold text-rose-300">Caja no abierta</p>
          <p className="text-sm text-[#9496b0] mt-2">
            El POS esta bloqueado hasta registrar la apertura del turno de caja.
          </p>
          <div className="mt-4">
            <Button onClick={() => navigate('/cash/sessions')}>Ir a Apertura de Caja</Button>
          </div>
        </Card>
      ) : null}

      {!cashLoading && !hasOpenCashSession ? null : (

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
        {/* Left — Product Search */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <SearchInput
              placeholder="Buscar producto por nombre o codigo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-3"
            />
            <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    const exists = cart.find(i => i.id === p.id)
                    if (exists) updateQty(p.id, exists.qty + 1)
                    else setCart(prev => [...prev, { ...p, qty: 1 }])
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1e1e27] hover:bg-[#2a2a36] border border-[#2a2a38] hover:border-indigo-500/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#5c5e78]">{p.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e2e4f0]">{p.name}</p>
                      <p className="text-xs text-[#5c5e78] font-mono">{p.sku || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9496b0]">Stock: {p.stock_vista}</span>
                    <span className="text-sm font-bold text-[#e2e4f0]">{formatCurrency(p.price)}</span>
                    <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className="text-indigo-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Cart */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Carrito ({cart.length} ítems)</CardTitle>
            </CardHeader>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-[#5c5e78]">
                <ShoppingCart size={28} className="mb-2" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1e1e27] border border-[#2a2a38]">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#e2e4f0] truncate">{item.name}</p>
                      <p className="text-xs text-[#5c5e78]">{formatCurrency(item.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-[#2a2a36] text-[#9496b0] hover:bg-[#33334a] hover:text-[#e2e4f0] text-sm font-bold transition-all"
                      >−</button>
                      <span className="w-7 text-center text-sm font-semibold text-[#e2e4f0]">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-[#2a2a36] text-[#9496b0] hover:bg-[#33334a] hover:text-[#e2e4f0] text-sm font-bold transition-all"
                      >+</button>
                    </div>
                    <span className="text-sm font-bold text-[#e2e4f0] w-20 text-right">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right — Summary */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#1e1e27] border border-[#2a2a38] mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0">
                <User size={15} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#e2e4f0]">{selectedCustomer?.name || 'Cliente general'}</p>
                <p className="text-xs text-[#5c5e78]">{selectedCustomer?.document_number || 'Sin DNI/RUC'}</p>
              </div>
            </div>
            <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              <option value="">Cliente general</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </Select>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#9496b0]">Subtotal</span>
                <span className="text-[#e2e4f0]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9496b0]">IGV (18%)</span>
                <span className="text-[#e2e4f0]">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#9496b0]">Descuento</span>
                <span className="text-emerald-400">S/ 0.00</span>
              </div>
              <div className="h-px bg-[#2a2a38]" />
              <div className="flex justify-between">
                <span className="font-bold text-[#e2e4f0]">Total</span>
                <span className="font-bold text-xl text-[#e2e4f0]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <p className="text-xs font-medium text-[#9496b0] mb-2">Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Efectivo', Icon: Banknote },
                  { id: 'card', label: 'Tarjeta', Icon: CreditCard },
                  { id: 'credit', label: 'Credito', Icon: CreditCard },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={clsx(
                      'flex items-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all',
                      paymentMethod === id
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                        : 'border-[#2a2a38] bg-[#1e1e27] text-[#9496b0] hover:border-[#33334a] hover:text-[#e2e4f0]',
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <Input
                label="Monto recibido"
                placeholder="0.00"
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className="mb-3"
              />
            )}

            {paymentMethod === 'credit' && (
              <div className="mb-3 rounded-xl border border-[#2a2a38] p-3 space-y-2">
                <p className="text-xs font-semibold text-[#9496b0]">Cronograma de cuotas</p>
                {schedule.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      label="Monto"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={(e) => setScheduleField(idx, 'amount', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="Vencimiento"
                      value={row.due_date}
                      onChange={(e) => setScheduleField(idx, 'due_date', e.target.value)}
                    />
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSchedule((prev) => [...prev, { amount: '', due_date: '' }])}
                >
                  Agregar cuota
                </Button>
              </div>
            )}

            <Button className="w-full" size="lg" icon={ShoppingCart} loading={saving} onClick={saveSale}>
              Procesar Venta
            </Button>
          </Card>
        </div>
      </div>

      )}
    </div>
  )
}
