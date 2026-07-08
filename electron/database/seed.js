// Initial seed data for a fresh database

module.exports = [
  // Fixed locations
  `INSERT OR IGNORE INTO ubicaciones (id, nombre, tipo) VALUES (1, 'Almacen Central', 'fixed')`,
  `INSERT OR IGNORE INTO ubicaciones (id, nombre, tipo) VALUES (2, 'Tienda', 'fixed')`,

  // Categories
  `INSERT INTO categories (name, description) VALUES ('TV Smart LED', 'Televisores Smart LED de entrada y gama media')`,
  `INSERT INTO categories (name, description) VALUES ('TV 4K UHD', 'Televisores 4K UHD para hogar y negocio')`,
  `INSERT INTO categories (name, description) VALUES ('TV QLED / OLED', 'Modelos premium con mejor contraste y color')`,
  `INSERT INTO categories (name, description) VALUES ('TV 32 a 43 pulgadas', 'Formato compacto para dormitorios y oficinas')`,
  `INSERT INTO categories (name, description) VALUES ('TV 50 a 65 pulgadas', 'Formato familiar para sala principal')`,
  `INSERT INTO categories (name, description) VALUES ('Soportes y Montaje TV', 'Bases de pared y accesorios de instalacion')`,
  `INSERT INTO categories (name, description) VALUES ('Cables y Accesorios TV', 'HDMI, extensiones y control remoto')`,

  // Brands
  `INSERT INTO brands (name) VALUES ('Samsung')`,
  `INSERT INTO brands (name) VALUES ('LG')`,
  `INSERT INTO brands (name) VALUES ('Sony')`,
  `INSERT INTO brands (name) VALUES ('TCL')`,
  `INSERT INTO brands (name) VALUES ('Hisense')`,
  `INSERT INTO brands (name) VALUES ('AOC')`,
  `INSERT INTO brands (name) VALUES ('Xiaomi')`,
  `INSERT INTO brands (name) VALUES ('JBL')`,

  // Products
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Samsung Smart TV 43" Crystal', 'TV-SA-043', '7502001001001', 1, 1, 1899.00, 1420.00, 8, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('LG Smart TV 55" 4K UHD', 'TV-LG-055', '7502001001002', 2, 2, 2799.00, 2140.00, 15, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Sony Google TV 65" 4K', 'TV-SO-065', '7502001001003', 3, 3, 4599.00, 3650.00, 0, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('TCL Smart TV 32" HD', 'TV-TC-032', '7502001001004', 4, 4, 999.00, 720.00, 24, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Hisense Smart TV 50" 4K', 'TV-HI-050', '7502001001005', 5, 5, 2399.00, 1810.00, 5, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Soporte de Pared TV 32-65"', 'ACC-SP-065', '7502001001006', 6, 6, 159.00, 95.00, 32, 5)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Cable HDMI 2.1 2 metros', 'ACC-HDMI-2M', '7502001001007', 7, 7, 49.00, 22.00, 0, 10)`,
  `INSERT INTO products (name, sku, barcode, category_id, brand_id, price, cost, stock, min_stock) VALUES
    ('Barra de Sonido JBL 2.1', 'ACC-JBL-21', '7502001001008', 7, 8, 899.00, 620.00, 11, 4)`,

  // Inventory by location (1: Almacen Central, 2: Tienda)
  `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
   SELECT id, 1, CAST(stock * 0.7 AS INTEGER) FROM products`,
  `INSERT OR IGNORE INTO inventario_ubicacion (producto_id, ubicacion_id, cantidad)
   SELECT id, 2, (stock - CAST(stock * 0.7 AS INTEGER)) FROM products`,

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
