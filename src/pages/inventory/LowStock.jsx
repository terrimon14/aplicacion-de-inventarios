import { AlertTriangle, ArrowDown, Package } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { mockProducts } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatters'
import { clsx } from 'clsx'

const lowStockProducts = mockProducts.filter(p => p.status === 'low' || p.status === 'out')

export default function LowStock() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Inventario', 'Stock Bajo']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Stock Bajo</h1>
        <p className="text-sm text-[#5c5e78]">Productos que requieren reabastecimiento</p>
      </div>

      <Alert type="warning" title="Atención requerida">
        {lowStockProducts.length} productos necesitan reabastecimiento urgente
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Package size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-rose-400">{mockProducts.filter(p => p.status === 'out').length}</p>
              <p className="text-xs text-[#5c5e78]">Productos agotados</p>
            </div>
          </div>
        </Card>
        <Card className="border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <ArrowDown size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-400">{mockProducts.filter(p => p.status === 'low').length}</p>
              <p className="text-xs text-[#5c5e78]">Stock crítico</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <AlertTriangle size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-400">{lowStockProducts.length}</p>
              <p className="text-xs text-[#5c5e78]">Total a reabastecer</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Productos con Stock Bajo o Agotado</CardTitle>
            <CardSubtitle>Ordenados por urgencia</CardSubtitle>
          </div>
          <Button size="sm" icon={Package} onClick={() => navigate('/purchases/orders')}>Generar Orden de Compra</Button>
        </CardHeader>
        <Table>
          <THead>
            <Th>Producto</Th>
            <Th>SKU</Th>
            <Th>Categoría</Th>
            <Th align="center">Stock Actual</Th>
            <Th align="center">Stock Mínimo</Th>
            <Th align="center">Estado</Th>
            <Th align="right">Precio</Th>
          </THead>
          <TBody>
            {lowStockProducts.map(p => (
              <Tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className={clsx(
                      'w-2 h-2 rounded-full shrink-0',
                      p.status === 'out' ? 'bg-rose-400' : 'bg-amber-400',
                    )} />
                    <span className="font-medium text-[#e2e4f0]">{p.name}</span>
                  </div>
                </Td>
                <Td muted><span className="font-mono text-xs">{p.sku}</span></Td>
                <Td muted>{p.category}</Td>
                <Td align="center">
                  <span className={clsx(
                    'font-bold',
                    p.stock === 0 ? 'text-rose-400' : 'text-amber-400',
                  )}>{p.stock}</span>
                </Td>
                <Td align="center" muted>5</Td>
                <Td align="center">
                  <Badge color={p.status === 'out' ? 'rose' : 'amber'} dot>
                    {p.status === 'out' ? 'Agotado' : 'Stock Bajo'}
                  </Badge>
                </Td>
                <Td align="right">
                  <span className="font-semibold text-[#e2e4f0]">{formatCurrency(p.price)}</span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
