import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingCart, Package, Printer, Wallet } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { reportService } from '../../services/dashboard'
import { formatCurrency } from '../../utils/formatters'

function toDateInput(value) {
  return value.toISOString().slice(0, 10)
}

function dateRangeFromPreset(preset, customFrom, customTo) {
  const now = new Date()
  const today = toDateInput(now)

  if (preset === 'today') {
    return { from: today, to: today }
  }

  if (preset === 'week') {
    const start = new Date(now)
    const day = start.getDay()
    const diff = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - diff)
    return { from: toDateInput(start), to: today }
  }

  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: toDateInput(start), to: today }
  }

  return {
    from: customFrom || null,
    to: customTo || null,
  }
}

const reportViews = {
  '/reports': 'sales',
  '/reports/sales': 'sales',
  '/reports/purchases': 'purchases',
  '/reports/profits': 'profits',
  '/reports/top-products': 'top-products',
  '/reports/inventory': 'inventory',
}

export default function Reports() {
  const location = useLocation()
  const navigate = useNavigate()

  const [preset, setPreset] = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [inventoryScope, setInventoryScope] = useState('all')
  const [printing, setPrinting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const activeView = reportViews[location.pathname] || 'sales'
  const filters = useMemo(
    () => dateRangeFromPreset(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const { data: summary } = useAsync(
    async () => {
      const result = await reportService.summary({
        from: filters.from,
        to: filters.to,
        inventoryScope,
      })
      return result || {}
    },
    [filters.from, filters.to, inventoryScope],
    {},
  )

  const { data: salesData = [] } = useAsync(
    async () => {
      const result = await reportService.sales({ from: filters.from, to: filters.to })
      return Array.isArray(result) ? result : []
    },
    [filters.from, filters.to],
    [],
  )

  const { data: purchaseData = [] } = useAsync(
    async () => {
      const result = await reportService.purchases({ from: filters.from, to: filters.to })
      return Array.isArray(result) ? result : []
    },
    [filters.from, filters.to],
    [],
  )

  const { data: profitData } = useAsync(
    async () => {
      const result = await reportService.profits({ from: filters.from, to: filters.to })
      return result || {}
    },
    [filters.from, filters.to],
    {},
  )

  const { data: topProducts = [] } = useAsync(
    async () => {
      const result = await reportService.topProducts({ from: filters.from, to: filters.to, limit: 10 })
      return Array.isArray(result) ? result : []
    },
    [filters.from, filters.to],
    [],
  )

  const { data: inventoryData } = useAsync(
    async () => {
      const result = await reportService.inventory({ scope: inventoryScope })
      return result || { summary: {}, rows: [] }
    },
    [inventoryScope],
    { summary: {}, rows: [] },
  )

  const chartSource = activeView === 'purchases' ? purchaseData : salesData
  const chartMax = Math.max(1, ...chartSource.map((d) => Number(d.total || 0)))
  const topMax = Math.max(1, ...topProducts.map((p) => Number(p.sold || 0)))

  const tabs = [
    { key: 'sales', label: 'Ventas', path: '/reports/sales' },
    { key: 'purchases', label: 'Compras', path: '/reports/purchases' },
    { key: 'profits', label: 'Ganancias', path: '/reports/profits' },
    { key: 'top-products', label: 'Mas Vendidos', path: '/reports/top-products' },
    { key: 'inventory', label: 'Inventario Valorado', path: '/reports/inventory' },
  ]

  const reportMetaLabel = `Periodo: ${filters.from || 'inicio'} a ${filters.to || 'hoy'}`

  const printCurrentReport = async () => {
    const configByView = {
      sales: {
        title: 'Reporte de Ventas',
        columns: [
          { key: 'date', label: 'Fecha' },
          { key: 'count', label: 'Notas', align: 'right', type: 'number' },
          { key: 'units', label: 'Unidades', align: 'right', type: 'number' },
          { key: 'total', label: 'Total Ventas', align: 'right', type: 'currency' },
        ],
        rows: salesData,
        summaryCards: [
          { label: 'Total Ventas', value: formatCurrency(summary?.totalSales || 0) },
          { label: 'Total Gastos', value: formatCurrency(summary?.totalExpenses || 0) },
          { label: 'Ganancia Neta', value: formatCurrency(summary?.netProfit || 0) },
        ],
      },
      purchases: {
        title: 'Reporte de Compras',
        columns: [
          { key: 'date', label: 'Fecha' },
          { key: 'count', label: 'Compras', align: 'right', type: 'number' },
          { key: 'units', label: 'Unidades', align: 'right', type: 'number' },
          { key: 'total', label: 'Total Compras', align: 'right', type: 'currency' },
        ],
        rows: purchaseData,
        summaryCards: [
          { label: 'Total Compras', value: formatCurrency(summary?.totalPurchases || 0) },
          { label: 'Total Gastos', value: formatCurrency(summary?.totalExpenses || 0) },
          { label: 'Valor Inventario', value: formatCurrency(summary?.inventoryValue || 0) },
        ],
      },
      profits: {
        title: 'Reporte de Ganancias',
        columns: [
          { key: 'concept', label: 'Concepto' },
          { key: 'value', label: 'Valor', align: 'right', type: 'currency' },
        ],
        rows: [
          { concept: 'Ingreso bruto por items', value: profitData?.grossRevenue || 0 },
          { concept: 'Costo historico vendido', value: profitData?.historicalCost || 0 },
          { concept: 'Ganancia bruta', value: profitData?.grossProfit || 0 },
          { concept: 'Gastos del periodo', value: profitData?.expenses || 0 },
          { concept: 'Ganancia neta', value: profitData?.netProfit || 0 },
        ],
        summaryCards: [
          { label: 'Ganancia Bruta', value: formatCurrency(profitData?.grossProfit || 0) },
          { label: 'Gastos', value: formatCurrency(profitData?.expenses || 0) },
          { label: 'Ganancia Neta', value: formatCurrency(profitData?.netProfit || 0) },
        ],
      },
      'top-products': {
        title: 'Reporte de Productos Mas Vendidos',
        columns: [
          { key: 'rank', label: '#' },
          { key: 'name', label: 'Producto' },
          { key: 'sku', label: 'Codigo' },
          { key: 'sold', label: 'Unidades', align: 'right', type: 'number' },
          { key: 'revenue', label: 'Ingresos', align: 'right', type: 'currency' },
          { key: 'gross_profit', label: 'Ganancia Bruta', align: 'right', type: 'currency' },
        ],
        rows: topProducts.map((row, index) => ({ ...row, rank: index + 1 })),
        summaryCards: [
          { label: 'Productos listados', value: String(topProducts.length) },
          { label: 'Top unidades', value: String(Number(topProducts[0]?.sold || 0)) },
          { label: 'Mayor ingreso', value: formatCurrency(topProducts[0]?.revenue || 0) },
        ],
      },
      inventory: {
        title: 'Reporte de Inventario Valorado',
        columns: [
          { key: 'name', label: 'Producto' },
          { key: 'sku', label: 'Codigo' },
          { key: 'quantity', label: 'Cantidad', align: 'right', type: 'number' },
          { key: 'cost', label: 'Costo Unitario', align: 'right', type: 'currency' },
          { key: 'price', label: 'Precio Venta', align: 'right', type: 'currency' },
          { key: 'total_cost', label: 'Costo Total', align: 'right', type: 'currency' },
          { key: 'total_return', label: 'Retorno Estimado', align: 'right', type: 'currency' },
          { key: 'projected_margin', label: 'Margen', align: 'right', type: 'currency' },
        ],
        rows: inventoryData?.rows || [],
        summaryCards: [
          { label: 'Costo Total', value: formatCurrency(inventoryData?.summary?.totalCost || 0) },
          { label: 'Retorno Total', value: formatCurrency(inventoryData?.summary?.totalReturn || 0) },
          { label: 'Margen Proyectado', value: formatCurrency(inventoryData?.summary?.projectedMargin || 0) },
        ],
      },
    }

    const config = configByView[activeView]
    if (!config || !Array.isArray(config.rows) || config.rows.length === 0) {
      setFeedback('No hay tabla disponible para imprimir con el filtro actual.')
      return
    }

    setPrinting(true)
    setFeedback('')
    try {
      const result = await reportService.exportPdf({
        title: config.title,
        optionLabel: reportMetaLabel,
        summaryCards: config.summaryCards,
        columns: config.columns,
        rows: config.rows,
      })

      setFeedback(
        result?.canceled
          ? 'Impresion cancelada por el usuario.'
          : `Reporte generado correctamente en: ${result?.filePath}`,
      )
    } catch (error) {
      setFeedback(error.message || 'No se pudo imprimir el reporte.')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Reportes']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Reportes</h1>
          <p className="text-sm text-[#5c5e78]">Análisis de rendimiento del negocio</p>
        </div>
        <Button variant="secondary" size="sm" icon={Printer} loading={printing} onClick={printCurrentReport}>Imprimir Reporte</Button>
      </div>

      {feedback && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{feedback}</p>
        </Card>
      )}

      <Card>
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'custom', label: 'Personalizado' },
            ].map((option) => (
              <Button
                key={option.id}
                variant={preset === option.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPreset(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <Input
              label="Desde"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              disabled={preset !== 'custom'}
            />
            <Input
              label="Hasta"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              disabled={preset !== 'custom'}
            />
            <Select
              label="Inventario"
              value={inventoryScope}
              onChange={(e) => setInventoryScope(e.target.value)}
            >
              <option value="all">Total Consolidado</option>
              <option value="warehouse">Almacen Central</option>
              <option value="store">Tienda</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Ventas',
            value: formatCurrency(summary?.totalSales || 0),
            icon: TrendingUp,
            color: 'indigo',
          },
          {
            label: 'Total Gastos',
            value: formatCurrency(summary?.totalExpenses || 0),
            icon: Wallet,
            color: 'rose',
          },
          {
            label: 'Ganancia Neta',
            value: formatCurrency(summary?.netProfit || 0),
            icon: ShoppingCart,
            color: 'emerald',
          },
          {
            label: 'Valor del Inventario',
            value: formatCurrency(summary?.inventoryValue || 0),
            icon: Package,
            color: 'sky',
          },
        ].map((k, i) => {
          const Icon = k.icon
          const colorMap = {
            indigo: 'bg-indigo-500/12 text-indigo-400',
            emerald: 'bg-emerald-500/12 text-emerald-400',
            rose: 'bg-rose-500/12 text-rose-400',
            sky: 'bg-sky-500/12 text-sky-400',
          }
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[k.color].split(' ')[0]}`}>
                  <Icon size={17} className={colorMap[k.color].split(' ')[1]} />
                </div>
                <span className="text-xs font-medium text-[#5c5e78]">KPI</span>
              </div>
              <p className="text-xl font-bold text-[#e2e4f0]">{k.value}</p>
              <p className="text-xs text-[#5c5e78] mt-1">{k.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeView === tab.key ? 'primary' : 'secondary'}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {(activeView === 'sales' || activeView === 'purchases') && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{activeView === 'sales' ? 'Ventas por día' : 'Compras por día'}</CardTitle>
              <CardSubtitle>Comparativo por fecha en el rango seleccionado</CardSubtitle>
            </div>
          </CardHeader>

          <div className="flex items-end gap-2 h-48">
            {chartSource.length === 0 ? (
              <p className="text-sm text-[#5c5e78]">Sin datos para el periodo seleccionado.</p>
            ) : chartSource.map((row) => {
              const pct = (Number(row.total || 0) / chartMax) * 100
              return (
                <div key={row.date} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full relative flex items-end" style={{ height: '110px' }}>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400"
                      style={{ height: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#5c5e78]">{row.date}</span>
                  <span className="text-[10px] text-[#9496b0]">{formatCurrency(row.total)}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {activeView === 'profits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ganancia Neta</CardTitle>
                <CardSubtitle>Resultado final del periodo</CardSubtitle>
              </div>
            </CardHeader>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9496b0]">Ingreso bruto por items</span>
                <span className="text-[#e2e4f0]">{formatCurrency(profitData?.grossRevenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9496b0]">Costo historico vendido</span>
                <span className="text-[#e2e4f0]">{formatCurrency(profitData?.historicalCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9496b0]">Ganancia bruta</span>
                <span className="text-emerald-300">{formatCurrency(profitData?.grossProfit || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9496b0]">Gastos del periodo</span>
                <span className="text-rose-300">{formatCurrency(profitData?.expenses || 0)}</span>
              </div>
              <div className="h-px bg-[#2a2a38]" />
              <div className="flex justify-between">
                <span className="text-[#e2e4f0] font-semibold">Ganancia neta</span>
                <span className="text-indigo-300 font-bold">{formatCurrency(profitData?.netProfit || 0)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Formula aplicada</CardTitle>
                <CardSubtitle>Calculo financiero de utilidad</CardSubtitle>
              </div>
            </CardHeader>

            <div className="rounded-lg border border-[#2a2a38] bg-[#14141b] p-3 text-sm text-[#9496b0] leading-relaxed">
              <p>Ganancia por item = Precio de Venta del item - Costo historico del producto</p>
              <p className="mt-2">Ganancia bruta = Sum((Precio Venta - Costo historico) * Cantidad)</p>
              <p className="mt-2">Ganancia neta = Ganancia bruta - Gastos de caja del periodo</p>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'top-products' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top 10 Productos Mas Vendidos</CardTitle>
              <CardSubtitle>Ranking por unidades vendidas</CardSubtitle>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-[#5c5e78]">Sin ventas en el rango seleccionado.</p>
            ) : topProducts.map((row, index) => (
              <div key={row.id || row.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5c5e78] w-4">#{index + 1}</span>
                    <span className="text-xs text-[#e2e4f0] font-medium">{row.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#e2e4f0]">{Number(row.sold || 0)} uds</span>
                    <span className="text-xs text-[#5c5e78] ml-2">{formatCurrency(row.revenue || 0)}</span>
                  </div>
                </div>
                <div className="h-2 bg-[#2a2a36] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full"
                    style={{ width: `${(Number(row.sold || 0) / topMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeView === 'inventory' && (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Inventario Valorado</CardTitle>
                <CardSubtitle>
                  {inventoryScope === 'all' ? 'Total Consolidado' : inventoryScope === 'warehouse' ? 'Almacen Central' : 'Tienda'}
                </CardSubtitle>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Costo Total Invertido</p>
                <p className="text-lg font-bold text-[#e2e4f0] mt-1">{formatCurrency(inventoryData?.summary?.totalCost || 0)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Retorno Estimado Total</p>
                <p className="text-lg font-bold text-sky-300 mt-1">{formatCurrency(inventoryData?.summary?.totalReturn || 0)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Margen Proyectado</p>
                <p className="text-lg font-bold text-emerald-300 mt-1">{formatCurrency(inventoryData?.summary?.projectedMargin || 0)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <Table>
              <THead>
                <Th>Producto</Th>
                <Th>Codigo</Th>
                <Th align="center">Cantidad</Th>
                <Th align="right">Costo Unitario</Th>
                <Th align="right">Precio Venta</Th>
                <Th align="right">Costo Total</Th>
                <Th align="right">Retorno Estimado</Th>
                <Th align="right">Margen</Th>
              </THead>
              <TBody>
                {(inventoryData?.rows || []).length === 0 ? (
                  <Tr>
                    <Td colSpan={8} className="text-center text-[#5c5e78]">Sin datos de inventario.</Td>
                  </Tr>
                ) : (inventoryData?.rows || []).map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.name}</Td>
                    <Td muted>{row.sku || '-'}</Td>
                    <Td align="center">{Number(row.quantity || 0)}</Td>
                    <Td align="right" muted>{formatCurrency(row.cost || 0)}</Td>
                    <Td align="right" muted>{formatCurrency(row.price || 0)}</Td>
                    <Td align="right">{formatCurrency(row.total_cost || 0)}</Td>
                    <Td align="right">{formatCurrency(row.total_return || 0)}</Td>
                    <Td align="right">
                      <Badge color="emerald">{formatCurrency(row.projected_margin || 0)}</Badge>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  )
}
