const { contextBridge, ipcRenderer } = require('electron')

// Whitelist of valid IPC channels — prevents arbitrary channel injection
const VALID_CHANNELS = [
  // Window controls
  'window:minimize', 'window:maximize', 'window:close', 'window:isMaximized',

  // Dashboard
  'db:dashboard:stats', 'db:dashboard:recentActivity',

  // Products
  'db:products:list', 'db:products:get', 'db:products:create',
  'db:products:update', 'db:products:delete', 'db:products:updateStock', 'db:products:lowStock',

  // Categories
  'db:categories:list', 'db:categories:create',
  'db:categories:update', 'db:categories:delete',

  // Brands
  'db:brands:list', 'db:brands:create',
  'db:brands:update', 'db:brands:delete',

  // Sales
  'db:sales:list', 'db:sales:get', 'db:sales:create', 'db:sales:void',

  // Purchases
  'db:purchases:list', 'db:purchases:get', 'db:purchases:create',

  // Customers
  'db:customers:list', 'db:customers:get', 'db:customers:create',
  'db:customers:update', 'db:customers:delete', 'db:customers:debtors',
  'db:customers:installments', 'db:customers:registerPayment',
  'db:customers:paymentHistory',

  // Suppliers
  'db:suppliers:list', 'db:suppliers:get', 'db:suppliers:create',
  'db:suppliers:update', 'db:suppliers:delete',

  // Cash
  'db:cash:currentSession', 'db:cash:openSession', 'db:cash:closeSession',
  'db:cash:movements', 'db:cash:addMovement',
  'db:cash:summary', 'db:cash:activeRequired',

  // Users
  'db:users:list', 'db:users:create', 'db:users:update', 'db:users:delete',

  // Reports
  'db:reports:sales', 'db:reports:purchases', 'db:reports:profits',
  'db:reports:topProducts', 'db:reports:inventory', 'db:reports:summary',

  // Purchase orders
  'db:purchaseOrders:list', 'db:purchaseOrders:suggest', 'db:purchaseOrders:create',
  'db:purchaseOrders:get', 'db:purchaseOrders:receive',

  // Internal transfers
  'db:transfers:list', 'db:transfers:create',

  // Printing
  'app:inventory:exportPdf', 'app:reports:exportPdf',
]

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => {
    if (!VALID_CHANNELS.includes(channel)) {
      return Promise.reject(new Error(`Blocked IPC channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
  isElectron: true,
})
