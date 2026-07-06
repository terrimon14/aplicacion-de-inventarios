import { Wallet, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { formatCurrency } from '../../utils/formatters'
import { clsx } from 'clsx'

const movements = [
  { id: 1, type: 'in', description: 'Venta #0892 — Carlos Mendoza', amount: 1250.0, time: '09:45' },
  { id: 2, type: 'in', description: 'Venta #0891 — Ana García', amount: 450.0, time: '09:12' },
  { id: 3, type: 'out', description: 'Compra de insumos', amount: 320.0, time: '08:30' },
  { id: 4, type: 'in', description: 'Venta #0890 — Juan Pérez', amount: 2100.0, time: 'Ayer' },
]

export default function CashRegister() {
  const balance = 8450.0
  const income = movements.filter(m => m.type === 'in').reduce((a, m) => a + m.amount, 0)
  const expenses = movements.filter(m => m.type === 'out').reduce((a, m) => a + m.amount, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Caja']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Caja</h1>
        <p className="text-sm text-[#5c5e78]">Control de caja del día</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-indigo-500/20 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
              <Wallet size={22} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-[#5c5e78]">Saldo en caja</p>
              <p className="text-2xl font-bold text-[#e2e4f0]">{formatCurrency(balance)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge color="emerald" dot>Caja abierta</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="danger" size="sm" className="flex-1">Cerrar Caja</Button>
            <Button variant="secondary" size="sm" className="flex-1">Imprimir</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 flex items-center justify-center">
              <ArrowUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(income)}</p>
              <p className="text-xs text-[#5c5e78]">Ingresos del día</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/12 flex items-center justify-center">
              <ArrowDown size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-rose-400">{formatCurrency(expenses)}</p>
              <p className="text-xs text-[#5c5e78]">Egresos del día</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Movimientos del día</CardTitle>
            <CardSubtitle>Historial de transacciones</CardSubtitle>
          </div>
          <Button variant="secondary" size="sm" icon={ArrowDown}>Registrar egreso</Button>
        </CardHeader>
        <Table>
          <THead>
            <Th>Tipo</Th>
            <Th>Descripción</Th>
            <Th align="center">Hora</Th>
            <Th align="right">Monto</Th>
          </THead>
          <TBody>
            {movements.map(m => (
              <Tr key={m.id}>
                <Td>
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center',
                    m.type === 'in' ? 'bg-emerald-500/12' : 'bg-rose-500/12',
                  )}>
                    {m.type === 'in'
                      ? <ArrowUp size={13} className="text-emerald-400" />
                      : <ArrowDown size={13} className="text-rose-400" />
                    }
                  </div>
                </Td>
                <Td><span className="text-[#e2e4f0]">{m.description}</span></Td>
                <Td align="center" muted>{m.time}</Td>
                <Td align="right">
                  <span className={clsx(
                    'font-bold',
                    m.type === 'in' ? 'text-emerald-400' : 'text-rose-400',
                  )}>
                    {m.type === 'in' ? '+' : '-'}{formatCurrency(m.amount)}
                  </span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
