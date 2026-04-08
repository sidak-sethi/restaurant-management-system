CREATE TABLE IF NOT EXISTS menu_item (
    item_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tables (
    table_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'OCCUPIED')) DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    total_amount REAL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('PLACED', 'PREPARING', 'SERVED', 'PAID')),
    placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(table_id)
);

CREATE TABLE IF NOT EXISTS order_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    item_id TEXT,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER UNIQUE NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT,
    item_name TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
);
