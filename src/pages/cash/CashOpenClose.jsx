import { useMemo, useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { cashService } from '../../services/cash'
import { formatCurrency } from '../../utils/formatters'

export default function CashOpenClose() {
  const [openingBalance, setOpeningBalance] = useState('')
  const [realBalance, setRealBalance] = useState('')
  const [savingOpen, setSavingOpen] = useState(false)
  const [savingClose, setSavingClose] = useState(false)
  const [message, setMessage] = useState('')

  const { data: summary, refetch } = useAsync(
    async () => {
      const result = await cashService.summary(1)
      return result || { current: null, lastClosed: null }
    },
    [],
    { current: null, lastClosed: null },
  )

  const current = summary?.current || null
  const lastClosed = summary?.lastClosed || null

  const expectedBalance = Number(current?.expected_balance || 0)
  const opening = Number(current?.opening_balance || 0)
  const salesCash = Number(current?.sales_cash || 0)
  const debtCollections = Number(current?.debt_collections || 0)
  const expenses = Number(current?.manual_expenses || 0)

  const closeDifference = useMemo(() => {
    const counted = Number(realBalance)
    if (!Number.isFinite(counted)) return null
    return counted - expectedBalance
  }, [realBalance, expectedBalance])

  const openError = openingBalance === ''
    ? 'Ingresa el monto inicial.'
    : Number(openingBalance) < 0
      ? 'El monto inicial debe ser mayor o igual a 0.'
      : ''

  const closeError = realBalance === ''
    ? 'Ingresa el monto real contado.'
    : Number(realBalance) < 0
      ? 'El monto real debe ser mayor o igual a 0.'
      : ''

  const openCash = async () => {
    if (openError) return
    setSavingOpen(true)
    setMessage('')
    try {
      await cashService.openSession({
        user_id: 1,
        opening_balance: Number(openingBalance),
      })
      setOpeningBalance('')
      setMessage('Caja abierta correctamente. El POS ha quedado desbloqueado.')
      await refetch()
      window.dispatchEvent(new CustomEvent('app:data:changed', { detail: { source: 'cash-open' } }))
    } catch (error) {
      setMessage(error.message || 'No se pudo abrir la caja.')
    } finally {
      setSavingOpen(false)
    }
  }

  const closeCash = async () => {
    if (!current || closeError) return

    setSavingClose(true)
    setMessage('')
    try {
      const result = await cashService.closeSession({
        session_id: current.id,
        user_id: 1,
        real_balance: Number(realBalance),
      })

      const difference = Number(result?.difference || 0)
      const detail = difference === 0
        ? 'Caja cerrada sin descuadre.'
        : difference > 0
          ? `Caja cerrada con sobrante de ${formatCurrency(difference)}.`
          : `Caja cerrada con faltante de ${formatCurrency(Math.abs(difference))}.`

      setRealBalance('')
      setMessage(detail)
      await refetch()
      window.dispatchEvent(new CustomEvent('app:data:changed', { detail: { source: 'cash-close' } }))
    } catch (error) {
      setMessage(error.message || 'No se pudo cerrar la caja.')
    } finally {
      setSavingClose(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Caja', 'Apertura y Cierre']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Apertura y Cierre de Caja</h1>
        <p className="text-sm text-[#5c5e78]">Control de turnos, arqueo y descuadres</p>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      {!current ? (
        <Card className="max-w-xl">
          <CardHeader>
            <div>
              <CardTitle>Apertura de Caja</CardTitle>
              <CardSubtitle>No hay una sesion abierta para el usuario actual.</CardSubtitle>
            </div>
            <Badge color="rose" dot>Cerrada</Badge>
          </CardHeader>

          <div className="space-y-3">
            <Input
              label="Monto Inicial en Efectivo (S/)"
              type="number"
              min={0}
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              error={openError || undefined}
            />
            <Button className="w-full" loading={savingOpen} disabled={!!openError} onClick={openCash}>
              Abrir Caja del Turno
            </Button>
          </div>

          {lastClosed && (
            <div className="mt-4 rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
              <p className="text-xs text-[#5c5e78]">Ultima caja cerrada</p>
              <p className="text-sm text-[#e2e4f0] mt-1">
                Fecha: {new Date(lastClosed.closing_date || lastClosed.closed_at).toLocaleString('es-PE')}
              </p>
              <p className="text-sm text-[#9496b0]">
                Esperado: {formatCurrency(lastClosed.expected_balance)} | Real: {formatCurrency(lastClosed.real_balance)}
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Arqueo de Caja</CardTitle>
                <CardSubtitle>Sesion abierta desde {new Date(current.opening_date || current.opened_at).toLocaleString('es-PE')}</CardSubtitle>
              </div>
              <Badge color="emerald" dot>Abierta</Badge>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Monto inicial</p>
                <p className="text-lg font-bold text-[#e2e4f0] mt-1">{formatCurrency(opening)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Saldo esperado</p>
                <p className="text-lg font-bold text-indigo-300 mt-1">{formatCurrency(expectedBalance)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Ventas en efectivo</p>
                <p className="text-lg font-bold text-emerald-300 mt-1">{formatCurrency(salesCash)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Cobranzas de deudores</p>
                <p className="text-lg font-bold text-sky-300 mt-1">{formatCurrency(debtCollections)}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3 md:col-span-2">
                <p className="text-xs text-[#5c5e78]">Gastos registrados</p>
                <p className="text-lg font-bold text-rose-300 mt-1">{formatCurrency(expenses)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#2a2a38] bg-[#14141b] p-3 text-sm text-[#9496b0]">
              <p>
                Saldo Esperado = Monto Inicial + Ventas en Efectivo + Cobranzas de Deudores - Gastos Registrados
              </p>
              <p className="mt-1 text-[#e2e4f0]">
                {formatCurrency(opening)} + {formatCurrency(salesCash)} + {formatCurrency(debtCollections)} - {formatCurrency(expenses)} = {formatCurrency(expectedBalance)}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cierre de Caja</CardTitle>
                <CardSubtitle>Ingresa el conteo fisico</CardSubtitle>
              </div>
            </CardHeader>

            <div className="space-y-3">
              <Input
                label="Monto Real en Caja (S/)"
                type="number"
                min={0}
                step="0.01"
                value={realBalance}
                onChange={(e) => setRealBalance(e.target.value)}
                placeholder="0.00"
                error={closeError || undefined}
              />

              {closeDifference !== null && (
                <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                  <p className="text-xs text-[#5c5e78]">Resultado del arqueo</p>
                  <p className={`text-sm font-semibold mt-1 ${
                    closeDifference === 0
                      ? 'text-emerald-300'
                      : closeDifference > 0
                        ? 'text-sky-300'
                        : 'text-rose-300'
                  }`}>
                    {closeDifference === 0
                      ? 'Cuadre exacto'
                      : closeDifference > 0
                        ? `Sobrante: ${formatCurrency(closeDifference)}`
                        : `Faltante: ${formatCurrency(Math.abs(closeDifference))}`}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                variant="danger"
                loading={savingClose}
                disabled={!!closeError}
                onClick={closeCash}
              >
                Confirmar Cierre de Caja
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
