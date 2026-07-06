// Initial seed data for a fresh database

module.exports = [
  // Categories
  `INSERT INTO categories (name, description) VALUES ('Laptops', 'Computadoras portátiles')`,
  `INSERT INTO categories (name, description) VALUES ('Monitores', 'Pantallas y monitores')`,
  `INSERT INTO categories (name, description) VALUES ('Periféricos', 'Teclados, ratones y accesorios')`,
  `INSERT INTO categories (name, description) VALUES ('Almacenamiento', 'Discos duros y SSDs')`,
  `INSERT INTO categories (name, description) VALUES ('Memoria', 'RAM y memorias')`,
  `INSERT INTO categories (name, description) VALUES ('Impresoras', 'Impresoras y escáneres')`,
  `INSERT INTO categories (name, description) VALUES ('Redes', 'Routers, switches y cables')`,

  // Brands
  `INSERT INTO brands (name) VALUES ('HP')`,
  `INSERT INTO brands (name) VALUES ('LG')`,
  `INSERT INTO brands (name) VALUES ('Logitech')`,
  `INSERT INTO brands (name) VALUES ('Redragon')`,
  `INSERT INTO brands (name) VALUES ('Samsung')`,
  `INSERT INTO brands (name) VALUES ('Corsair')`,
  `INSERT INTO brands (name) VALUES ('Epson')`,
  `INSERT INTO brands (name) VALUES ('TP-Link')`,

  // Products
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Laptop HP 14" Core i5', 'LAP-HP-001', '7501001001001', 1, 1, 4500.00, 3200.00, 8, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Monitor LG 24" FHD', 'MON-LG-001', '7501001001002', 2, 2, 1800.00, 1200.00, 15, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Mouse Logitech MX Master', 'MOU-LO-001', '7501001001003', 3, 3, 320.00, 200.00, 0, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Teclado Mecánico Redragon', 'TEC-RE-001', '7501001001004', 3, 4, 280.00, 180.00, 24, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('SSD Samsung 1TB', 'SSD-SA-001', '7501001001005', 4, 5, 750.00, 500.00, 5, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('RAM Corsair 16GB DDR4', 'RAM-CO-001', '7501001001006', 5, 6, 420.00, 280.00, 32, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Impresora Epson L3250', 'IMP-EP-001', '7501001001007', 6, 7, 1200.00, 850.00, 0, 3)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Router TP-Link AX3000', 'ROU-TP-001', '7501001001008', 7, 8, 580.00, 380.00, 11, 5)`,

  // Default admin user (password: admin123 — hash is placeholder)
  `INSERT INTO users (name, email, role, password_hash, status) VALUES
    ('Administrador', 'admin@empresa.com', 'admin', 'placeholder_hash', 'active')`,

  // Default customer
  `INSERT INTO customers (name, document_type, status) VALUES ('Cliente General', 'DNI', 'active')`,

  // A sample supplier
  `INSERT INTO suppliers (name, contact, email, phone, status) VALUES
    ('TechCorp SAC', 'Jorge Lima', 'ventas@techcorp.com', '01-234-5678', 'active')`,

  // Open a cash session
  `INSERT INTO cash_sessions (opening_balance, status, user_id) VALUES (500.00, 'open', 1)`,
]
