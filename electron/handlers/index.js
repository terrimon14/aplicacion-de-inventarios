const { ipcMain } = require('electron')
const { getDatabase } = require('../database/index')
const registerProductHandlers = require('./products')
const registerCategoryHandlers = require('./categories')
const registerBrandHandlers = require('./brands')
const registerSaleHandlers = require('./sales')
const registerPurchaseHandlers = require('./purchases')
const registerCustomerHandlers = require('./customers')
const registerSupplierHandlers = require('./suppliers')
const registerCashHandlers = require('./cash')
const registerUserHandlers = require('./users')
const registerDashboardHandlers = require('./dashboard')
const registerPurchaseOrderHandlers = require('./purchaseOrders')
const registerPrintingHandlers = require('./printing')
const registerTransferHandlers = require('./transfers')

async function registerAllHandlers() {
  // Initialize DB first
  await getDatabase()

  registerProductHandlers()
  registerCategoryHandlers()
  registerBrandHandlers()
  registerSaleHandlers()
  registerPurchaseHandlers()
  registerCustomerHandlers()
  registerSupplierHandlers()
  registerCashHandlers()
  registerUserHandlers()
  registerDashboardHandlers()
  registerPurchaseOrderHandlers()
  registerPrintingHandlers()
  registerTransferHandlers()
}

module.exports = { registerAllHandlers }
