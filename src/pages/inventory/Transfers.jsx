import { useMemo, useState } from 'react'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import SearchInput from '../../components/ui/Search'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { productService } from '../../services/products'
import { transferService } from '../../services/transfers'

export default function Transfers() {
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { data: products = [], refetch: refetchProducts } = useAsync(
    async () => {
      const result = await productService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const { data: transfers = [], refetch: refetchTransfers } = useAsync(
    async () => {
      const result = await transferService.list()
      return Array.isArray(result) ? result : []
    },
    [],
    [],
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products.slice(0, 12)

    return products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(term) ||
          String(product.sku || '').toLowerCase().includes(term)
        )
      })
      .slice(0, 12)
  }, [products, search])

  const selectedProduct = useMemo(() => {
    return products.find((product) => Number(product.id) === Number(selectedProductId)) || null
  }, [products, selectedProductId])

  const qty = Number(quantity)
  const stockAlmacen = Number(selectedProduct?.stock_almacen || 0)
  const stockTienda = Number(selectedProduct?.stock_tienda || 0)

  const validationError = !selectedProduct
    ? 'Selecciona un producto para continuar.'
    : quantity === ''
      ? 'Ingresa una cantidad a traspasar.'
      : qty <= 0
        ? 'La cantidad a traspasar debe ser mayor a 0.'
        : qty > stockAlmacen
          ? `No puedes traspasar ${qty}. Solo hay ${stockAlmacen} en Almacen Central.`
          : ''

  const isInvalid = Boolean(validationError)

  const confirmTransfer = async () => {
    if (isInvalid || !selectedProduct) return

    setSaving(true)
    setMessage('')
    try {
      const result = await transferService.create({
        productId: selectedProduct.id,
        quantity: qty,
        note: 'Traspaso interno Almacen Central -> Tienda',
      })

      await refetchProducts()
      await refetchTransfers()

      setQuantity('')
      setMessage(
        `Traspaso realizado: ${result.quantity} uds de ${result.productName}. Nuevo stock - Almacen: ${result.stock_almacen}, Tienda: ${result.stock_tienda}.`,
      )
      window.dispatchEvent(new CustomEvent('app:data:changed', { detail: { source: 'transfers' } }))
    } catch (error) {
      setMessage(error.message || 'No se pudo confirmar el traspaso.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <Breadcrumb items={['Inventario', 'Traspasos']} />
        <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Traspasos Internos</h1>
        <p className="text-sm text-[#5c5e78]">Mover stock de Almacen Central (1) hacia Tienda (2)</p>
      </div>

      {message && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <p className="text-sm text-indigo-200">{message}</p>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nuevo Traspaso</CardTitle>
            <CardSubtitle>Selecciona producto, valida stock y confirma movimiento interno</CardSubtitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre o SKU..."
            />

            <div className="rounded-xl border border-[#2a2a38] overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-[#5c5e78] border-b border-[#2a2a38]">
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-center">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-[#5c5e78]">
                          Sin resultados.
                        </td>
                      </tr>
                    ) : filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-b border-[#2a2a38]/60 ${
                          Number(selectedProductId) === Number(product.id) ? 'bg-indigo-500/10' : 'text-[#e2e4f0]'
                        }`}
                      >
                        <td className="px-3 py-2">{product.name}</td>
                        <td className="px-3 py-2 text-[#9496b0]">{product.sku || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <Button variant="secondary" size="xs" onClick={() => setSelectedProductId(product.id)}>
                            Seleccionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Origen: Almacen Central</p>
                <p className="text-lg font-bold text-[#e2e4f0] mt-1">{selectedProduct ? stockAlmacen : '-'}</p>
              </div>
              <div className="rounded-lg border border-[#2a2a38] bg-[#1e1e27] p-3">
                <p className="text-xs text-[#5c5e78]">Destino: Tienda</p>
                <p className="text-lg font-bold text-[#e2e4f0] mt-1">{selectedProduct ? stockTienda : '-'}</p>
              </div>
            </div>

            <Input
              label="Cantidad a Traspasar"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              error={validationError || undefined}
            />

            <Button
              className="w-full"
              loading={saving}
              disabled={isInvalid}
              onClick={confirmTransfer}
            >
              🔄 Confirmar Traspaso Interno
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historial de Traspasos</CardTitle>
            <CardSubtitle>Auditoria de movimientos internos recientes</CardSubtitle>
          </div>
        </CardHeader>

        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Producto</Th>
            <Th>Origen</Th>
            <Th>Destino</Th>
            <Th align="center">Cantidad</Th>
            <Th align="center">Estado</Th>
          </THead>
          <TBody>
            {transfers.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center text-[#5c5e78]">No hay traspasos registrados.</Td>
              </Tr>
            ) : transfers.map((row) => (
              <Tr key={row.id}>
                <Td muted>{new Date(row.created_at).toLocaleString('es-PE')}</Td>
                <Td>{row.product_name}</Td>
                <Td muted>{row.from_location_name}</Td>
                <Td muted>{row.to_location_name}</Td>
                <Td align="center"><span className="font-semibold text-indigo-300">{row.quantity}</span></Td>
                <Td align="center"><Badge color="sky">Completado</Badge></Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
