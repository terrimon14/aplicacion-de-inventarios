import { useMemo, useState } from 'react'
import { Eye, NotebookPen } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { saleService } from '../../services/sales'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, statusColor, statusLabel } from '../../utils/formatters'

const PAGE_SIZE = 5

export default function SalesHistory() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)

  const { data: sales = [] } = useAsync(
    async () => {
      const result = await saleService.list({ search, from, to })
      return Array.isArray(result) ? result : []
    },
    [search, from, to],
    [],
  )

  const filtered = useMemo(() => sales.map((sale, index) => ({
    ...sale,
    noteNumber: sales.length - index,
  })), [sales])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = filtered
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + Number(s.total), 0)

  const openDetail = async (saleId) => {
    const detail = await saleService.get(saleId)
    setSelectedNote(detail)
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <div>
          <Breadcrumb items={['Ventas', 'Historial']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Historial de Notas de Venta</h1>
          <p className="text-sm text-[#5c5e78]">{filtered.length} notas registradas</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total notas', value: filtered.length },
          { label: 'Completadas', value: filtered.filter(s => s.status === 'completed').length },
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
              placeholder="Buscar por nota o cliente..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Input
            type="date"
            label="Fecha inicio"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1) }}
            containerClassName="w-48"
          />
          <Input
            type="date"
            label="Fecha fin"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1) }}
            containerClassName="w-48"
          />
        </div>

        <Table>
          <THead>
            <Th>Nota</Th>
            <Th>Cliente</Th>
            <Th>Fecha</Th>
            <Th align="center">Ítems</Th>
            <Th align="right">Total</Th>
            <Th align="center">Estado</Th>
            <Th align="center">Detalle</Th>
          </THead>
          <TBody>
            {paginated.map(s => (
              <Tr key={s.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <NotebookPen size={14} className="text-indigo-300" />
                    <span className="font-mono text-xs text-indigo-400">
                      Nota #{s.noteNumber} - {new Date(s.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </Td>
                <Td><span className="font-medium text-[#e2e4f0]">{s.customer_name}</span></Td>
                <Td muted>{new Date(s.created_at).toLocaleDateString('es-PE')}</Td>
                <Td align="center" muted>{s.item_count}</Td>
                <Td align="right"><span className="font-semibold text-[#e2e4f0]">{formatCurrency(s.total)}</span></Td>
                <Td align="center">
                  <Badge color={statusColor[s.status]} dot>{statusLabel[s.status]}</Badge>
                </Td>
                <Td align="center">
                  <button
                    onClick={() => openDetail(s.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-sky-400 hover:bg-sky-500/10 transition-all mx-auto"
                  >
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

      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote ? `Detalle ${selectedNote.reference}` : 'Detalle'}
        size="lg"
      >
        {!selectedNote ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p className="text-[#9496b0]">Cliente: <span className="text-[#e2e4f0]">{selectedNote.customer_name}</span></p>
              <p className="text-[#9496b0]">Fecha: <span className="text-[#e2e4f0]">{new Date(selectedNote.created_at).toLocaleString('es-PE')}</span></p>
            </div>
            <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a38] text-xs uppercase text-[#5c5e78]">
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-right">Cantidad</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedNote.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a38]/60 text-[#e2e4f0]">
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <p className="text-base font-semibold text-[#e2e4f0]">Total: {formatCurrency(selectedNote.total)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
