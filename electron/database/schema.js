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
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash','card','transfer','other')),
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed','pending','cancelled')),
    cash_session_id INTEGER REFERENCES cash_sessions(id),
    notes TEXT DEFAULT '',
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
]
