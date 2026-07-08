import { useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { purchaseService } from '../../services/dashboard'
import { formatCurrency } from '../../utils/formatters'

export default function PurchaseHistory() {
  const [search, setSearch] = useState('')
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  const { data: purchases = [] } = useAsync(
    async () => {
      const result = await purchaseService.list({ search })
      return Array.isArray(result) ? result : []
    },
    [search],
    [],
  )

  const openDetail = async (purchaseId) => {
    const detail = await purchaseService.get(purchaseId)
    setSelectedPurchase(detail)
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Compras', 'Historial de Compras']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Historial de Compras</h1>
        <p className="text-sm text-[#5c5e78]">Consulta compras registradas y su detalle</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras registradas</CardTitle>
        </CardHeader>
        <div className="mb-4 max-w-md">
          <SearchInput placeholder="Buscar por referencia o proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Table>
          <THead>
            <Th>Referencia</Th>
            <Th>Proveedor</Th>
            <Th>Fecha</Th>
            <Th align="right">Total</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Acción</Th>
          </THead>
          <TBody>
            {purchases.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center text-[#5c5e78]">No hay compras registradas.</Td>
              </Tr>
            ) : purchases.map((purchase) => (
              <Tr key={purchase.id}>
                <Td><span className="font-mono text-indigo-300">{purchase.reference}</span></Td>
                <Td>{purchase.supplier_name || purchase.supplier_name_joined || '-'}</Td>
                <Td muted>{new Date(purchase.created_at).toLocaleDateString('es-PE')}</Td>
                <Td align="right"><span className="font-semibold text-[#e2e4f0]">{formatCurrency(purchase.total)}</span></Td>
                <Td align="center"><Badge color="emerald">Completada</Badge></Td>
                <Td align="center"><Button variant="secondary" size="xs" onClick={() => openDetail(purchase.id)}>Ver detalle</Button></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        title={selectedPurchase ? `Detalle ${selectedPurchase.reference}` : 'Detalle de Compra'}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setSelectedPurchase(null)}>Cerrar</Button>}
      >
        {!selectedPurchase ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p className="text-[#9496b0]">Proveedor: <span className="text-[#e2e4f0]">{selectedPurchase.supplier_name || '-'}</span></p>
              <p className="text-[#9496b0]">Fecha: <span className="text-[#e2e4f0]">{new Date(selectedPurchase.created_at).toLocaleString('es-PE')}</span></p>
            </div>
            <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a38] text-xs uppercase text-[#5c5e78]">
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Cantidad</th>
                    <th className="px-3 py-2 text-right">Costo</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPurchase.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a38]/60 text-[#e2e4f0]">
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.cost)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
