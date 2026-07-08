import { useMemo, useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import SearchInput from '../../components/ui/Search'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { customerService } from '../../services/customers'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency } from '../../utils/formatters'

export default function Debtors() {
  const [search, setSearch] = useState('')
  const [selectedDebtor, setSelectedDebtor] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { data: debtors = [], refetch: refetchDebtors } = useAsync(
    async () => {
      const result = await customerService.debtors()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const { data: installments = [], refetch: refetchInstallments } = useAsync(
    async () => {
      if (!selectedDebtor?.customer_id) return []
      const result = await customerService.installments(selectedDebtor.customer_id)
      return Array.isArray(result) ? result : []
    },
    [selectedDebtor?.customer_id],
    [],
  )

  const { data: paymentHistory = [], refetch: refetchPaymentHistory } = useAsync(
    async () => {
      if (!selectedDebtor?.customer_id) return []
      const result = await customerService.paymentHistory(selectedDebtor.customer_id)
      return Array.isArray(result) ? result : []
    },
    [selectedDebtor?.customer_id],
    [],
  )

  const filtered = debtors.filter((debtor) =>
    debtor.name.toLowerCase().includes(search.toLowerCase()) ||
    String(debtor.phone || '').toLowerCase().includes(search.toLowerCase())
  )

  const paymentNumeric = Number(paymentAmount)
  const totalDebt = Number(selectedDebtor?.saldo_pendiente || 0)
  const isAmountEmpty = paymentAmount === ''
  const isAmountInvalid = isAmountEmpty || !Number.isFinite(paymentNumeric) || paymentNumeric <= 0 || paymentNumeric > totalDebt

  const amountError = isAmountEmpty
    ? 'Ingresa un monto para continuar.'
    : paymentNumeric <= 0
      ? 'El monto debe ser mayor a S/ 0.'
      : paymentNumeric > totalDebt
        ? `El monto no puede superar la deuda total (${formatCurrency(totalDebt)}).`
        : ''

  const previewImpact = useMemo(() => {
    if (isAmountInvalid || installments.length === 0) return []

    let remaining = paymentNumeric
    const pendingQuotas = [...installments]
      .filter((q) => ['pending', 'partial', 'overdue'].includes(q.status) && Number(q.pending_amount) > 0)
      .sort((a, b) => {
        const da = new Date(a.due_date).getTime()
        const db = new Date(b.due_date).getTime()
        if (da !== db) return da - db
        return Number(a.id) - Number(b.id)
      })

    const events = []
    for (const quota of pendingQuotas) {
      if (remaining <= 0) break
      const pending = Number(quota.pending_amount)
      if (pending <= 0) continue

      const applied = Math.min(remaining, pending)
      if (applied >= pending) {
        events.push(`Se liquidara por completo la Cuota #${quota.id} (${formatCurrency(pending)}).`)
      } else {
        const rest = pending - applied
        events.push(`Se abonaran ${formatCurrency(applied)} a la Cuota #${quota.id}. Quedara saldo de ${formatCurrency(rest)}.`)
      }
      remaining -= applied
    }

    if (remaining > 0) {
      events.push(`Quedara un excedente no aplicado de ${formatCurrency(remaining)}.`)
    }

    return events
  }, [installments, isAmountInvalid, paymentNumeric])

  const openPaymentModal = (debtor) => {
    setSelectedDebtor(debtor)
    setPaymentAmount('')
    setMessage('')
  }

  const closePaymentModal = () => {
    setSelectedDebtor(null)
    setPaymentAmount('')
    setMessage('')
  }

  const registerPayment = async () => {
    if (!selectedDebtor?.customer_id) return

    setSaving(true)
    setMessage('')
    try {
      const result = await customerService.registerPayment({
        customerId: selectedDebtor.customer_id,
        amount: Number(paymentAmount),
        paymentDate,
      })

      await refetchDebtors()
      await refetchInstallments()
      await refetchPaymentHistory()

      const paid = Number(result?.paidTotal || 0)
      const remaining = Number(result?.summary?.saldo_pendiente || 0)
      setMessage(`Pago registrado por ${formatCurrency(paid)}. Saldo pendiente actual: ${formatCurrency(remaining)}.`)
      setPaymentAmount('')

      window.dispatchEvent(new CustomEvent('app:data:changed', { detail: { source: 'collections' } }))
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar el pago.')
    } finally {
      setSaving(false)
    }
  }

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
            <Th align="center">Accion</Th>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <Tr>
                <Td className="text-center text-[#5c5e78]" colSpan={7}>No hay deudores registrados.</Td>
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
                  <Td align="center">
                    <Button variant="secondary" size="xs" onClick={() => openPaymentModal(debtor)}>
                      💵 Registrar Pago
                    </Button>
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!selectedDebtor}
        onClose={closePaymentModal}
        title={selectedDebtor ? `Registrar Pago - ${selectedDebtor.name}` : 'Registrar Pago'}
        size="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={closePaymentModal}>Cerrar</Button>
            <Button loading={saving} disabled={isAmountInvalid} onClick={registerPayment}>Guardar Pago</Button>
          </>
        )}
      >
        {!selectedDebtor ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Cliente</p>
                <p className="text-sm text-[#e2e4f0] font-semibold mt-1">{selectedDebtor.name}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Saldo Pendiente</p>
                <p className="text-sm text-rose-300 font-semibold mt-1">{formatCurrency(selectedDebtor.saldo_pendiente)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Cuotas Pendientes</p>
                <p className="text-sm text-[#e2e4f0] font-semibold mt-1">{selectedDebtor.cuotas_pendientes}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto recibido hoy (S/)"
                type="number"
                min={0}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                error={amountError}
              />
              <Input
                label="Fecha de pago"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-[#2a2a38] bg-[#14141b] p-3">
              <p className="text-sm font-semibold text-[#e2e4f0] mb-2">Vista Previa del Impacto</p>
              {previewImpact.length === 0 ? (
                <p className="text-xs text-[#5c5e78]">
                  Ingresa un monto valido para previsualizar como se amortizaran las cuotas.
                </p>
              ) : (
                <ul className="space-y-1">
                  {previewImpact.map((item, idx) => (
                    <li key={`${idx}-${item}`} className="text-xs text-[#9496b0]">• {item}</li>
                  ))}
                </ul>
              )}
            </div>

            {message && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-indigo-200">
                {message}
              </div>
            )}

            <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
              <div className="px-3 py-2 border-b border-[#2a2a38] text-sm font-semibold text-[#e2e4f0]">
                Cuotas programadas (la amortizacion se aplica de la mas antigua a la mas reciente)
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#5c5e78] border-b border-[#2a2a38]">
                    <th className="px-3 py-2 text-left">Venta</th>
                    <th className="px-3 py-2 text-center">Vencimiento</th>
                    <th className="px-3 py-2 text-right">Monto</th>
                    <th className="px-3 py-2 text-right">Pagado</th>
                    <th className="px-3 py-2 text-right">Pendiente</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-[#5c5e78]">
                        No hay cuotas registradas para este cliente.
                      </td>
                    </tr>
                  ) : installments.map((quota) => (
                    <tr
                      key={quota.id}
                      className={`border-b border-[#2a2a38]/60 text-[#e2e4f0] ${(
                        quota.status === 'overdue' ||
                        (
                          new Date(quota.due_date).getTime() < new Date().setHours(0, 0, 0, 0) &&
                          ['pending', 'partial'].includes(quota.status)
                        )
                      ) ? 'bg-rose-500/10' : ''}`}
                    >
                      <td className="px-3 py-2">{quota.sale_reference || '-'}</td>
                      <td className="px-3 py-2 text-center">{new Date(quota.due_date).toLocaleDateString('es-PE')}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(quota.amount)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(quota.paid_amount)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(quota.pending_amount)}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge color={quota.status === 'paid' ? 'emerald' : quota.status === 'partial' ? 'amber' : 'rose'}>
                          {quota.status === 'paid'
                            ? 'Pagada'
                            : quota.status === 'partial'
                              ? 'Pendiente Parcial'
                              : quota.status === 'overdue'
                                ? 'Vencida'
                                : 'Pendiente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
              <div className="px-3 py-2 border-b border-[#2a2a38] text-sm font-semibold text-[#e2e4f0]">
                Historial de pagos
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#5c5e78] border-b border-[#2a2a38]">
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Venta</th>
                    <th className="px-3 py-2 text-center">Cuota</th>
                    <th className="px-3 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-[#5c5e78]">
                        Sin pagos registrados todavia.
                      </td>
                    </tr>
                  ) : paymentHistory.map((row) => (
                    <tr key={row.id} className="border-b border-[#2a2a38]/60 text-[#e2e4f0]">
                      <td className="px-3 py-2">{new Date(row.payment_date).toLocaleDateString('es-PE')}</td>
                      <td className="px-3 py-2">{row.sale_reference || '-'}</td>
                      <td className="px-3 py-2 text-center">#{row.installment_id}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
