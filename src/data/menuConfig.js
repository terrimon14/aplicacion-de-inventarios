import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  Users,
  Truck,
  BarChart2,
  UserCog,
  Settings,
  HelpCircle,
  UserCircle,
} from 'lucide-react'

export const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'inventory', label: 'Inventario', icon: Package, path: '/inventory' },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart, path: '/sales' },
  { id: 'purchases', label: 'Compras', icon: ShoppingBag, path: '/purchases' },
  { id: 'cash', label: 'Caja', icon: Wallet, path: '/cash' },
  { id: 'customers', label: 'Clientes', icon: Users, path: '/customers' },
  { id: 'suppliers', label: 'Proveedores', icon: Truck, path: '/suppliers' },
  { id: 'reports', label: 'Reportes', icon: BarChart2, path: '/reports' },
  { id: 'users', label: 'Usuarios', icon: UserCog, path: '/users' },
]

export const bottomNavItems = [
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Ayuda', icon: HelpCircle, path: '/help' },
  { id: 'profile', label: 'Perfil', icon: UserCircle, path: '/profile' },
]

export const secondaryMenus = {
  dashboard: [],
  inventory: [
    { label: 'Productos', path: '/inventory/products' },
    { label: 'Categorías', path: '/inventory/categories' },
    { label: 'Marcas', path: '/inventory/brands' },
    { label: 'Stock', path: '/inventory/stock' },
    { label: 'Stock Bajo', path: '/inventory/low-stock', badge: 'alerta' },
    { label: 'Importar', path: '/inventory/import' },
    { label: 'Exportar', path: '/inventory/export' },
    { label: 'Códigos de Barras', path: '/inventory/barcodes' },
  ],
  sales: [
    { label: 'Nueva Venta', path: '/sales/new' },
    { label: 'Historial', path: '/sales/history' },
    { label: 'Cotizaciones', path: '/sales/quotes' },
    { label: 'Facturas', path: '/sales/invoices' },
  ],
  purchases: [
    { label: 'Nueva Compra', path: '/purchases/new' },
    { label: 'Historial', path: '/purchases/history' },
    { label: 'Órdenes de Compra', path: '/purchases/orders' },
  ],
  cash: [
    { label: 'Caja Actual', path: '/cash' },
    { label: 'Apertura / Cierre', path: '/cash/sessions' },
    { label: 'Movimientos', path: '/cash/movements' },
  ],
  customers: [
    { label: 'Lista de Clientes', path: '/customers' },
    { label: 'Nuevo Cliente', path: '/customers/new' },
    { label: 'Grupos', path: '/customers/groups' },
  ],
  suppliers: [
    { label: 'Lista de Proveedores', path: '/suppliers' },
    { label: 'Nuevo Proveedor', path: '/suppliers/new' },
  ],
  reports: [
    { label: 'Ventas', path: '/reports/sales' },
    { label: 'Compras', path: '/reports/purchases' },
    { label: 'Ganancias', path: '/reports/profits' },
    { label: 'Más Vendidos', path: '/reports/top-products' },
    { label: 'Inventario', path: '/reports/inventory' },
  ],
  users: [
    { label: 'Usuarios', path: '/users' },
    { label: 'Roles', path: '/users/roles' },
    { label: 'Permisos', path: '/users/permissions' },
  ],
  settings: [
    { label: 'General', path: '/settings' },
    { label: 'Empresa', path: '/settings/company' },
    { label: 'Impresoras', path: '/settings/printers' },
    { label: 'Apariencia', path: '/settings/appearance' },
  ],
  help: [
    { label: 'Documentación', path: '/help' },
    { label: 'Atajos de Teclado', path: '/help/shortcuts' },
    { label: 'Acerca de', path: '/help/about' },
  ],
  profile: [
    { label: 'Mi Perfil', path: '/profile' },
    { label: 'Seguridad', path: '/profile/security' },
  ],
}
