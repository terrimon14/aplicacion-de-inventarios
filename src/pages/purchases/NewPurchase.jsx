import { useMemo, useState } from 'react'
import { Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import SearchInput from '../../components/ui/Search'
import { useAsync } from '../../hooks/useAsync'
import { productService } from '../../services/products'
import { purchaseService } from '../../services/dashboard'
import { supplierService } from '../../services/customers'
import { formatCurrency } from '../../utils/formatters'

export default function NewPurchase() {
  const [search, setSearch] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { data: products = [] } = useAsync(
    async () => {
      const result = await productService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const { data: suppliers = [] } = useAsync(
    async () => {
      const result = await supplierService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    String(product.sku || '').toLowerCase().includes(search.toLowerCase()),
  )

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.id) === String(selectedSupplierId)),
    [suppliers, selectedSupplierId],
  )

  const subtotal = items.reduce((acc, item) => acc + Number(item.cost || 0) * Number(item.quantity || 0), 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id)
      if (existing) {
        return prev.map((item) => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        code: product.sku || '',
        quantity: 1,
        cost: Number(product.cost || 0),
      }]
    })
  }

  const updateItem = (productId, field, value) => {
    setItems((prev) => prev.map((item) => (
      item.product_id === productId
        ? {
            ...item,
            [field]: field === 'quantity'
              ? Math.max(1, Number(value || 1))
              : Math.max(0, Number(value || 0)),
          }
        : item
    )))
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const savePurchase = async () => {
    if (!selectedSupplier || items.length === 0) {
      setMessage('Selecciona un proveedor y agrega al menos un producto.')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      const created = await purchaseService.create({
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.name,
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          quantity: Number(item.quantity),
          cost: Number(item.cost),
        })),
      })
      setItems([])
      setSelectedSupplierId('')
      setMessage(`Compra ${created.reference} registrada correctamente.`)
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar la compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Compras', 'Nueva Compra']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Nueva Compra</h1>
        <p className="text-sm text-[#5c5e78]">Registrar ingreso de televisores y accesorios al almacén</p>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <SearchInput
              placeholder="Buscar producto por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />
            <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1e1e27] hover:bg-[#2a2a36] border border-[#2a2a38] hover:border-indigo-500/30 transition-all text-left group"
                >
                  <div>
                    <p className="text-xs font-medium text-[#e2e4f0]">{product.name}</p>
                    <p className="text-xs text-[#5c5e78] font-mono">{product.sku || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#e2e4f0]">{formatCurrency(product.cost)}</span>
                    <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className="text-indigo-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Compra</CardTitle>
            </CardHeader>
            {items.length === 0 ? (
              <p className="text-sm text-[#5c5e78]">Agrega productos para construir la compra.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product_id} className="grid grid-cols-12 gap-2 items-end rounded-lg bg-[#1e1e27] border border-[#2a2a38] p-3">
                    <div className="col-span-12 md:col-span-4">
                      <p className="text-xs font-medium text-[#e2e4f0]">{item.name}</p>
                      <p className="text-xs text-[#5c5e78]">Código: {item.code || '-'}</p>
                    </div>
                    <Input label="Cantidad" type="number" value={item.quantity} onChange={(e) => updateItem(item.product_id, 'quantity', e.target.value)} containerClassName="col-span-6 md:col-span-2" />
                    <Input label="Costo" type="number" step="0.01" value={item.cost} onChange={(e) => updateItem(item.product_id, 'cost', e.target.value)} containerClassName="col-span-6 md:col-span-3" />
                    <div className="col-span-10 md:col-span-2 text-right">
                      <p className="text-xs text-[#5c5e78]">Subtotal</p>
                      <p className="text-sm font-semibold text-[#e2e4f0]">{formatCurrency(Number(item.cost) * Number(item.quantity))}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.product_id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Proveedor</CardTitle>
            </CardHeader>
            <Select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-[#9496b0]">Subtotal</span><span className="text-[#e2e4f0]">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#9496b0]">IGV</span><span className="text-[#e2e4f0]">{formatCurrency(tax)}</span></div>
              <div className="h-px bg-[#2a2a38]" />
              <div className="flex justify-between"><span className="font-bold text-[#e2e4f0]">Total</span><span className="font-bold text-xl text-[#e2e4f0]">{formatCurrency(total)}</span></div>
            </div>
            <Button className="w-full" icon={ShoppingBag} loading={saving} onClick={savePurchase}>Registrar Compra</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
