import { useMemo, useState } from 'react'
import { Printer, Store, Warehouse, Layers3 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { productService } from '../../services/products'
import { formatCurrency } from '../../utils/formatters'

const OPTIONS = [
  {
    id: 'store',
    ubicacionId: 2,
    label: 'Imprimir Stock de Tienda',
    subtitle: 'Solo existencias del mostrador',
    Icon: Store,
  },
  {
    id: 'warehouse',
    ubicacionId: 1,
    label: 'Imprimir Stock de Almacen Central',
    subtitle: 'Solo inventario del almacen',
    Icon: Warehouse,
  },
  {
    id: 'general',
    ubicacionId: null,
    label: 'Imprimir Inventario General',
    subtitle: 'Ambas ubicaciones en paralelo',
    Icon: Layers3,
  },
]

export default function PrintInventoryModal({ isOpen, onClose }) {
  const [option, setOption] = useState('store')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [previewData, setPreviewData] = useState([])

  const selected = OPTIONS.find(o => o.id === option) ?? OPTIONS[0]

  const summary = useMemo(() => {
    const totalSku = previewData.length
    const totalUnidades = previewData.reduce((acc, p) => acc + (Number(p.stock_vista ?? p.stock ?? 0)), 0)
    const totalValor = previewData.reduce((acc, p) => acc + (Number(p.stock_vista ?? p.stock ?? 0) * Number(p.price ?? 0)), 0)
    return { totalSku, totalUnidades, totalValor }
  }, [previewData])

  const loadPreview = async () => {
    setLoading(true)
    setFeedback('')
    try {
      const rows = await productService.list({ ubicacionId: selected.ubicacionId })
      setPreviewData(Array.isArray(rows) ? rows : [])
    } finally {
      setLoading(false)
    }
  }

  const exportPdf = async () => {
    if (previewData.length === 0) return

    setExporting(true)
    setFeedback('')
    try {
      const result = await productService.exportInventoryPdf({
        title: 'Inventario - Reporte Imprimible',
        optionLabel: selected.label,
        summary,
        rows: previewData,
      })

      if (result?.canceled) {
        setFeedback('Exportacion cancelada por el usuario.')
      } else {
        setFeedback(`PDF generado correctamente en: ${result?.filePath}`)
      }
    } catch (error) {
      setFeedback(error.message || 'No se pudo exportar el inventario a PDF.')
    } finally {
      setExporting(false)
    }
  }

  const handleClose = () => {
    setPreviewData([])
    setFeedback('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Imprimir Inventario"
      size="xl"
      footer={(
        <>
          <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
          <Button variant="outline" loading={loading} onClick={loadPreview}>Generar Vista Previa</Button>
          <Button icon={Printer} loading={exporting} disabled={previewData.length === 0} onClick={exportPdf}>Exportar PDF</Button>
        </>
      )}
    >
      <div className="space-y-4">
        {feedback && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-indigo-200">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {OPTIONS.map((item) => (
            <label
              key={item.id}
              className={[
                'cursor-pointer rounded-xl border p-3 transition-all',
                option === item.id
                  ? 'border-indigo-500/60 bg-indigo-500/10'
                  : 'border-[#2a2a38] bg-[#252530] hover:border-[#3a3a52]',
              ].join(' ')}
            >
              <input
                type="radio"
                name="print-inventory-option"
                checked={option === item.id}
                onChange={() => setOption(item.id)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1e1e27] border border-[#2a2a38] flex items-center justify-center">
                  <item.Icon size={16} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e2e4f0]">{item.label}</p>
                  <p className="text-xs text-[#9496b0] mt-1">{item.subtitle}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-[#2a2a38] bg-[#14141b]">
          <div className="px-4 py-3 border-b border-[#2a2a38] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#e2e4f0]">Vista previa de impresion</p>
              <p className="text-xs text-[#5c5e78]">Plantilla preparada para exportacion PDF</p>
            </div>
            <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
              {selected.label}
            </span>
          </div>

          <div className="px-4 py-3 text-xs text-[#9496b0] grid grid-cols-3 gap-3 border-b border-[#2a2a38]">
            <p>SKU: <span className="text-[#e2e4f0] font-semibold">{summary.totalSku}</span></p>
            <p>Unidades: <span className="text-[#e2e4f0] font-semibold">{summary.totalUnidades}</span></p>
            <p>Valor: <span className="text-[#e2e4f0] font-semibold">{formatCurrency(summary.totalValor)}</span></p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {previewData.length === 0 ? (
              <div className="px-4 py-10 text-center text-[#5c5e78] text-sm">
                Genera una vista previa para revisar el inventario imprimible.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#2a2a38] text-[#5c5e78] text-xs uppercase">
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2 text-right">Stock</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a38]/50 text-[#e2e4f0]">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2 text-[#9496b0]">{item.sku || '-'}</td>
                      <td className="px-4 py-2 text-right font-semibold">{item.stock_vista ?? item.stock}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
