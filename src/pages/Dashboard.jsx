import {
  TrendingUp, TrendingDown, Package, Users, AlertTriangle,
  ShoppingCart, ArrowUpRight, MoreHorizontal, Activity, RefreshCw,
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Loading from '../components/ui/Loading'
import Button from '../components/ui/Button'
import { useDashboard } from '../hooks/useDashboard'
import { mockSales } from '../data/mockData'
import { formatCurrency, formatDate, statusColor, statusLabel } from '../utils/formatters'
import { clsx } from 'clsx'

const colorMap = {
  indigo: ['text-indigo-400', 'bg-indigo-500/10'],
  emerald: ['text-emerald-400', 'bg-emerald-500/10'],
  violet: ['text-violet-400', 'bg-violet-500/10'],
  sky: ['text-sky-400', 'bg-sky-500/10'],
  rose: ['text-rose-400', 'bg-rose-500/10'],
  amber: ['text-amber-400', 'bg-amber-500/10'],
}

const activityColorMap = {
  success: 'text-emerald-400 bg-emerald-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  error: 'text-rose-400 bg-rose-500/10',
  info: 'text-sky-400 bg-sky-500/10',
}

export default function Dashboard() {
  const { stats, activity, loading, refetch } = useDashboard()

  if (loading && !stats) return <Loading text="Cargando dashboard..." />

  const salesChart = stats?.salesChart ?? []
  const chartMax = Math.max(...salesChart.map(d => d.value), 1)

  const statCards = stats ? [
    { label: 'Ventas del día',    value: formatCurrency(stats.salesToday),  change: '+hoy', up: true,  color: 'indigo', Icon: TrendingUp },
    { label: 'Ventas del mes',    value: formatCurrency(stats.salesMonth),  change: '+mes', up: true,  color: 'emerald', Icon: ShoppingCart },
    { label: 'Ganancias',         value: formatCurrency(stats.profit),      change: '+mes', up: true,  color: 'violet', Icon: TrendingUp },
    { label: 'Productos',         value: stats.totalProducts,               change: 'activos', up: true, color: 'sky', Icon: Package },
    { label: 'Agotados',          value: stats.outOfStock,                  change: 'sin stock', up: false, color: 'rose', Icon: AlertTriangle },
    { label: 'Stock Bajo',        value: stats.lowStock,                    change: 'crítico',   up: false, color: 'amber', Icon: AlertTriangle },
    { label: 'Clientes',          value: stats.totalCustomers,              change: 'activos', up: true, color: 'emerald', Icon: Users },
    { label: 'Compras del mes',   value: stats.recentPurchases,             change: '+mes', up: true,  color: 'sky', Icon: ShoppingCart },
  ] : []

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e2e4f0]">Dashboard</h1>
          <p className="text-sm text-[#5c5e78] mt-0.5">
            Resumen general · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refetch}>
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => {
          const [text, bg] = colorMap[s.color] ?? colorMap.indigo
          return (
            <Card key={i} hover>
              <div className="flex items-start justify-between mb-3">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
                  <s.Icon size={17} className={text} strokeWidth={2} />
                </div>
                <span className={clsx(
                  'flex items-center gap-0.5 text-xs font-medium',
                  s.up ? 'text-emerald-400' : 'text-rose-400',
                )}>
                  {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.change}
                </span>
              </div>
              <p className="text-xl font-bold text-[#e2e4f0] leading-none">{s.value}</p>
              <p className="text-xs text-[#5c5e78] mt-1.5">{s.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Ventas de la semana</CardTitle>
              <CardSubtitle>Rendimiento diario en soles</CardSubtitle>
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:bg-[#2a2a36] hover:text-[#9496b0] transition-all">
              <MoreHorizontal size={15} />
            </button>
          </CardHeader>
          <div className="flex items-end gap-2 h-36 mt-2">
            {salesChart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[#5c5e78]">Sin datos</div>
            ) : salesChart.map((d, i) => {
              const pct = chartMax > 0 ? (d.value / chartMax) * 100 : 0
              const isToday = i === salesChart.length - 1
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs text-[#5c5e78]">{d.value > 0 ? formatCurrency(d.value, '') : ''}</span>
                  <div className="w-full relative flex items-end" style={{ height: '80px' }}>
                    <div
                      className={clsx(
                        'w-full rounded-t-lg transition-all duration-500',
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/20'
                          : 'bg-[#2a2a36] hover:bg-[#33334a]',
                      )}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className={clsx('text-xs font-medium', isToday ? 'text-indigo-400' : 'text-[#5c5e78]')}>
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Actividad reciente</CardTitle>
              <CardSubtitle>Últimos eventos</CardSubtitle>
            </div>
            <Activity size={15} className="text-[#5c5e78]" />
          </CardHeader>
          {activity.length === 0 ? (
            <p className="text-xs text-[#5c5e78] text-center py-6">Sin actividad reciente</p>
          ) : (
            <div className="space-y-1">
              {activity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#2a2a36] transition-colors cursor-default">
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    activityColorMap[item.status] ?? 'text-[#9496b0] bg-[#2a2a36]',
                  )}>
                    {item.type === 'sale' && <ShoppingCart size={12} />}
                    {item.type === 'alert' && <AlertTriangle size={12} />}
                    {item.type === 'purchase' && <Package size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#9496b0] leading-tight truncate">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-[#5c5e78] font-mono">{item.subtitle}</p>}
                    {item.amount != null && (
                      <p className="text-xs font-semibold text-[#e2e4f0] mt-0.5">{formatCurrency(item.amount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ventas recientes</CardTitle>
            <CardSubtitle>Últimas transacciones del sistema</CardSubtitle>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Ver todas <ArrowUpRight size={13} />
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a38]">
                {['N° Venta', 'Cliente', 'Fecha', 'Ítems', 'Total', 'Estado'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-[#5c5e78] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a38]/50">
              {mockSales.slice(0, 5).map(sale => (
                <tr key={sale.id} className="hover:bg-[#252530]/60 transition-colors cursor-default">
                  <td className="px-3 py-2.5 text-xs font-mono text-indigo-400">{sale.id}</td>
                  <td className="px-3 py-2.5 text-xs text-[#e2e4f0]">{sale.customer}</td>
                  <td className="px-3 py-2.5 text-xs text-[#9496b0]">{formatDate(sale.date)}</td>
                  <td className="px-3 py-2.5 text-xs text-[#9496b0]">{sale.items}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-[#e2e4f0]">{formatCurrency(sale.total)}</td>
                  <td className="px-3 py-2.5">
                    <Badge color={statusColor[sale.status]} dot>{statusLabel[sale.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alert Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-rose-500/20 bg-rose-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-300">Productos Agotados</p>
                <p className="text-xs text-[#5c5e78] mt-1">{stats.outOfStock} productos sin stock disponible</p>
                <button className="text-xs text-rose-400 hover:text-rose-300 font-medium mt-2 transition-colors">Ver lista →</button>
              </div>
            </div>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">Stock Bajo</p>
                <p className="text-xs text-[#5c5e78] mt-1">{stats.lowStock} productos bajo el mínimo permitido</p>
                <button className="text-xs text-amber-400 hover:text-amber-300 font-medium mt-2 transition-colors">Ver lista →</button>
              </div>
            </div>
          </Card>
          <Card className="border-sky-500/20 bg-sky-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                <Package size={15} className="text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-300">Compras del Mes</p>
                <p className="text-xs text-[#5c5e78] mt-1">{stats.recentPurchases} órdenes registradas este mes</p>
                <button className="text-xs text-sky-400 hover:text-sky-300 font-medium mt-2 transition-colors">Ver órdenes →</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {stats?.dueTodayDebtors?.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {stats.dueTodayDebtors.map((alert, idx) => (
            <Card
              key={`${alert.name}-${idx}`}
              className={idx % 2 === 0 ? 'border-rose-500/30 bg-rose-500/10' : 'border-amber-500/30 bg-amber-500/10'}
            >
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  idx % 2 === 0 ? 'bg-rose-500/20' : 'bg-amber-500/20',
                )}>
                  <AlertTriangle size={16} className={idx % 2 === 0 ? 'text-rose-300' : 'text-amber-300'} />
                </div>
                <div>
                  <p className={clsx('text-sm font-semibold', idx % 2 === 0 ? 'text-rose-200' : 'text-amber-200')}>
                    ¡Atencion! El deudor {alert.name} tiene un pago pendiente programado para el dia de hoy
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
