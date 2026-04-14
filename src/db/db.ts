import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: SQLite.SQLiteDatabase | null = null; // 🔥 FIX

// export async function initDb() {
//   if (dbInstance && sqliteInstance) return dbInstance;

//   sqliteInstance = await SQLite.openDatabaseAsync('app.db'); // 🔥 giữ reference
//   dbInstance = drizzle(sqliteInstance);

//   await sqliteInstance.execAsync(`
//     CREATE TABLE IF NOT EXISTS cart_shops (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       shop_id TEXT NOT NULL,
//       shop_name TEXT NOT NULL,
//       total REAL DEFAULT 0,
//       selected INTEGER DEFAULT 0
//     );

//     CREATE TABLE IF NOT EXISTS cart_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       shop_ref INTEGER NOT NULL,
//       product_id TEXT NOT NULL,
//       product_name TEXT NOT NULL,
//       base_price REAL NOT NULL,
//       size_price REAL DEFAULT 0,
//       topping_price REAL DEFAULT 0,
//       total_price REAL NOT NULL,
//       size_id TEXT,
//       size_name TEXT DEFAULT '',
//       topping_ids TEXT DEFAULT '',
//       topping_names TEXT DEFAULT '',
//       quantity INTEGER NOT NULL,
//       note TEXT DEFAULT '',
//       image TEXT,
//       selected INTEGER DEFAULT 0,
//       FOREIGN KEY(shop_ref) REFERENCES cart_shops(id) ON DELETE CASCADE
//     );
//   `);

//   console.log('✅ SQLite schema ready');
//   return dbInstance;
// }
let dbPromise: Promise<ReturnType<typeof drizzle>> | null = null;

export function initDb() {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    sqliteInstance = await SQLite.openDatabaseAsync('app.db');

    await sqliteInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    dbInstance = drizzle(sqliteInstance);

    await sqliteInstance.execAsync(`
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

    console.log('✅ SQLite ready');
    return dbInstance;
  })();

  return dbPromise;
}