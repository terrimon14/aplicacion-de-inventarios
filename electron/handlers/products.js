const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerProductHandlers() {
  // List products with optional filters
  ipcMain.handle('db:products:list', (_, { search = '', categoryId, status, ubicacionId = null } = {}) => {
    let sql = `
      SELECT
        p.*,
        c.name as category_name,
        b.name as brand_name,
        COALESCE(iu1.cantidad, 0) as stock_almacen,
        COALESCE(iu2.cantidad, 0) as stock_tienda,
        (COALESCE(iu1.cantidad, 0) + COALESCE(iu2.cantidad, 0)) as stock_total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventario_ubicacion iu1 ON iu1.producto_id = p.id AND iu1.ubicacion_id = 1
      LEFT JOIN inventario_ubicacion iu2 ON iu2.producto_id = p.id AND iu2.ubicacion_id = 2
      WHERE 1=1
    `
    const params = []
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (categoryId) {
      sql += ` AND p.category_id = ?`
      params.push(categoryId)
    }
    if (status) {
      sql += ` AND p.status = ?`
      params.push(status)
    }
    sql += ` ORDER BY p.name ASC`
    const products = queryAll(sql, params)

    // Compute stock status based on selected location or global stock
    return products.map(p => ({
      ...p,
      stock: p.stock_total,
      stock_vista: ubicacionId === 1
        ? p.stock_almacen
        : ubicacionId === 2
          ? p.stock_tienda
          : p.stock_total,
      stockStatus: (ubicacionId === 1
        ? p.stock_almacen
        : ubicacionId === 2
          ? p.stock_tienda
          : p.stock_total) === 0
        ? 'out'
        : (ubicacionId === 1
            ? p.stock_almacen
            : ubicacionId === 2
              ? p.stock_tienda
              : p.stock_total) <= p.min_stock
          ? 'low'
          : 'normal',
    }))
  })

  // Get single product
  ipcMain.handle('db:products:get', (_, id) => {
    return queryOne(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [id])
  })

  // Create product
  ipcMain.handle('db:products:create', (_, data) => {
    run(`
      INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name, data.sku || null, data.barcode || null,
      data.category_id || null, data.brand_id || null,
      data.price ?? 0, data.cost ?? 0, data.stock ?? 0,
      data.min_stock ?? 5, data.unit || 'unidad', data.description || '',
    ])
    const id = lastInsertRowId()

    const totalStock = Number(data.stock ?? 0)
    const stockAlmacen = Math.floor(totalStock * 0.7)
    const stockTienda = totalStock - stockAlmacen
    run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 1, ?)`, [id, stockAlmacen])
    run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 2, ?)`, [id, stockTienda])

    return { id, ...data }
  })

  // Update product
  ipcMain.handle('db:products:update', (_, { id, ...data }) => {
    run(`
      UPDATE products SET
        name = ?, sku = ?, barcode = ?, category_id = ?, brand_id = ?,
        price = ?, cost = ?, stock = ?, min_stock = ?, unit = ?,
        description = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [
      data.name, data.sku || null, data.barcode || null,
      data.category_id || null, data.brand_id || null,
      data.price ?? 0, data.cost ?? 0, data.stock ?? 0,
      data.min_stock ?? 5, data.unit || 'unidad',
      data.description || '', data.status || 'active', id,
    ])

    if (typeof data.stock === 'number') {
      const stockAlmacen = Math.floor(Number(data.stock) * 0.7)
      const stockTienda = Number(data.stock) - stockAlmacen
      run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 1, 0)`, [id])
      run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, 2, 0)`, [id])
      run(`UPDATE inventario_ubicacion SET cantidad = ?, updated_at = datetime('now') WHERE producto_id = ? AND ubicacion_id = 1`, [stockAlmacen, id])
      run(`UPDATE inventario_ubicacion SET cantidad = ?, updated_at = datetime('now') WHERE producto_id = ? AND ubicacion_id = 2`, [stockTienda, id])
    }

    return { id, ...data }
  })

  // Delete product
  ipcMain.handle('db:products:delete', (_, id) => {
    run(`UPDATE products SET status = 'inactive' WHERE id = ?`, [id])
    return { id }
  })

  // Update stock directly
  ipcMain.handle('db:products:updateStock', (_, { id, delta, ubicacionId = null }) => {
    if (ubicacionId === 1 || ubicacionId === 2) {
      run(`INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad) VALUES (?, ?, 0)`, [id, ubicacionId])
      run(
        `UPDATE inventario_ubicacion
         SET cantidad = MAX(0, cantidad + ?), updated_at = datetime('now')
         WHERE producto_id = ? AND ubicacion_id = ?`,
        [delta, id, ubicacionId],
      )
    } else {
      run(`
        UPDATE inventario_ubicacion
        SET cantidad = CASE
          WHEN ubicacion_id = 1 THEN MAX(0, cantidad + ?)
          WHEN ubicacion_id = 2 THEN MAX(0, cantidad + ?)
          ELSE cantidad
        END,
        updated_at = datetime('now')
        WHERE producto_id = ?
      `, [Math.floor(delta * 0.7), delta - Math.floor(delta * 0.7), id])
    }

    const stock = queryOne(`
      SELECT
        p.id,
        COALESCE(iu1.cantidad, 0) as stock_almacen,
        COALESCE(iu2.cantidad, 0) as stock_tienda,
        (COALESCE(iu1.cantidad, 0) + COALESCE(iu2.cantidad, 0)) as stock
      FROM products p
      LEFT JOIN inventario_ubicacion iu1 ON iu1.producto_id = p.id AND iu1.ubicacion_id = 1
      LEFT JOIN inventario_ubicacion iu2 ON iu2.producto_id = p.id AND iu2.ubicacion_id = 2
      WHERE p.id = ?
    `, [id])

    run(`UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`, [stock?.stock ?? 0, id])
    return stock
  })

  ipcMain.handle('db:products:lowStock', (_, { ubicacionId = null } = {}) => {
    const rows = queryAll(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.min_stock,
        b.name as brand_name,
        COALESCE(iu1.cantidad, 0) as stock_almacen,
        COALESCE(iu2.cantidad, 0) as stock_tienda,
        (COALESCE(iu1.cantidad, 0) + COALESCE(iu2.cantidad, 0)) as stock_total
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN inventario_ubicacion iu1 ON iu1.producto_id = p.id AND iu1.ubicacion_id = 1
      LEFT JOIN inventario_ubicacion iu2 ON iu2.producto_id = p.id AND iu2.ubicacion_id = 2
      WHERE p.status = 'active'
      ORDER BY p.name ASC
    `)

    return rows
      .map((p) => {
        const stockActual = ubicacionId === 1
          ? Number(p.stock_almacen)
          : ubicacionId === 2
            ? Number(p.stock_tienda)
            : Number(p.stock_total)

        return {
          ...p,
          stock_actual: stockActual,
          stockStatus: stockActual === 0 ? 'out' : stockActual <= Number(p.min_stock) ? 'low' : 'normal',
        }
      })
      .filter((p) => p.stock_actual <= Number(p.min_stock))
  })
}
