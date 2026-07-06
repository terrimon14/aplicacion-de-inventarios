import { BarChart2, TrendingUp, ShoppingCart, Package, Download } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { mockSalesChart } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatters'

const chartMax = Math.max(...mockSalesChart.map(d => d.value))

const topProducts = [
  { name: 'Laptop HP 14" Core i5', sold: 34, revenue: 153000 },
  { name: 'Monitor LG 24" FHD', sold: 28, revenue: 50400 },
  { name: 'Teclado Mecánico Redragon', sold: 52, revenue: 14560 },
  { name: 'RAM Corsair 16GB DDR4', sold: 45, revenue: 18900 },
  { name: 'SSD Samsung 1TB', sold: 22, revenue: 16500 },
]

const revenueMax = Math.max(...topProducts.map(p => p.revenue))

export default function Reports() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Reportes']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Reportes</h1>
          <p className="text-sm text-[#5c5e78]">Análisis de rendimiento del negocio</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download}>Exportar Reporte</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ingresos del mes', value: formatCurrency(284750), icon: TrendingUp, color: 'indigo', change: '+8.1%' },
          { label: 'Unidades vendidas', value: '1,284', icon: ShoppingCart, color: 'emerald', change: '+12.4%' },
          { label: 'Ticket promedio', value: formatCurrency(1250), icon: BarChart2, color: 'violet', change: '+3.2%' },
          { label: 'Margen bruto', value: '33.1%', icon: Package, color: 'sky', change: '+0.8%' },
        ].map((k, i) => {
          const Icon = k.icon
          const colorMap = { indigo: 'bg-indigo-500/12 text-indigo-400', emerald: 'bg-emerald-500/12 text-emerald-400', violet: 'bg-violet-500/12 text-violet-400', sky: 'bg-sky-500/12 text-sky-400' }
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[k.color].split(' ')[0]}`}>
                  <Icon size={17} className={colorMap[k.color].split(' ')[1]} />
                </div>
                <span className="text-xs font-medium text-emerald-400">{k.change}</span>
              </div>
              <p className="text-xl font-bold text-[#e2e4f0]">{k.value}</p>
              <p className="text-xs text-[#5c5e78] mt-1">{k.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Ventas semanales</CardTitle>
              <CardSubtitle>Comparativo por día</CardSubtitle>
            </div>
          </CardHeader>
          <div className="flex items-end gap-2 h-40">
            {mockSalesChart.map((d, i) => {
              const pct = (d.value / chartMax) * 100
              const isToday = i === mockSalesChart.length - 1
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full relative flex items-end" style={{ height: '96px' }}>
                    <div
                      className={isToday
                        ? 'w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'w-full rounded-t-lg bg-[#2a2a36] hover:bg-[#33334a]'
                      }
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-[#5c5e78]'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Productos más vendidos</CardTitle>
              <CardSubtitle>Por ingresos generados</CardSubtitle>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5c5e78] w-4">#{i + 1}</span>
                    <span className="text-xs text-[#e2e4f0] font-medium">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#e2e4f0]">{formatCurrency(p.revenue)}</span>
                    <span className="text-xs text-[#5c5e78] ml-1.5">{p.sold} uds</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#2a2a36] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${(p.revenue / revenueMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
