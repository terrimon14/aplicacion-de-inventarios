// Database schema — all CREATE TABLE IF NOT EXISTS statements

module.exports = [
  // Categories
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Brands
  `CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Products
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    category_id INTEGER REFERENCES categories(id),
    brand_id INTEGER REFERENCES brands(id),
    price REAL NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    unit TEXT DEFAULT 'unidad',
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,

  // Fixed locations
  `CREATE TABLE IF NOT EXISTS ubicaciones (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL DEFAULT 'fixed'
  )`,

  // Stock split by location
  `CREATE TABLE IF NOT EXISTS inventario_ubicacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ubicacion_id INTEGER NOT NULL REFERENCES ubicaciones(id),
    cantidad INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(producto_id, ubicacion_id)
  )`,

  // Customers
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    document_type TEXT DEFAULT 'DNI' CHECK(document_type IN ('DNI','RUC','CE','OTRO')),
    document_number TEXT,
    email TEXT,
    phone TEXT,
    address TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Suppliers
  `CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT DEFAULT '',
    ruc TEXT,
    email TEXT,
    phone TEXT,
    address TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Users
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'vendedor' CHECK(role IN ('admin','vendedor','almacenero')),
    password_hash TEXT NOT NULL DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Cash sessions
  `CREATE TABLE IF NOT EXISTS cash_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opening_balance REAL NOT NULL DEFAULT 0,
    closing_balance REAL,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
    opened_at TEXT DEFAULT (datetime('now')),
    closed_at TEXT,
    user_id INTEGER REFERENCES users(id)
  )`,

  // Cash movements
  `CREATE TABLE IF NOT EXISTS cash_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES cash_sessions(id),
    type TEXT NOT NULL CHECK(type IN ('in','out')),
    amount REAL NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Sales
  `CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    customer_name TEXT DEFAULT 'Cliente general',
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash','card','transfer','credit','other')),
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed','pending','cancelled')),
    cash_session_id INTEGER REFERENCES cash_sessions(id),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Installment schedule for credit sales
  `CREATE TABLE IF NOT EXISTS sale_installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id),
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','partial','paid','overdue')),
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Sale items
  `CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    subtotal REAL NOT NULL
  )`,

  // Purchases
  `CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE,
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_name TEXT DEFAULT '',
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed','pending','cancelled')),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Purchase items
  `CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    cost REAL NOT NULL,
    subtotal REAL NOT NULL
  )`,

  // Purchase orders for restocking workflow
  `CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending_receipt' CHECK(status IN ('pending_receipt','received','cancelled')),
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT NOT NULL,
    brand_name TEXT DEFAULT '',
    supplier_suggested TEXT DEFAULT '',
    stock_actual INTEGER NOT NULL DEFAULT 0,
    qty_requested INTEGER NOT NULL DEFAULT 1
  )`,

  // Seed fixed locations if they do not exist
  `INSERT OR IGNORE INTO ubicaciones (id, nombre, tipo) VALUES (1, 'Almacen Central', 'fixed')`,
  `INSERT OR IGNORE INTO ubicaciones (id, nombre, tipo) VALUES (2, 'Tienda', 'fixed')`,

  // Backfill inventory split per product for old databases
  `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
   SELECT p.id, 1, CAST(p.stock * 0.7 AS INTEGER)
   FROM products p`,
  `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
   SELECT p.id, 2, (p.stock - CAST(p.stock * 0.7 AS INTEGER))
   FROM products p`,
]
