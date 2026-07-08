const { ipcMain } = require('electron')
const { queryAll, queryOne, withTransaction } = require('../database/index')

module.exports = function registerTransferHandlers() {
  ipcMain.handle('db:transfers:list', () => {
    return queryAll(`
      SELECT
        t.*,
        p.name as product_name,
        p.sku as product_sku,
        f.nombre as from_location_name,
        d.nombre as to_location_name
      FROM inventory_transfers t
      JOIN products p ON p.id = t.product_id
      JOIN ubicaciones f ON f.id = t.from_location_id
      JOIN ubicaciones d ON d.id = t.to_location_id
      ORDER BY t.created_at DESC
      LIMIT 200
    `)
  })

  ipcMain.handle('db:transfers:create', (_, { productId, quantity, note = '' } = {}) => {
    const qty = Number(quantity || 0)
    const pid = Number(productId)

    if (!Number.isFinite(pid) || pid <= 0) {
      throw new Error('Producto invalido')
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error('La cantidad a traspasar debe ser mayor a 0')
    }

    const product = queryOne(`SELECT id, name FROM products WHERE id = ?`, [pid])
    if (!product) {
      throw new Error('Producto no encontrado')
    }

    const origin = queryOne(
      `SELECT cantidad FROM inventario_ubicacion WHERE producto_id = ? AND ubicacion_id = 1`,
      [pid],
    )

    const stockOrigen = Number(origin?.cantidad || 0)
    if (qty > stockOrigen) {
      throw new Error('No hay stock suficiente en Almacen Central para realizar el traspaso')
    }

    return withTransaction((tx) => {
      tx.run(
        `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
         VALUES (?, 1, 0)`,
        [pid],
      )
      tx.run(
        `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
         VALUES (?, 2, 0)`,
        [pid],
      )

      tx.run(
        `UPDATE inventario_ubicacion
         SET cantidad = cantidad - ?, updated_at = datetime('now')
         WHERE producto_id = ? AND ubicacion_id = 1`,
        [qty, pid],
      )
      tx.run(
        `UPDATE inventario_ubicacion
         SET cantidad = cantidad + ?, updated_at = datetime('now')
         WHERE producto_id = ? AND ubicacion_id = 2`,
        [qty, pid],
      )

      tx.run(
        `INSERT INTO inventory_transfers (product_id, from_location_id, to_location_id, quantity, note)
         VALUES (?, 1, 2, ?, ?)`,
        [pid, qty, note],
      )

      const total = tx.queryOne(
        `SELECT COALESCE(SUM(cantidad), 0) as stock_total
         FROM inventario_ubicacion
         WHERE producto_id = ?`,
        [pid],
      )

      tx.run(
        `UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`,
        [Number(total?.stock_total || 0), pid],
      )

      const stock = tx.queryOne(
        `SELECT
           COALESCE(MAX(CASE WHEN ubicacion_id = 1 THEN cantidad END), 0) as stock_almacen,
           COALESCE(MAX(CASE WHEN ubicacion_id = 2 THEN cantidad END), 0) as stock_tienda
         FROM inventario_ubicacion
         WHERE producto_id = ?`,
        [pid],
      )

      return {
        productId: pid,
        productName: product.name,
        quantity: qty,
        stock_almacen: Number(stock?.stock_almacen || 0),
        stock_tienda: Number(stock?.stock_tienda || 0),
      }
    })
  })
}
