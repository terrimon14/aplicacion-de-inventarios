import { Package, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { mockProducts } from '../../data/mockData'
import { formatCurrency, statusColor, statusLabel } from '../../utils/formatters'
import { clsx } from 'clsx'

export default function Stock() {
  const totalStock = mockProducts.reduce((acc, p) => acc + p.stock, 0)
  const totalValue = mockProducts.reduce((acc, p) => acc + p.stock * p.price, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Inventario', 'Stock']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Stock</h1>
        <p className="text-sm text-[#5c5e78]">Inventario actual del almacén</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/12 flex items-center justify-center">
              <Package size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#e2e4f0]">{totalStock.toLocaleString()}</p>
              <p className="text-xs text-[#5c5e78]">Unidades en almacén</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#e2e4f0]">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-[#5c5e78]">Valor del inventario</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/12 flex items-center justify-center">
              <Package size={18} className="text-sky-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#e2e4f0]">{mockProducts.length}</p>
              <p className="text-xs text-[#5c5e78]">Referencias activas</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inventario Actual</CardTitle>
            <CardSubtitle>Detalle de stock por producto</CardSubtitle>
          </div>
        </CardHeader>
        <Table>
          <THead>
            <Th>Producto</Th>
            <Th>SKU</Th>
            <Th align="center">Stock</Th>
            <Th align="right">Precio</Th>
            <Th align="right">Valor Total</Th>
            <Th align="center">Estado</Th>
          </THead>
          <TBody>
            {mockProducts.map(p => (
              <Tr key={p.id}>
                <Td>
                  <span className="font-medium text-[#e2e4f0]">{p.name}</span>
                </Td>
                <Td muted><span className="font-mono text-xs">{p.sku}</span></Td>
                <Td align="center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 h-1.5 bg-[#2a2a36] rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          p.status === 'out' ? 'bg-rose-500' : p.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500',
                        )}
                        style={{ width: `${Math.min(100, (p.stock / 30) * 100)}%` }}
                      />
                    </div>
                    <span className={clsx(
                      'font-semibold text-sm min-w-6',
                      p.stock === 0 ? 'text-rose-400' : p.stock <= 8 ? 'text-amber-400' : 'text-emerald-400',
                    )}>{p.stock}</span>
                  </div>
                </Td>
                <Td align="right">{formatCurrency(p.price)}</Td>
                <Td align="right">
                  <span className="font-semibold text-[#e2e4f0]">{formatCurrency(p.stock * p.price)}</span>
                </Td>
                <Td align="center">
                  <Badge color={statusColor[p.status]} dot>
                    {statusLabel[p.status]}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
