import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Inbox, ShoppingBag } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import { purchaseOrderService } from '../../services/purchaseOrders'
import { useAsync } from '../../hooks/useAsync'

const statusMap = {
  pending_receipt: { label: 'Pendiente de Recibir', color: 'amber' },
  received: { label: 'Recibida', color: 'emerald' },
  cancelled: { label: 'Cancelada', color: 'rose' },
}

export default function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const { data: order, loading, refetch } = useAsync(
    async () => purchaseOrderService.get(Number(id)),
    [id],
    null,
  )

  const receiveOrder = async () => {
    setProcessing(true)
    setMessage('')
    try {
      await purchaseOrderService.receive(Number(id))
      await refetch()
      setMessage('Orden marcada como Recibida. El stock fue abonado en Almacen Central.')
    } catch (error) {
      setMessage(error.message || 'No se pudo recibir la orden.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <Loading text="Cargando orden de compra..." />

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb items={['Compras', 'Ordenes de Compra (Pedidos)', 'Detalle']} />
        <Card>
          <p className="text-sm text-[#9496b0]">La orden solicitada no existe.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/purchases/orders')}>Volver</Button>
          </div>
        </Card>
      </div>
    )
  }

  const status = statusMap[order.status] || { label: order.status, color: 'slate' }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Breadcrumb items={['Compras', 'Ordenes de Compra (Pedidos)', order.reference]} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Detalle de Orden</h1>
          <p className="text-sm text-[#5c5e78]">Recepcion de mercaderia y actualizacion de stock en Almacen Central</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/purchases/orders')}>Volver</Button>
          <Button
            icon={Inbox}
            disabled={order.status !== 'pending_receipt'}
            loading={processing}
            onClick={receiveOrder}
          >
            📥 Marcar como Recibida
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
            <CardTitle>Orden {order.reference}</CardTitle>
            <CardSubtitle>Informacion general de la orden</CardSubtitle>
          </div>
          <Badge color={status.color}>{status.label}</Badge>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
            <p className="text-xs text-[#5c5e78]">Proveedor</p>
            <p className="text-sm font-semibold text-[#e2e4f0] mt-1">{order.supplier_name}</p>
          </div>
          <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
            <p className="text-xs text-[#5c5e78]">Fecha</p>
            <p className="text-sm font-semibold text-[#e2e4f0] mt-1">{new Date(order.created_at).toLocaleDateString('es-PE')}</p>
          </div>
          <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
            <p className="text-xs text-[#5c5e78]">Estado</p>
            <p className="text-sm font-semibold text-[#e2e4f0] mt-1">{status.label}</p>
          </div>
          <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
            <p className="text-xs text-[#5c5e78]">Items</p>
            <p className="text-sm font-semibold text-[#e2e4f0] mt-1">{order.items?.length || 0}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Articulos Solicitados</CardTitle>
            <CardSubtitle>Cantidades pendientes de ingreso fisico</CardSubtitle>
          </div>
          <ShoppingBag size={16} className="text-indigo-300" />
        </CardHeader>

        <Table>
          <THead>
            <Th>Producto</Th>
            <Th>Marca</Th>
            <Th>Proveedor sugerido</Th>
            <Th align="center">Stock al crear orden</Th>
            <Th align="center">Cantidad Pedida</Th>
          </THead>
          <TBody>
            {(order.items || []).map((item) => (
              <Tr key={item.id}>
                <Td><span className="font-medium text-[#e2e4f0]">{item.product_name}</span></Td>
                <Td muted>{item.brand_name || '-'}</Td>
                <Td muted>{item.supplier_suggested || '-'}</Td>
                <Td align="center" muted>{item.stock_actual}</Td>
                <Td align="center">
                  <span className="font-semibold text-emerald-300">{item.qty_requested}</span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
