import { useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { cashService } from '../../services/cash'
import { formatCurrency } from '../../utils/formatters'

export default function CashMovements() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { data: currentSession, refetch: refetchSession } = useAsync(
    async () => {
      const result = await cashService.currentSession(1)
      return result || null
    },
    [],
    null,
  )

  const { data: movements = [], refetch: refetchMovements } = useAsync(
    async () => {
      if (!currentSession?.id) return []
      const result = await cashService.movements({ session_id: currentSession.id })
      return Array.isArray(result) ? result : []
    },
    [currentSession?.id],
    [],
  )

  const amountValue = Number(amount)
  const amountError = amount === ''
    ? 'Ingresa un monto.'
    : amountValue <= 0
      ? 'El monto debe ser mayor a 0.'
      : ''

  const descriptionError = !description.trim()
    ? 'La descripcion es obligatoria.'
    : ''

  const isInvalid = !currentSession || !!amountError || !!descriptionError

  const saveMovement = async () => {
    if (isInvalid) return

    setSaving(true)
    setMessage('')
    try {
      await cashService.addMovement({
        session_id: currentSession.id,
        type: 'out',
        amount: amountValue,
        description: description.trim(),
      })
      setAmount('')
      setDescription('')
      setMessage('Gasto registrado correctamente.')

      await refetchMovements()
      await refetchSession()
      window.dispatchEvent(new CustomEvent('app:data:changed', { detail: { source: 'cash-movement' } }))
    } catch (error) {
      setMessage(error.message || 'No se pudo registrar el gasto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Caja', 'Movimientos / Gastos']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Movimientos de Caja</h1>
        <p className="text-sm text-[#5c5e78]">Registro de egresos manuales de caja chica</p>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      {!currentSession ? (
        <Card>
          <p className="text-sm text-rose-300">
            No hay caja abierta. Debes abrir una sesion en "Apertura y Cierre" antes de registrar gastos.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Registrar Egreso / Gasto</CardTitle>
                <CardSubtitle>Sesion activa #{currentSession.id}</CardSubtitle>
              </div>
              <Badge color="amber" dot>Tipo: Egreso/Gasto</Badge>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Monto (S/)"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                error={amountError || undefined}
              />
              <Input
                label="Descripcion"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Compra de articulos de limpieza"
                error={descriptionError || undefined}
                containerClassName="md:col-span-2"
              />
            </div>

            <div className="mt-3">
              <Button loading={saving} disabled={isInvalid} onClick={saveMovement}>
                Guardar Gasto
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardSubtitle>Ultimos movimientos de la sesion abierta</CardSubtitle>
              </div>
            </CardHeader>

            <Table>
              <THead>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Descripcion</Th>
                <Th align="right">Monto</Th>
              </THead>
              <TBody>
                {movements.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} className="text-center text-[#5c5e78]">No hay movimientos registrados.</Td>
                  </Tr>
                ) : movements.map((movement) => (
                  <Tr key={movement.id}>
                    <Td muted>{new Date(movement.created_at).toLocaleString('es-PE')}</Td>
                    <Td>
                      <Badge color={movement.type === 'in' ? 'emerald' : 'rose'}>
                        {movement.type === 'in' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </Td>
                    <Td>{movement.description || '-'}</Td>
                    <Td align="right">
                      <span className={movement.type === 'in' ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                        {movement.type === 'in' ? '+' : '-'}{formatCurrency(movement.amount)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
