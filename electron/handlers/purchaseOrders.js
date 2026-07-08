const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId, withTransaction } = require('../database/index')

function generateRef(prefix = 'OC') {
  const rows = queryAll(`SELECT COUNT(*) as cnt FROM purchase_orders`)
  const cnt = (rows[0]?.cnt ?? 0) + 1
  return `${prefix}-${String(cnt).padStart(4, '0')}`
}

module.exports = function registerPurchaseOrderHandlers() {
  ipcMain.handle('db:purchaseOrders:list', () => {
    return queryAll(`
      SELECT po.*,
             COUNT(poi.id) as items_count,
             COALESCE(SUM(poi.qty_requested), 0) as qty_total
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON poi.order_id = po.id
      GROUP BY po.id
      ORDER BY po.created_at DESC
    `)
  })

  ipcMain.handle('db:purchaseOrders:get', (_, id) => {
    const order = queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [id])
    if (!order) return null

    const items = queryAll(`
      SELECT *
      FROM purchase_order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `, [id])

    const suppliers = Array.from(new Set(items.map((item) => item.supplier_suggested).filter(Boolean)))
    const supplierName = suppliers.length === 0
      ? 'Proveedor por definir'
      : suppliers.length === 1
        ? suppliers[0]
        : 'Varios proveedores'

    return { ...order, supplier_name: supplierName, items }
  })

  ipcMain.handle('db:purchaseOrders:suggest', (_, { ubicacionId = null } = {}) => {
    const rows = queryAll(`
      SELECT
        p.id as product_id,
        p.name,
        p.min_stock,
        b.name as brand_name,
        COALESCE(iu1.cantidad, 0) as stock_almacen,
        COALESCE(iu2.cantidad, 0) as stock_tienda,
        (COALESCE(iu1.cantidad, 0) + COALESCE(iu2.cantidad, 0)) as stock_total,
        (
          SELECT COALESCE(pu.supplier_name, '')
          FROM purchase_items pi
          JOIN purchases pu ON pu.id = pi.purchase_id
          WHERE pi.product_id = p.id
          ORDER BY pu.created_at DESC
          LIMIT 1
        ) as supplier_suggested
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN inventario_ubicacion iu1 ON iu1.producto_id = p.id AND iu1.ubicacion_id = 1
      LEFT JOIN inventario_ubicacion iu2 ON iu2.producto_id = p.id AND iu2.ubicacion_id = 2
      WHERE p.status = 'active'
      ORDER BY p.name ASC
    `)

    return rows
      .map((row) => {
        const stockActual = ubicacionId === 1
          ? Number(row.stock_almacen)
          : ubicacionId === 2
            ? Number(row.stock_tienda)
            : Number(row.stock_total)

        const qtySuggested = Math.max(Number(row.min_stock) - stockActual, 0)

        return {
          product_id: row.product_id,
          product_name: row.name,
          brand_name: row.brand_name || '-',
          supplier_suggested: row.supplier_suggested || 'Proveedor por definir',
          stock_actual: stockActual,
          min_stock: Number(row.min_stock),
          qty_requested: qtySuggested === 0 ? 1 : qtySuggested,
        }
      })
      .filter((row) => row.stock_actual <= row.min_stock)
  })

  ipcMain.handle('db:purchaseOrders:create', (_, { ubicacionId = null, items = [], notes = '' } = {}) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('La orden debe contener al menos un item')
    }

    const reference = generateRef('OC')

    run(
      `INSERT INTO purchase_orders (reference, status, ubicacion_id, notes)
       VALUES (?, 'pending_receipt', ?, ?)`,
      [reference, ubicacionId, notes],
    )

    const orderId = lastInsertRowId()

    items.forEach((item) => {
      run(
        `INSERT INTO purchase_order_items
          (order_id, product_id, product_name, brand_name, supplier_suggested, stock_actual, qty_requested)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.brand_name || '',
          item.supplier_suggested || '',
          Number(item.stock_actual || 0),
          Number(item.qty_requested || 1),
        ],
      )
    })

    return queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [orderId])
  })

  ipcMain.handle('db:purchaseOrders:receive', (_, id) => {
    const order = queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [id])
    if (!order) throw new Error('Orden no encontrada')
    if (order.status !== 'pending_receipt') throw new Error('La orden ya fue procesada o cancelada')

    const items = queryAll(`SELECT * FROM purchase_order_items WHERE order_id = ?`, [id])
    if (items.length === 0) throw new Error('La orden no tiene items')

    try {
      withTransaction((tx) => {
        items.forEach((item) => {
          tx.run(
            `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
             VALUES (?, 1, 0)`,
            [item.product_id],
          )

          tx.run(
            `UPDATE inventario_ubicacion
             SET cantidad = cantidad + ?, updated_at = datetime('now')
             WHERE producto_id = ? AND ubicacion_id = 1`,
            [Number(item.qty_requested || 0), item.product_id],
          )

          const row = tx.queryOne(
            `SELECT COALESCE(SUM(cantidad), 0) as stock_total
             FROM inventario_ubicacion
             WHERE producto_id = ?`,
            [item.product_id],
          )

          tx.run(
            `UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`,
            [Number(row?.stock_total ?? 0), item.product_id],
          )
        })

        tx.run(
          `UPDATE purchase_orders
           SET status = 'received'
           WHERE id = ?`,
          [id],
        )
      })

      return queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [id])
    } catch (error) {
      throw new Error(`No se pudo recibir la orden: ${error.message}`, { cause: error })
    }
  })
}
