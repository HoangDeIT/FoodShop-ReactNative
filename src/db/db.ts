import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function initDb() {
    if (dbInstance) return dbInstance;
    const sqlite = await SQLite.openDatabaseAsync('app.db');
    dbInstance = drizzle(sqlite);

    await sqlite.execAsync(`
  CREATE TABLE IF NOT EXISTS cart_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    total REAL DEFAULT 0,
    selected INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_ref INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    base_price REAL NOT NULL,
    size_price REAL DEFAULT 0,
    topping_price REAL DEFAULT 0,
    total_price REAL NOT NULL,
    size_id TEXT,
    size_name TEXT DEFAULT '',
    topping_ids TEXT DEFAULT '',
    topping_names TEXT DEFAULT '',
    quantity INTEGER NOT NULL,
    note TEXT DEFAULT '',
    image TEXT,
    selected INTEGER DEFAULT 0,
    FOREIGN KEY(shop_ref) REFERENCES cart_shops(id) ON DELETE CASCADE
  );
`);

    console.log('✅ SQLite schema ready');
    return dbInstance;
}
