const { ipcMain } = require('electron')
const { queryOne, queryAll } = require('../database/index')

function buildDateFilter(column, filters = {}, params = []) {
  let clause = ''
  if (filters?.from) {
    clause += ` AND date(${column}) >= date(?)`
    params.push(filters.from)
  }
  if (filters?.to) {
    clause += ` AND date(${column}) <= date(?)`
    params.push(filters.to)
  }
  return clause
}

function historicalCostExpression() {
  return `
    COALESCE(
      (
        SELECT pi.cost
        FROM purchase_items pi
        JOIN purchases pu ON pu.id = pi.purchase_id
        WHERE pi.product_id = si.product_id
          AND pu.status = 'completed'
          AND datetime(pu.created_at) <= datetime(s.created_at)
        ORDER BY datetime(pu.created_at) DESC, pi.id DESC
        LIMIT 1
      ),
      p.cost,
      0
    )
  `
}

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
    const filters = { from, to }
    let sql = `
      SELECT
        date(s.created_at) as date,
        COUNT(DISTINCT s.id) as count,
        COALESCE(SUM(s.total), 0) as total,
        COALESCE(SUM(si.quantity), 0) as units
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      WHERE s.status='completed'
    `
    const params = []
    sql += buildDateFilter('s.created_at', filters, params)
    sql += ' GROUP BY date(s.created_at) ORDER BY date ASC'
    return queryAll(sql, params)
  })

  ipcMain.handle('db:reports:purchases', (_, { from, to } = {}) => {
    const filters = { from, to }
    let sql = `
      SELECT
        date(p.created_at) as date,
        COUNT(DISTINCT p.id) as count,
        COALESCE(SUM(p.total), 0) as total,
        COALESCE(SUM(pi.quantity), 0) as units
      FROM purchases p
      LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
      WHERE p.status='completed'
    `
    const params = []
    sql += buildDateFilter('p.created_at', filters, params)
    sql += ' GROUP BY date(p.created_at) ORDER BY date ASC'
    return queryAll(sql, params)
  })

  ipcMain.handle('db:reports:profits', (_, { from, to } = {}) => {
    const filters = { from, to }
    const params = []
    const historicalCost = historicalCostExpression()

    let grossSql = `
      SELECT
        COALESCE(SUM(si.quantity * si.price), 0) as gross_revenue,
        COALESCE(SUM(si.quantity * (${historicalCost})), 0) as historical_cost,
        COALESCE(SUM((si.price - (${historicalCost})) * si.quantity), 0) as gross_profit
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE s.status = 'completed'
    `
    grossSql += buildDateFilter('s.created_at', filters, params)
    const gross = queryOne(grossSql, params) || {}

    const expenseParams = []
    let expenseSql = `
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM cash_movements
      WHERE type = 'out'
    `
    expenseSql += buildDateFilter('created_at', filters, expenseParams)
    const expenses = Number(queryOne(expenseSql, expenseParams)?.total_expenses || 0)

    const grossProfit = Number(gross.gross_profit || 0)
    return {
      grossRevenue: Number(gross.gross_revenue || 0),
      historicalCost: Number(gross.historical_cost || 0),
      grossProfit,
      expenses,
      netProfit: grossProfit - expenses,
      formula: 'Ganancia Neta = Sum((Precio Venta Item - Costo Historico Item) * Cantidad) - Gastos',
    }
  })

  ipcMain.handle('db:reports:topProducts', (_, { from, to, limit = 10 } = {}) => {
    const filters = { from, to }
    const params = []
    const historicalCost = historicalCostExpression()

    let sql = `
      SELECT
        p.id,
        p.name,
        p.sku,
        COALESCE(SUM(si.quantity), 0) as sold,
        COALESCE(SUM(si.quantity * si.price), 0) as revenue,
        COALESCE(SUM((si.price - (${historicalCost})) * si.quantity), 0) as gross_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id AND s.status = 'completed'
      LEFT JOIN products p ON si.product_id = p.id
      WHERE 1=1
    `
    sql += buildDateFilter('s.created_at', filters, params)
    sql += `
      GROUP BY p.id
      ORDER BY sold DESC, revenue DESC
      LIMIT ?
    `
    params.push(Number(limit || 10))
    return queryAll(sql, params)
  })

  ipcMain.handle('db:reports:inventory', (_, { scope = 'all' } = {}) => {
    const normalizedScope = String(scope || 'all')
    const locationId = normalizedScope === 'store' ? 2 : normalizedScope === 'warehouse' ? 1 : null

    const params = []
    let whereLocation = ''
    if (locationId) {
      whereLocation = ' AND iu.ubicacion_id = ?'
      params.push(locationId)
    }

    const rows = queryAll(
      `
      SELECT
        p.id,
        p.name,
        p.sku,
        COALESCE(SUM(iu.cantidad), 0) as quantity,
        p.cost,
        p.price,
        (COALESCE(SUM(iu.cantidad), 0) * p.cost) as total_cost,
        (COALESCE(SUM(iu.cantidad), 0) * p.price) as total_return,
        ((p.price - p.cost) * COALESCE(SUM(iu.cantidad), 0)) as projected_margin
      FROM products p
      LEFT JOIN inventario_ubicacion iu ON iu.producto_id = p.id
      WHERE p.status = 'active'${whereLocation}
      GROUP BY p.id
      ORDER BY total_cost DESC
      `,
      params,
    )

    const summary = rows.reduce((acc, row) => {
      acc.totalCost += Number(row.total_cost || 0)
      acc.totalReturn += Number(row.total_return || 0)
      acc.projectedMargin += Number(row.projected_margin || 0)
      return acc
    }, { totalCost: 0, totalReturn: 0, projectedMargin: 0 })

    return { scope: normalizedScope, summary, rows }
  })

  ipcMain.handle('db:reports:summary', (_, { from, to, inventoryScope = 'all' } = {}) => {
    const filters = { from, to }
    const salesParams = []
    const purchaseParams = []
    const expenseParams = []

    let salesSql = `SELECT COALESCE(SUM(total), 0) as value FROM sales WHERE status='completed'`
    salesSql += buildDateFilter('created_at', filters, salesParams)

    let purchasesSql = `SELECT COALESCE(SUM(total), 0) as value FROM purchases WHERE status='completed'`
    purchasesSql += buildDateFilter('created_at', filters, purchaseParams)

    let expensesSql = `SELECT COALESCE(SUM(amount), 0) as value FROM cash_movements WHERE type='out'`
    expensesSql += buildDateFilter('created_at', filters, expenseParams)

    const totalSales = Number(queryOne(salesSql, salesParams)?.value || 0)
    const totalPurchases = Number(queryOne(purchasesSql, purchaseParams)?.value || 0)
    const totalExpenses = Number(queryOne(expensesSql, expenseParams)?.value || 0)

    const profitParams = []
    let grossProfitSql = `
      SELECT
        COALESCE(SUM((si.price - (${historicalCostExpression()})) * si.quantity), 0) as gross_profit
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE s.status = 'completed'
    `
    grossProfitSql += buildDateFilter('s.created_at', filters, profitParams)
    const grossProfit = Number(queryOne(grossProfitSql, profitParams)?.gross_profit || 0)

    const inventory = queryOne(
      `
      SELECT COALESCE(SUM(iu.cantidad * p.cost), 0) as value
      FROM inventario_ubicacion iu
      JOIN products p ON p.id = iu.producto_id
      WHERE p.status = 'active'
        AND (
          ? = 'all'
          OR (? = 'warehouse' AND iu.ubicacion_id = 1)
          OR (? = 'store' AND iu.ubicacion_id = 2)
        )
      `,
      [inventoryScope, inventoryScope, inventoryScope],
    )

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit: grossProfit - totalExpenses,
      inventoryValue: Number(inventory?.value || 0),
    }
  })
}
