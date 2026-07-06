const { ipcMain } = require('electron')
const { queryAll, queryOne, run, lastInsertRowId } = require('../database/index')

module.exports = function registerProductHandlers() {
  // List products with optional filters
  ipcMain.handle('db:products:list', (_, { search = '', categoryId, status } = {}) => {
    let sql = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
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

    // Compute stock status
    return products.map(p => ({
      ...p,
      stockStatus: p.stock === 0 ? 'out' : p.stock <= p.min_stock ? 'low' : 'normal',
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
    return { id, ...data }
  })

  // Delete product
  ipcMain.handle('db:products:delete', (_, id) => {
    run(`UPDATE products SET status = 'inactive' WHERE id = ?`, [id])
    return { id }
  })

  // Update stock directly
  ipcMain.handle('db:products:updateStock', (_, { id, delta }) => {
    run(`UPDATE products SET stock = MAX(0, stock + ?), updated_at = datetime('now') WHERE id = ?`, [delta, id])
    return queryOne('SELECT id, stock FROM products WHERE id = ?', [id])
  })
}
