import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'

// Pages
import Dashboard from '../pages/Dashboard'
import Products from '../pages/inventory/Products'
import Categories from '../pages/inventory/Categories'
import Stock from '../pages/inventory/Stock'
import LowStock from '../pages/inventory/LowStock'
import NewSale from '../pages/sales/NewSale'
import SalesHistory from '../pages/sales/SalesHistory'
import Quotes from '../pages/sales/Quotes'
import CashRegister from '../pages/cash/CashRegister'
import Customers from '../pages/customers/Customers'
import Debtors from '../pages/customers/Debtors'
import Suppliers from '../pages/suppliers/Suppliers'
import Reports from '../pages/reports/Reports'
import Users from '../pages/users/Users'
import Settings from '../pages/settings/Settings'
import Help from '../pages/help/Help'
import PurchaseOrders from '../pages/purchases/PurchaseOrders'

// Placeholder for pages not yet built
function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
      <div className="w-12 h-12 rounded-2xl bg-[#2a2a36] flex items-center justify-center">
        <span className="text-2xl">🚧</span>
      </div>
      <p className="text-sm font-medium text-[#9496b0]">{title}</p>
      <p className="text-xs text-[#5c5e78]">Esta sección está en desarrollo</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Inventory */}
        <Route path="/inventory" element={<Navigate to="/inventory/products" replace />} />
        <Route path="/inventory/products" element={<Products />} />
        <Route path="/inventory/categories" element={<Categories />} />
        <Route path="/inventory/brands" element={<Placeholder title="Marcas" />} />
        <Route path="/inventory/stock" element={<Stock />} />
        <Route path="/inventory/low-stock" element={<LowStock />} />
        <Route path="/inventory/import" element={<Placeholder title="Importar productos" />} />
        <Route path="/inventory/export" element={<Placeholder title="Exportar productos" />} />
        <Route path="/inventory/barcodes" element={<Placeholder title="Códigos de barras" />} />

        {/* Sales */}
        <Route path="/sales" element={<Navigate to="/sales/new" replace />} />
        <Route path="/sales/new" element={<NewSale />} />
        <Route path="/sales/history" element={<SalesHistory />} />
        <Route path="/sales/quotes" element={<Quotes />} />

        {/* Purchases */}
        <Route path="/purchases" element={<Navigate to="/purchases/new" replace />} />
        <Route path="/purchases/new" element={<Placeholder title="Nueva Compra" />} />
        <Route path="/purchases/history" element={<Placeholder title="Historial de Compras" />} />
        <Route path="/purchases/orders" element={<PurchaseOrders />} />

        {/* Cash */}
        <Route path="/cash" element={<CashRegister />} />
        <Route path="/cash/sessions" element={<Placeholder title="Sesiones de Caja" />} />
        <Route path="/cash/movements" element={<Placeholder title="Movimientos de Caja" />} />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<Placeholder title="Nuevo Cliente" />} />
        <Route path="/customers/debtors" element={<Debtors />} />

        {/* Suppliers */}
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/new" element={<Placeholder title="Nuevo Proveedor" />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/sales" element={<Reports />} />
        <Route path="/reports/purchases" element={<Placeholder title="Reporte de Compras" />} />
        <Route path="/reports/profits" element={<Placeholder title="Reporte de Ganancias" />} />
        <Route path="/reports/top-products" element={<Placeholder title="Productos más vendidos" />} />
        <Route path="/reports/inventory" element={<Placeholder title="Reporte de Inventario" />} />

        {/* Users */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/roles" element={<Placeholder title="Roles" />} />
        <Route path="/users/permissions" element={<Placeholder title="Permisos" />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/company" element={<Settings />} />
        <Route path="/settings/printers" element={<Placeholder title="Configuración de Impresoras" />} />
        <Route path="/settings/appearance" element={<Settings />} />

        {/* Help */}
        <Route path="/help" element={<Help />} />
        <Route path="/help/shortcuts" element={<Help />} />
        <Route path="/help/about" element={<Help />} />

        {/* Profile */}
        <Route path="/profile" element={<Placeholder title="Mi Perfil" />} />
        <Route path="/profile/security" element={<Placeholder title="Seguridad" />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
