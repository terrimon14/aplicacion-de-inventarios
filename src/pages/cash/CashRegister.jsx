import { Wallet, ArrowUp, ArrowDown } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { useAsync } from '../../hooks/useAsync'
import { cashService } from '../../services/cash'
import { formatCurrency } from '../../utils/formatters'
import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'

export default function CashRegister() {
  const navigate = useNavigate()

  const { data: sessionData, loading } = useAsync(
    async () => {
      const result = await cashService.currentSession(1)
      return result || null
    },
    [],
    null,
  )

  const session = sessionData || null
  const movements = Array.isArray(session?.movements) ? session.movements.slice(0, 20) : []
  const income = Number(session?.income || 0)
  const expenses = Number(session?.expenses || 0)
  const balance = Number(session?.expected_balance || 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Caja']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Caja</h1>
        <p className="text-sm text-[#5c5e78]">Control de caja del día</p>
      </div>

      {!loading && !session ? (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-rose-300">Caja cerrada</p>
              <p className="text-sm text-[#9496b0] mt-1">
                Debes abrir una sesion de caja para habilitar ventas y cobranzas en efectivo.
              </p>
            </div>
            <Button onClick={() => navigate('/cash/sessions')}>Ir a Apertura de Caja</Button>
          </div>
        </Card>
      ) : null}

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
            <Badge color={session ? 'emerald' : 'rose'} dot>{session ? 'Caja abierta' : 'Caja cerrada'}</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="danger" size="sm" className="flex-1" onClick={() => navigate('/cash/sessions')}>
              Cerrar Caja
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/cash/movements')}>
              Gastos
            </Button>
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
          <Button variant="secondary" size="sm" icon={ArrowDown} onClick={() => navigate('/cash/movements')}>
            Registrar egreso
          </Button>
        </CardHeader>
        <Table>
          <THead>
            <Th>Tipo</Th>
            <Th>Descripción</Th>
            <Th align="center">Hora</Th>
            <Th align="right">Monto</Th>
          </THead>
          <TBody>
            {movements.length === 0 ? (
              <Tr>
                <Td colSpan={4} className="text-center text-[#5c5e78]">No hay movimientos hoy.</Td>
              </Tr>
            ) : movements.map(m => (
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
                <Td align="center" muted>{new Date(m.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</Td>
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
