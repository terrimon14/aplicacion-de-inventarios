import { useState } from 'react'
import { Eye, Download, Filter } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import Breadcrumb from '../../components/ui/Breadcrumb'
import { Select } from '../../components/ui/Input'
import { mockSales } from '../../data/mockData'
import { formatCurrency, formatDate, statusColor, statusLabel } from '../../utils/formatters'

const PAGE_SIZE = 5

export default function SalesHistory() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = mockSales.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = mockSales
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + s.total, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Ventas', 'Historial']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Historial de Ventas</h1>
          <p className="text-sm text-[#5c5e78]">{mockSales.length} ventas registradas</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download}>Exportar</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total ventas', value: mockSales.length },
          { label: 'Completadas', value: mockSales.filter(s => s.status === 'completed').length },
          { label: 'Ingresos', value: formatCurrency(totalRevenue) },
        ].map((s, i) => (
          <Card key={i}>
            <p className="text-lg font-bold text-[#e2e4f0]">{s.value}</p>
            <p className="text-xs text-[#5c5e78] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <SearchInput
              placeholder="Buscar por N° o cliente..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select
            containerClassName="w-36"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          >
            <option value="all">Todos</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Cancelados</option>
          </Select>
          <Button variant="secondary" size="sm" icon={Filter}>Fecha</Button>
        </div>

        <Table>
          <THead>
            <Th>N° Venta</Th>
            <Th>Cliente</Th>
            <Th>Fecha</Th>
            <Th align="center">Ítems</Th>
            <Th align="right">Total</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Acción</Th>
          </THead>
          <TBody>
            {paginated.map(s => (
              <Tr key={s.id}>
                <Td><span className="font-mono text-xs text-indigo-400">{s.id}</span></Td>
                <Td><span className="font-medium text-[#e2e4f0]">{s.customer}</span></Td>
                <Td muted>{formatDate(s.date)}</Td>
                <Td align="center" muted>{s.items}</Td>
                <Td align="right"><span className="font-semibold text-[#e2e4f0]">{formatCurrency(s.total)}</span></Td>
                <Td align="center">
                  <Badge color={statusColor[s.status]} dot>{statusLabel[s.status]}</Badge>
                </Td>
                <Td align="center">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-sky-400 hover:bg-sky-500/10 transition-all mx-auto">
                    <Eye size={13} />
                  </button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      </Card>
    </div>
  )
}
