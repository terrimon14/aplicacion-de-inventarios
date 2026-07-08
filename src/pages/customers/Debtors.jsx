import { useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import SearchInput from '../../components/ui/Search'
import Badge from '../../components/ui/Badge'
import { customerService } from '../../services/customers'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/formatters'

export default function Debtors() {
  const [search, setSearch] = useState('')

  const { data: debtors = [] } = useAsync(
    async () => {
      const result = await customerService.debtors()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const filtered = debtors.filter((debtor) =>
    debtor.name.toLowerCase().includes(search.toLowerCase()) ||
    String(debtor.phone || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Clientes', 'Lista de Deudores']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Lista de Deudores</h1>
        <p className="text-sm text-[#5c5e78]">Clientes con saldos pendientes y cronograma de cuotas</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clientes con deuda</CardTitle>
            <CardSubtitle>Control de saldos y vencimientos</CardSubtitle>
          </div>
          <div className="w-72">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente o telefono..."
            />
          </div>
        </CardHeader>

        <Table>
          <THead>
            <Th>Cliente</Th>
            <Th>Contacto</Th>
            <Th align="center">Cuotas pendientes</Th>
            <Th align="right">Saldo pendiente</Th>
            <Th align="center">Proximo vencimiento</Th>
            <Th align="center">Estado</Th>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <Tr>
                <Td className="text-center text-[#5c5e78]" colSpan={6}>No hay deudores registrados.</Td>
              </Tr>
            ) : filtered.map((debtor) => {
              const vencimiento = debtor.proximo_vencimiento
                ? new Date(debtor.proximo_vencimiento).toLocaleDateString('es-PE')
                : '-'

              return (
                <Tr key={debtor.customer_id}>
                  <Td>
                    <span className="font-medium text-[#e2e4f0]">{debtor.name}</span>
                  </Td>
                  <Td muted>{debtor.phone || debtor.email || '-'}</Td>
                  <Td align="center" muted>{debtor.cuotas_pendientes}</Td>
                  <Td align="right">
                    <span className="font-semibold text-rose-300">{formatCurrency(debtor.saldo_pendiente)}</span>
                  </Td>
                  <Td align="center" muted>{vencimiento}</Td>
                  <Td align="center">
                    <Badge color="amber" dot>Pendiente</Badge>
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
