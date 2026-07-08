const { ipcMain } = require('electron')
const { queryOne, queryAll } = require('../database/index')

module.exports = function registerDashboardHandlers() {
  ipcMain.handle('db:dashboard:stats', () => {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 7) + '-01'

    const salesToday = queryOne(
      `SELECT COALESCE(SUM(total), 0) as value FROM sales WHERE date(created_at) = ? AND status='completed'`,
      [today]
    )?.value ?? 0

    const salesMonth = queryOne(
      `SELECT COALESCE(SUM(total), 0) as value FROM sales WHERE date(created_at) >= ? AND status='completed'`,
      [monthStart]
    )?.value ?? 0

    const profit = queryOne(
      `SELECT COALESCE(SUM(si.subtotal - (p.cost * si.quantity)), 0) as value
       FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN products p ON si.product_id = p.id
       WHERE date(s.created_at) >= ? AND s.status='completed'`,
      [monthStart]
    )?.value ?? 0

    const totalProducts = queryOne(
      `SELECT COUNT(*) as value FROM products WHERE status='active'`
    )?.value ?? 0

    const outOfStock = queryOne(
      `SELECT COUNT(*) as value FROM products WHERE stock = 0 AND status='active'`
    )?.value ?? 0

    const lowStock = queryOne(
      `SELECT COUNT(*) as value FROM products WHERE stock > 0 AND stock <= min_stock AND status='active'`
    )?.value ?? 0

    const totalCustomers = queryOne(
      `SELECT COUNT(*) as value FROM customers WHERE status='active'`
    )?.value ?? 0

    const recentPurchases = queryOne(
      `SELECT COUNT(*) as value FROM purchases WHERE date(created_at) >= ?`,
      [monthStart]
    )?.value ?? 0

    const dueTodayDebtors = queryAll(
      `SELECT c.name, si.due_date, (si.amount - si.paid_amount) as saldo
       FROM sale_installments si
       JOIN customers c ON c.id = si.customer_id
       WHERE date(si.due_date) = date('now')
         AND si.status IN ('pending', 'partial', 'overdue')
       ORDER BY c.name ASC`
    )

    // Sales chart — last 7 days
    const salesChart = []
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const row = queryOne(
        `SELECT COALESCE(SUM(total), 0) as value FROM sales WHERE date(created_at) = ? AND status='completed'`,
        [ds]
      )
      salesChart.push({ day: days[d.getDay()], value: row?.value ?? 0, date: ds })
    }

    return {
      salesToday,
      salesMonth,
      profit,
      totalProducts,
      outOfStock,
      lowStock,
      totalCustomers,
      recentPurchases,
      salesChart,
      dueTodayDebtors,
    }
  })

  ipcMain.handle('db:dashboard:recentActivity', () => {
    const sales = queryAll(`
      SELECT 'sale' as type, reference as title, customer_name as subtitle,
             total as amount, created_at, 'success' as status
      FROM sales ORDER BY created_at DESC LIMIT 5
    `)
    const lowStock = queryAll(`
      SELECT 'alert' as type, ('Stock bajo: ' || name) as title, sku as subtitle,
             NULL as amount, updated_at as created_at, 'warning' as status
      FROM products WHERE stock <= min_stock AND stock > 0 AND status='active' LIMIT 3
    `)
    const outOfStock = queryAll(`
      SELECT 'alert' as type, ('Agotado: ' || name) as title, sku as subtitle,
             NULL as amount, updated_at as created_at, 'error' as status
      FROM products WHERE stock = 0 AND status='active' LIMIT 3
    `)

    const all = [...sales, ...lowStock, ...outOfStock]
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return all.slice(0, 8)
  })

  // Reports
  ipcMain.handle('db:reports:sales', (_, { from, to } = {}) => {
    let sql = `SELECT date(created_at) as date, COUNT(*) as count, SUM(total) as total
               FROM sales WHERE status='completed'`
    const params = []
    if (from) { sql += ' AND date(created_at) >= ?'; params.push(from) }
    if (to)   { sql += ' AND date(created_at) <= ?'; params.push(to) }
    sql += ' GROUP BY date(created_at) ORDER BY date ASC'
    return queryAll(sql, params)
  })

  ipcMain.handle('db:reports:topProducts', () => {
    return queryAll(`
      SELECT p.name, p.sku,
             SUM(si.quantity) as sold,
             SUM(si.subtotal) as revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id AND s.status = 'completed'
      JOIN products p ON si.product_id = p.id
      GROUP BY p.id
      ORDER BY revenue DESC LIMIT 10
    `)
  })

  ipcMain.handle('db:reports:inventory', () => {
    return queryAll(`
      SELECT p.*, c.name as category_name, b.name as brand_name,
             (p.stock * p.cost) as stock_value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.status = 'active'
      ORDER BY stock_value DESC
    `)
  })
}
