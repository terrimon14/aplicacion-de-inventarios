import { useState } from 'react'
import { Plus, ShoppingCart, User, Trash2, CreditCard, Banknote } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import SearchInput from '../../components/ui/Search'
import Badge from '../../components/ui/Badge'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { mockProducts } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatters'
import { clsx } from 'clsx'

const initialCart = [
  { ...mockProducts[0], qty: 1 },
  { ...mockProducts[3], qty: 2 },
]

export default function NewSale() {
  const [cart, setCart] = useState(initialCart)
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))

  const filteredProducts = mockProducts.filter(p =>
    p.stock > 0 && (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="flex flex-col gap-5 animate-fade-in h-full">
      <div>
        <Breadcrumb items={['Ventas', 'Nueva Venta']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Nueva Venta</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
        {/* Left — Product Search */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <SearchInput
              placeholder="Buscar producto por nombre o SKU..."
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
                      <p className="text-xs text-[#5c5e78] font-mono">{p.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9496b0]">Stock: {p.stock}</span>
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
                <p className="text-xs font-medium text-[#e2e4f0]">Cliente general</p>
                <p className="text-xs text-[#5c5e78]">Sin DNI/RUC</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full">Seleccionar cliente</Button>
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
              <Input label="Monto recibido" placeholder="0.00" type="number" className="mb-3" />
            )}

            <Button className="w-full" size="lg" icon={ShoppingCart}>
              Procesar Venta
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
