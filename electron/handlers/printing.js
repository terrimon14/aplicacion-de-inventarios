const { ipcMain, BrowserWindow, dialog } = require('electron')
const fs = require('fs')

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatCell(value, type = 'text') {
  if (type === 'currency') {
    return `S/ ${Number(value ?? 0).toFixed(2)}`
  }
  if (type === 'number') {
    return Number(value ?? 0).toLocaleString('es-PE')
  }
  return escapeHtml(value ?? '-')
}

function buildPrintableHtml({ title, optionLabel, summary, rows }) {
  const now = new Date().toLocaleString('es-PE')

  const rowsHtml = rows.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.sku || '-')}</td>
      <td class="right">${Number(item.stock_vista ?? item.stock ?? 0)}</td>
      <td class="right">S/ ${Number(item.price ?? 0).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
    }
    * {
      box-sizing: border-box;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 24px;
      color: #111;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 2px solid #111;
      padding-bottom: 12px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .meta {
      font-size: 12px;
      color: #444;
      margin-top: 4px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .summary-card {
      border: 1px solid #bbb;
      padding: 10px;
    }
    .summary-label {
      font-size: 12px;
      color: #555;
    }
    .summary-value {
      margin-top: 4px;
      font-size: 16px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #999;
      padding: 8px;
    }
    th {
      background: #f2f2f2;
      text-align: left;
    }
    .right {
      text-align: right;
    }

    @page {
      size: A4;
      margin: 14mm;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
        background: #fff !important;
        color: #000 !important;
      }
      .summary-card,
      th,
      td {
        border-color: #000 !important;
      }
      .meta {
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <section class="header">
    <div>
      <h1 class="title">${escapeHtml(title)}</h1>
      <div class="meta">${escapeHtml(optionLabel)}</div>
    </div>
    <div class="meta">Generado: ${escapeHtml(now)}</div>
  </section>

  <section class="summary">
    <article class="summary-card">
      <div class="summary-label">Codigos</div>
      <div class="summary-value">${Number(summary.totalCodigos || summary.totalSku || 0)}</div>
    </article>
    <article class="summary-card">
      <div class="summary-label">Unidades</div>
      <div class="summary-value">${Number(summary.totalUnidades || 0)}</div>
    </article>
    <article class="summary-card">
      <div class="summary-label">Valor Inventario</div>
      <div class="summary-value">S/ ${Number(summary.totalValor || 0).toFixed(2)}</div>
    </article>
  </section>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Codigo</th>
        <th class="right">Stock</th>
        <th class="right">Precio</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>
`
}

function buildReportPrintableHtml({ title, optionLabel, summaryCards = [], columns = [], rows = [] }) {
  const now = new Date().toLocaleString('es-PE')

  const summaryHtml = summaryCards.map((card) => `
    <article class="summary-card">
      <div class="summary-label">${escapeHtml(card.label)}</div>
      <div class="summary-value">${escapeHtml(card.value)}</div>
    </article>
  `).join('')

  const headersHtml = columns.map((column) => `
    <th class="${column.align === 'right' ? 'right' : ''}">${escapeHtml(column.label)}</th>
  `).join('')

  const rowsHtml = rows.map((row) => `
    <tr>
      ${columns.map((column) => `
        <td class="${column.align === 'right' ? 'right' : ''}">${formatCell(row[column.key], column.type)}</td>
      `).join('')}
    </tr>
  `).join('')

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif; }
    body { margin: 0; padding: 24px; color: #111; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 12px; }
    .title { font-size: 20px; font-weight: 700; margin: 0; }
    .meta { font-size: 12px; color: #444; margin-top: 4px; }
    .summary { display: grid; grid-template-columns: repeat(${Math.max(1, Math.min(4, summaryCards.length || 1))}, 1fr); gap: 8px; margin-bottom: 12px; }
    .summary-card { border: 1px solid #bbb; padding: 10px; }
    .summary-label { font-size: 12px; color: #555; }
    .summary-value { margin-top: 4px; font-size: 16px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #999; padding: 8px; }
    th { background: #f2f2f2; text-align: left; }
    .right { text-align: right; }
    @page { size: A4 landscape; margin: 12mm; }
  </style>
</head>
<body>
  <section class="header">
    <div>
      <h1 class="title">${escapeHtml(title)}</h1>
      <div class="meta">${escapeHtml(optionLabel)}</div>
    </div>
    <div class="meta">Generado: ${escapeHtml(now)}</div>
  </section>

  ${summaryCards.length > 0 ? `<section class="summary">${summaryHtml}</section>` : ''}

  <table>
    <thead>
      <tr>${headersHtml}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>
`
}

async function exportPdf({ html, title, defaultFilename }) {
  const printWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 1200,
    webPreferences: { sandbox: false },
  })

  try {
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        marginType: 'custom',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    })

    const { canceled, filePath } = await dialog.showSaveDialog({
      title,
      defaultPath: defaultFilename,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })

    if (canceled || !filePath) {
      return { canceled: true }
    }

    fs.writeFileSync(filePath, pdfBuffer)
    return { canceled: false, filePath }
  } finally {
    if (!printWindow.isDestroyed()) {
      printWindow.close()
    }
  }
}

module.exports = function registerPrintingHandlers() {
  ipcMain.handle('app:inventory:exportPdf', async (_, payload = {}) => {
    const {
      title = 'Inventario',
      optionLabel = 'Inventario General',
      summary = {},
      rows = [],
    } = payload

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No hay datos para exportar')
    }

    const html = buildPrintableHtml({ title, optionLabel, summary, rows })

    return exportPdf({
      html,
      title: 'Guardar Inventario en PDF',
      defaultFilename: `inventario-${new Date().toISOString().slice(0, 10)}.pdf`,
    })
  })

  ipcMain.handle('app:reports:exportPdf', async (_, payload = {}) => {
    const {
      title = 'Reporte',
      optionLabel = 'Reporte del sistema',
      summaryCards = [],
      columns = [],
      rows = [],
    } = payload

    if (!Array.isArray(columns) || columns.length === 0 || !Array.isArray(rows) || rows.length === 0) {
      throw new Error('No hay tabla disponible para imprimir en este reporte')
    }

    const html = buildReportPrintableHtml({ title, optionLabel, summaryCards, columns, rows })

    return exportPdf({
      html,
      title: 'Guardar Reporte en PDF',
      defaultFilename: `reporte-${new Date().toISOString().slice(0, 10)}.pdf`,
    })
  })
}
