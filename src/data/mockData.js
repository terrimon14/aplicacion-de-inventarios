// Mock data for UI development — replace with SQLite queries later

export const mockStats = {
  salesToday: 12450.0,
  salesMonth: 284750.0,
  profit: 94300.0,
  totalProducts: 1284,
  outOfStock: 23,
  lowStock: 47,
  totalCustomers: 389,
  recentPurchases: 18,
}

export const mockRecentActivity = [
  { id: 1, type: 'sale', description: 'Venta #0892 — Carlos Mendoza', amount: 1250.0, time: 'Hace 5 min', status: 'success' },
  { id: 2, type: 'alert', description: 'Stock bajo: Laptop HP 14"', amount: null, time: 'Hace 12 min', status: 'warning' },
  { id: 3, type: 'purchase', description: 'Compra #0231 — Proveedor TechCorp', amount: 8400.0, time: 'Hace 30 min', status: 'info' },
  { id: 4, type: 'sale', description: 'Venta #0891 — Ana García', amount: 450.0, time: 'Hace 45 min', status: 'success' },
  { id: 5, type: 'alert', description: 'Producto agotado: Mouse Logitech MX', amount: null, time: 'Hace 1h', status: 'error' },
  { id: 6, type: 'sale', description: 'Venta #0890 — Juan Pérez', amount: 2100.0, time: 'Hace 2h', status: 'success' },
]

export const mockProducts = [
  { id: 1, name: 'Laptop HP 14" Core i5', sku: 'LAP-HP-001', category: 'Laptops', brand: 'HP', price: 4500.0, stock: 8, status: 'low' },
  { id: 2, name: 'Monitor LG 24" FHD', sku: 'MON-LG-001', category: 'Monitores', brand: 'LG', price: 1800.0, stock: 15, status: 'normal' },
  { id: 3, name: 'Mouse Logitech MX Master', sku: 'MOU-LO-001', category: 'Periféricos', brand: 'Logitech', price: 320.0, stock: 0, status: 'out' },
  { id: 4, name: 'Teclado Mecánico Redragon', sku: 'TEC-RE-001', category: 'Periféricos', brand: 'Redragon', price: 280.0, stock: 24, status: 'normal' },
  { id: 5, name: 'SSD Samsung 1TB', sku: 'SSD-SA-001', category: 'Almacenamiento', brand: 'Samsung', price: 750.0, stock: 5, status: 'low' },
  { id: 6, name: 'RAM Corsair 16GB DDR4', sku: 'RAM-CO-001', category: 'Memoria', brand: 'Corsair', price: 420.0, stock: 32, status: 'normal' },
  { id: 7, name: 'Impresora Epson L3250', sku: 'IMP-EP-001', category: 'Impresoras', brand: 'Epson', price: 1200.0, stock: 0, status: 'out' },
  { id: 8, name: 'Router TP-Link AX3000', sku: 'ROU-TP-001', category: 'Redes', brand: 'TP-Link', price: 580.0, stock: 11, status: 'normal' },
]

export const mockSales = [
  { id: 'VTA-0892', customer: 'Carlos Mendoza', date: '2026-07-06', items: 3, total: 1250.0, status: 'completed' },
  { id: 'VTA-0891', customer: 'Ana García', date: '2026-07-06', items: 1, total: 450.0, status: 'completed' },
  { id: 'VTA-0890', customer: 'Juan Pérez', date: '2026-07-05', items: 5, total: 2100.0, status: 'completed' },
  { id: 'VTA-0889', customer: 'María López', date: '2026-07-05', items: 2, total: 890.0, status: 'pending' },
  { id: 'VTA-0888', customer: 'Roberto Silva', date: '2026-07-04', items: 4, total: 3200.0, status: 'completed' },
  { id: 'VTA-0887', customer: 'Lucía Torres', date: '2026-07-04', items: 1, total: 280.0, status: 'cancelled' },
]

export const mockCustomers = [
  { id: 1, name: 'Carlos Mendoza', email: 'c.mendoza@email.com', phone: '999-111-222', totalPurchases: 12, totalSpent: 18450.0, status: 'active' },
  { id: 2, name: 'Ana García', email: 'a.garcia@email.com', phone: '999-333-444', totalPurchases: 8, totalSpent: 9200.0, status: 'active' },
  { id: 3, name: 'Juan Pérez', email: 'j.perez@email.com', phone: '999-555-666', totalPurchases: 5, totalSpent: 5600.0, status: 'inactive' },
  { id: 4, name: 'María López', email: 'm.lopez@email.com', phone: '999-777-888', totalPurchases: 20, totalSpent: 32100.0, status: 'active' },
]

export const mockSalesChart = [
  { day: 'Lun', value: 8200 },
  { day: 'Mar', value: 14500 },
  { day: 'Mié', value: 11000 },
  { day: 'Jue', value: 18300 },
  { day: 'Vie', value: 22100 },
  { day: 'Sáb', value: 28400 },
  { day: 'Dom', value: 12450 },
]

export const mockCategories = [
  { id: 1, name: 'Laptops', products: 45, slug: 'laptops' },
  { id: 2, name: 'Monitores', products: 28, slug: 'monitores' },
  { id: 3, name: 'Periféricos', products: 112, slug: 'perifericos' },
  { id: 4, name: 'Almacenamiento', products: 67, slug: 'almacenamiento' },
  { id: 5, name: 'Memoria', products: 34, slug: 'memoria' },
  { id: 6, name: 'Impresoras', products: 19, slug: 'impresoras' },
  { id: 7, name: 'Redes', products: 42, slug: 'redes' },
]
