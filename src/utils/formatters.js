export const formatCurrency = (value, symbol = 'S/') => {
  if (value === null || value === undefined) return `${symbol} 0.00`
  return `${symbol} ${Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0'
  return Number(value).toLocaleString('es-PE')
}

export const statusLabel = {
  completed: 'Completado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
  active: 'Activo',
  inactive: 'Inactivo',
  normal: 'Normal',
  low: 'Bajo',
  out: 'Agotado',
}

export const statusColor = {
  completed: 'emerald',
  pending: 'amber',
  cancelled: 'rose',
  active: 'emerald',
  inactive: 'slate',
  normal: 'emerald',
  low: 'amber',
  out: 'rose',
  success: 'emerald',
  warning: 'amber',
  error: 'rose',
  info: 'sky',
}

export const truncate = (str, len = 30) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}
