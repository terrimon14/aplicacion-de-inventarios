import { useMemo, useState } from 'react'
import { Sparkles, Save, ShoppingBag } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { purchaseOrderService } from '../../services/purchaseOrders'
import { useUbicacion } from '../../contexts/UbicacionContext'
import { useAsync } from '../../hooks/useAsync'

export default function PurchaseOrders() {
  const { ubicacionActiva, ubicacionId } = useUbicacion()
  const [draftItems, setDraftItems] = useState([])
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [scope, setScope] = useState('selected')

  const { data: orders = [], refetch } = useAsync(
    async () => {
      const result = await purchaseOrderService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const generateByLowStock = async () => {
    setLoadingSuggest(true)
    setMessage('')
    try {
      const rows = await purchaseOrderService.suggestByLowStock({
        ubicacionId: scope === 'selected' ? ubicacionId : null,
      })
      setDraftItems(Array.isArray(rows) ? rows : [])
      if (!rows || rows.length === 0) {
        setMessage('No se encontraron productos bajo minimo para la ubicacion actual.')
      }
    } finally {
      setLoadingSuggest(false)
    }
  }

  const saveOrder = async () => {
    if (draftItems.length === 0) return
    setSaving(true)
    setMessage('')
    try {
      const created = await purchaseOrderService.create({
        ubicacionId: scope === 'selected' ? ubicacionId : null,
        items: draftItems,
        notes: `Pedido generado automaticamente por stock bajo (${scope === 'selected' ? ubicacionActiva.label : 'Global'})`,
      })
      await refetch()
      setDraftItems([])
      setMessage(`Orden ${created?.reference || ''} guardada en estado Pendiente de Recibir.`)
    } finally {
      setSaving(false)
    }
  }

  const setQty = (productId, qty) => {
    setDraftItems((prev) => prev.map((item) => (
      item.product_id === productId
        ? { ...item, qty_requested: Math.max(1, Number(qty || 1)) }
        : item
    )))
  }

  const totals = useMemo(() => ({
    lines: draftItems.length,
    qty: draftItems.reduce((acc, item) => acc + Number(item.qty_requested || 0), 0),
  }), [draftItems])

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Breadcrumb items={['Compras', 'Ordenes de Compra (Pedidos)']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Ordenes de Compra</h1>
          <p className="text-sm text-[#5c5e78]">
            Generacion automatica por stock bajo en {scope === 'selected' ? `${ubicacionActiva.emoji} ${ubicacionActiva.label}` : 'inventario global'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 px-3 bg-[#1e1e27] border border-[#2a2a38] rounded-lg text-sm text-[#e2e4f0]"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="selected">Ubicacion seleccionada</option>
            <option value="global">Stock global</option>
          </select>
          <Button icon={Sparkles} loading={loadingSuggest} onClick={generateByLowStock}>
            ✨ Generar Pedido por Stock Bajo
          </Button>
        </div>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Borrador de Pedido</CardTitle>
            <CardSubtitle>Nombre, marca, proveedor sugerido, stock actual y cantidad editable</CardSubtitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="sky">{totals.lines} productos</Badge>
            <Badge color="indigo">{totals.qty} unidades</Badge>
            <Button icon={Save} disabled={draftItems.length === 0} loading={saving} onClick={saveOrder}>
              Guardar en Pendiente de Recibir
            </Button>
          </div>
        </CardHeader>

        <Table>
          <THead>
            <Th>Producto</Th>
            <Th>Marca</Th>
            <Th>Proveedor sugerido</Th>
            <Th align="center">Stock actual</Th>
            <Th align="center">Minimo</Th>
            <Th align="center">Cantidad a pedir</Th>
          </THead>
          <TBody>
            {draftItems.length === 0 ? (
              <Tr>
                <Td className="text-center text-[#5c5e78]" colSpan={6}>
                  Genera un pedido para precargar los productos con stock critico.
                </Td>
              </Tr>
            ) : draftItems.map((item) => (
              <Tr key={item.product_id}>
                <Td>
                  <span className="font-medium text-[#e2e4f0]">{item.product_name}</span>
                </Td>
                <Td muted>{item.brand_name}</Td>
                <Td muted>{item.supplier_suggested}</Td>
                <Td align="center">
                  <span className="font-semibold text-amber-300">{item.stock_actual}</span>
                </Td>
                <Td align="center" muted>{item.min_stock}</Td>
                <Td align="center">
                  <Input
                    type="number"
                    min={1}
                    value={item.qty_requested}
                    onChange={(e) => setQty(item.product_id, e.target.value)}
                    className="w-20 mx-auto text-center"
                  />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ordenes Guardadas</CardTitle>
            <CardSubtitle>Historico local de pedidos de compra</CardSubtitle>
          </div>
        </CardHeader>
        <Table>
          <THead>
            <Th>Referencia</Th>
            <Th>Fecha</Th>
            <Th align="center">Items</Th>
            <Th align="center">Unidades</Th>
            <Th align="center">Estado</Th>
          </THead>
          <TBody>
            {orders.length === 0 ? (
              <Tr>
                <Td className="text-center text-[#5c5e78]" colSpan={5}>
                  No hay ordenes registradas.
                </Td>
              </Tr>
            ) : orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-indigo-300" />
                    <span className="font-mono text-indigo-300">{order.reference}</span>
                  </div>
                </Td>
                <Td muted>{new Date(order.created_at).toLocaleDateString('es-PE')}</Td>
                <Td align="center" muted>{order.items_count}</Td>
                <Td align="center" muted>{order.qty_total}</Td>
                <Td align="center">
                  <Badge color="amber">Pendiente de Recibir</Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
