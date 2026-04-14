import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await SQLite.openDatabaseAsync("app.db");


    await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cart_shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id TEXT,
      shop_name TEXT,
      total REAL DEFAULT 0,
      selected INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_ref INTEGER,
      product_id TEXT,
      product_name TEXT,
      base_price REAL,
      size_price REAL,
      topping_price REAL,
      total_price REAL,
      quantity INTEGER,
      size_id TEXT,
      size_name TEXT,
      topping_ids TEXT,
      topping_names TEXT,
      note TEXT,
      image TEXT,
      selected INTEGER DEFAULT 0
    );
  `);
    return dbInstance;
}

// ================== GET DATA ==================
export async function getAllCartItems() {
    const db = await getDB();
    return await db.getAllAsync("SELECT * FROM cart_items");
}

export async function getAllCartShops() {
    const db = await getDB();
    return await db.getAllAsync("SELECT * FROM cart_shops");
}

// ================== CLEAR ==================
export async function clearTable(tableName: string) {
    const db = await getDB();
    await db.execAsync(`DELETE FROM ${tableName}`);
}

export async function clearAllCart() {
    const db = await getDB();
    await db.execAsync(`
    DELETE FROM cart_items;
    DELETE FROM cart_shops;
  `);
}