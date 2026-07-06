import { useState } from 'react'
import { Plus, Download, Upload, Filter, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Card, { CardHeader, CardTitle, CardSubtitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/Search'
import Table, { THead, Th, TBody, Tr, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Input, { Select } from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import Loading from '../../components/ui/Loading'
import Alert from '../../components/ui/Alert'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { formatCurrency, statusColor, statusLabel } from '../../utils/formatters'
import { clsx } from 'clsx'

const PAGE_SIZE = 8

export default function Products() {
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [formError, setFormError] = useState(null)

  const {
    products, loading, error, refetch,
    search, setSearch,
    status, setStatus,
    createProduct, creating,
    updateProduct, updating,
    deleteProduct,
  } = useProducts()

  const { categories } = useCategories()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const filtered = products // filtering is done in the hook via IPC
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setEditProduct(null)
    reset({})
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    reset({
      name: p.name, sku: p.sku, barcode: p.barcode,
      category_id: p.category_id, price: p.price,
      cost: p.cost, stock: p.stock, min_stock: p.min_stock,
      description: p.description,
    })
    setFormError(null)
    setShowModal(true)
  }

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      if (editProduct) {
        await updateProduct({ id: editProduct.id, ...data })
      } else {
        await createProduct(data)
      }
      setShowModal(false)
      reset({})
    } catch (err) {
      setFormError(err?.message ?? 'Error al guardar el producto')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return
    await deleteProduct(id)
  }

  if (loading && products.length === 0) return <Loading text="Cargando productos..." />

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Breadcrumb items={['Inventario', 'Productos']} />
          <h1 className="text-xl font-bold text-[#e2e4f0] mt-2">Productos</h1>
          <p className="text-sm text-[#5c5e78]">{products.length} productos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refetch} />
          <Button variant="secondary" size="sm" icon={Upload}>Importar</Button>
          <Button variant="secondary" size="sm" icon={Download}>Exportar</Button>
          <Button size="sm" icon={Plus} onClick={openCreate}>Nuevo Producto</Button>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <SearchInput
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select
            containerClassName="w-40"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="low">Stock Bajo</option>
            <option value="out">Agotado</option>
          </Select>
          <Select containerClassName="w-40">
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>

        {paginated.length === 0 ? (
          <EmptyState
            title="No se encontraron productos"
            description="Intenta cambiar los filtros o agrega un nuevo producto"
            action={<Button size="sm" icon={Plus} onClick={openCreate}>Nuevo Producto</Button>}
          />
        ) : (
          <>
            <Table>
              <THead>
                <Th>Producto</Th>
                <Th>SKU</Th>
                <Th>Categoría</Th>
                <Th align="right">Precio</Th>
                <Th align="right">Costo</Th>
                <Th align="center">Stock</Th>
                <Th align="center">Estado</Th>
                <Th align="center">Acciones</Th>
              </THead>
              <TBody>
                {paginated.map(p => {
                  const stockSt = p.stockStatus ?? (p.stock === 0 ? 'out' : p.stock <= p.min_stock ? 'low' : 'normal')
                  return (
                    <Tr key={p.id}>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#2a2a36] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#5c5e78]">{p.name[0]}</span>
                          </div>
                          <span className="font-medium text-[#e2e4f0] max-w-44 truncate">{p.name}</span>
                        </div>
                      </Td>
                      <Td muted><span className="font-mono text-xs">{p.sku || '—'}</span></Td>
                      <Td muted>{p.category_name || p.category || '—'}</Td>
                      <Td align="right"><span className="font-semibold">{formatCurrency(p.price)}</span></Td>
                      <Td align="right" muted>{formatCurrency(p.cost)}</Td>
                      <Td align="center">
                        <span className={clsx(
                          'font-semibold',
                          p.stock === 0 ? 'text-rose-400' : p.stock <= (p.min_stock ?? 5) ? 'text-amber-400' : 'text-emerald-400',
                        )}>{p.stock}</span>
                      </Td>
                      <Td align="center">
                        <Badge color={statusColor[stockSt]} dot>
                          {statusLabel[stockSt]}
                        </Badge>
                      </Td>
                      <Td align="center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#5c5e78] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  )
                })}
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
          </>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button
              loading={creating || updating}
              onClick={handleSubmit(onSubmit)}
            >
              {editProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </>
        }
      >
        {formError && <Alert type="error" className="mb-4">{formError}</Alert>}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre del producto *"
            placeholder="Ej: Laptop HP Core i5"
            containerClassName="col-span-2"
            error={errors.name?.message}
            {...register('name', { required: 'El nombre es requerido' })}
          />
          <Input
            label="SKU"
            placeholder="Ej: LAP-HP-001"
            {...register('sku')}
          />
          <Input
            label="Código de barras"
            placeholder="Ej: 7501234567890"
            {...register('barcode')}
          />
          <Select
            label="Categoría"
            {...register('category_id')}
          >
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input
            label="Unidad"
            placeholder="unidad / kg / caja"
            {...register('unit')}
          />
          <Input
            label="Precio de venta *"
            placeholder="0.00"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', { required: 'El precio es requerido', valueAsNumber: true })}
          />
          <Input
            label="Precio de costo"
            placeholder="0.00"
            type="number"
            step="0.01"
            {...register('cost', { valueAsNumber: true })}
          />
          <Input
            label="Stock inicial"
            placeholder="0"
            type="number"
            {...register('stock', { valueAsNumber: true })}
          />
          <Input
            label="Stock mínimo"
            placeholder="5"
            type="number"
            {...register('min_stock', { valueAsNumber: true })}
          />
          <Input
            label="Descripción"
            placeholder="Descripción del producto..."
            containerClassName="col-span-2"
            {...register('description')}
          />
        </div>
      </Modal>
    </div>
  )
}
