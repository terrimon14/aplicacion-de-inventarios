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
  { id: 2, type: 'alert', description: 'Stock bajo: Samsung Smart TV 43"', amount: null, time: 'Hace 12 min', status: 'warning' },
  { id: 3, type: 'purchase', description: 'Compra #0231 — Proveedor TechCorp', amount: 8400.0, time: 'Hace 30 min', status: 'info' },
  { id: 4, type: 'sale', description: 'Venta #0891 — Ana García', amount: 450.0, time: 'Hace 45 min', status: 'success' },
  { id: 5, type: 'alert', description: 'Producto agotado: Sony Google TV 65"', amount: null, time: 'Hace 1h', status: 'error' },
  { id: 6, type: 'sale', description: 'Venta #0890 — Juan Pérez', amount: 2100.0, time: 'Hace 2h', status: 'success' },
]

export const mockProducts = [
  { id: 1, name: 'Samsung Smart TV 43" Crystal', sku: 'TV-SA-043', category: 'TV Smart LED', brand: 'Samsung', price: 1899.0, stock: 8, status: 'low' },
  { id: 2, name: 'LG Smart TV 55" 4K UHD', sku: 'TV-LG-055', category: 'TV 4K UHD', brand: 'LG', price: 2799.0, stock: 15, status: 'normal' },
  { id: 3, name: 'Sony Google TV 65" 4K', sku: 'TV-SO-065', category: 'TV QLED / OLED', brand: 'Sony', price: 4599.0, stock: 0, status: 'out' },
  { id: 4, name: 'TCL Smart TV 32" HD', sku: 'TV-TC-032', category: 'TV 32 a 43 pulgadas', brand: 'TCL', price: 999.0, stock: 24, status: 'normal' },
  { id: 5, name: 'Hisense Smart TV 50" 4K', sku: 'TV-HI-050', category: 'TV 50 a 65 pulgadas', brand: 'Hisense', price: 2399.0, stock: 5, status: 'low' },
  { id: 6, name: 'Soporte de Pared TV 32-65"', sku: 'ACC-SP-065', category: 'Soportes y Montaje TV', brand: 'AOC', price: 159.0, stock: 32, status: 'normal' },
  { id: 7, name: 'Cable HDMI 2.1 2 metros', sku: 'ACC-HDMI-2M', category: 'Cables y Accesorios TV', brand: 'Xiaomi', price: 49.0, stock: 0, status: 'out' },
  { id: 8, name: 'Barra de Sonido JBL 2.1', sku: 'ACC-JBL-21', category: 'Cables y Accesorios TV', brand: 'JBL', price: 899.0, stock: 11, status: 'normal' },
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
  { id: 1, name: 'TV Smart LED', products: 45, slug: 'tv-smart-led' },
  { id: 2, name: 'TV 4K UHD', products: 28, slug: 'tv-4k-uhd' },
  { id: 3, name: 'TV QLED / OLED', products: 16, slug: 'tv-qled-oled' },
  { id: 4, name: 'TV 32 a 43 pulgadas', products: 38, slug: 'tv-32-43' },
  { id: 5, name: 'TV 50 a 65 pulgadas', products: 27, slug: 'tv-50-65' },
  { id: 6, name: 'Soportes y Montaje TV', products: 19, slug: 'soportes-tv' },
  { id: 7, name: 'Cables y Accesorios TV', products: 42, slug: 'accesorios-tv' },
]
