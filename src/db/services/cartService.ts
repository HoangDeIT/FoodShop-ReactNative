import * as SQLite from "expo-sqlite";

// ================== INIT DB ==================
let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDB() {
    // console.log("🔍 Getting DB instance...", dbInstance);
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

// ================== HELPERS ==================
const toJSON = (arr?: string[]) => JSON.stringify(arr || []);
const fromJSON = (str?: string | null) => {
    if (!str) return [];
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// ✅ parse giống drizzle
const parseItem = (item: any) => ({
    id: item.id,
    shopRef: item.shop_ref,
    productId: item.product_id,
    productName: item.product_name,
    basePrice: Number(item.base_price || 0),
    sizePrice: Number(item.size_price || 0),
    toppingPrice: Number(item.topping_price || 0),
    totalPrice: Number(item.total_price || 0),
    quantity: Number(item.quantity || 0),
    sizeId: item.size_id === "" ? null : item.size_id,
    sizeName: item.size_name || "",
    toppingIds: fromJSON(item.topping_ids),
    toppingNames: fromJSON(item.topping_names),
    note: item.note || "",
    image: item.image || null,
    selected: !!item.selected,
});

// ================== GET CART ==================
export async function getCartGrouped() {
    const db = await getDB();
    const shops = await db.getAllAsync<any>(`SELECT * FROM cart_shops`);

    const grouped: Record<string, any> = {};

    for (const shop of shops) {
        const items = await db.getAllAsync<any>(
            `SELECT * FROM cart_items WHERE shop_ref=?`,
            [shop.id]
        );

        grouped[shop.shop_id] = {
            shopName: shop.shop_name,
            total: Number(shop.total || 0),
            selected: !!shop.selected,
            items: items.map(parseItem),
        };
    }

    return grouped;
}

// ================== ADD ==================
export async function addToCart(item: any) {
    const db = await getDB();

    let shop = await db.getFirstAsync<any>(
        `SELECT * FROM cart_shops WHERE shop_id=?`,
        [item.shopId]
    );

    if (!shop) {
        const res = await db.runAsync(
            `INSERT INTO cart_shops (shop_id, shop_name, total, selected)
             VALUES (?, ?, 0, 0)`,
            [item.shopId, item.shopName]
        );

        shop = {
            id: res.lastInsertRowId,
            shop_id: item.shopId,
            shop_name: item.shopName,
            total: 0,
            selected: 0,
        };
    }

    const sizeId = item.sizeId ?? "";
    const toppingKey = toJSON(item.toppingIds);

    const existing = await db.getFirstAsync<any>(
        `SELECT * FROM cart_items
         WHERE shop_ref=? AND product_id=? AND size_id=? AND topping_ids=?`,
        [shop.id, item.productId, sizeId, toppingKey]
    );

    const unitPrice =
        (item.basePrice || 0) +
        (item.sizePrice || 0) +
        (item.toppingPrice || 0);

    let resultItem;

    if (existing) {
        const newQty = Number(existing.quantity) + Number(item.quantity);

        await db.runAsync(
            `UPDATE cart_items 
             SET quantity=?, total_price=?, size_price=?, topping_price=?, 
                 image=?, note=? 
             WHERE id=?`,
            [
                newQty,
                newQty * unitPrice,
                item.sizePrice || 0,
                item.toppingPrice || 0,
                item.image ?? existing.image,
                item.note ?? existing.note,
                existing.id,
            ]
        );

        // 🔥 lấy lại item sau update
        resultItem = await db.getFirstAsync<any>(
            `SELECT * FROM cart_items WHERE id=?`,
            [existing.id]
        );
    } else {
        const res = await db.runAsync(
            `INSERT INTO cart_items (
                shop_ref, product_id, product_name,
                base_price, size_price, topping_price,
                total_price, quantity,
                size_id, size_name,
                topping_ids, topping_names,
                note, image, selected
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                shop.id,
                item.productId,
                item.productName,
                item.basePrice,
                item.sizePrice || 0,
                item.toppingPrice || 0,
                unitPrice * item.quantity,
                item.quantity,
                sizeId,
                item.sizeName,
                toppingKey,
                toJSON(item.toppingNames),
                item.note ?? "",
                item.image ?? null,
            ]
        );

        // 🔥 lấy lại item vừa insert
        resultItem = await db.getFirstAsync<any>(
            `SELECT * FROM cart_items WHERE id=?`,
            [res.lastInsertRowId]
        );
    }

    await recalcShopTotal(shop.id);

    // ✅ parse giống drizzle (quan trọng)
    return parseItem(resultItem);
}
// ================== TOTAL ==================
export async function recalcShopTotal(shopRef: number) {
    const db = await getDB();

    const items = await db.getAllAsync<any>(
        `SELECT total_price FROM cart_items WHERE shop_ref=?`,
        [shopRef]
    );

    const total = items.reduce((s, i) => s + Number(i.total_price || 0), 0);

    await db.runAsync(
        `UPDATE cart_shops SET total=? WHERE id=?`,
        [total, shopRef]
    );
}

// ================== REMOVE ==================
export async function removeItem(itemId: number) {
    const db = await getDB();

    const item = await db.getFirstAsync<any>(
        `SELECT * FROM cart_items WHERE id=?`,
        [itemId]
    );

    if (!item) return;

    await db.runAsync(`DELETE FROM cart_items WHERE id=?`, [itemId]);

    const remaining = await db.getAllAsync<any>(
        `SELECT id FROM cart_items WHERE shop_ref=?`,
        [item.shop_ref]
    );

    if (!remaining.length) {
        await db.runAsync(`DELETE FROM cart_shops WHERE id=?`, [item.shop_ref]);
    } else {
        await recalcShopTotal(item.shop_ref);
    }
}

// ================== UPDATE QTY ==================
export async function updateQuantity(itemId: number, delta: number) {
    const db = await getDB();

    const item = await db.getFirstAsync<any>(
        `SELECT * FROM cart_items WHERE id=?`,
        [itemId]
    );

    if (!item) return;

    const newQty = Math.max(0, Number(item.quantity) + delta);
    const unitPrice =
        Number(item.base_price || 0) +
        Number(item.size_price || 0) +
        Number(item.topping_price || 0);

    if (newQty <= 0) {
        await removeItem(itemId);
        return;
    }

    await db.runAsync(
        `UPDATE cart_items SET quantity=?, total_price=? WHERE id=?`,
        [newQty, newQty * unitPrice, itemId]
    );

    await recalcShopTotal(item.shop_ref);
}

// ================== SELECT ITEM ==================
export async function toggleItemSelect(itemId: number, selected: boolean) {
    const db = await getDB();

    const item = await db.getFirstAsync<any>(
        `SELECT * FROM cart_items WHERE id=?`,
        [itemId]
    );

    if (!item) return;

    const shopRef = item.shop_ref;

    if (selected) {
        await db.runAsync(`UPDATE cart_items SET selected=0`);
        await db.runAsync(`UPDATE cart_shops SET selected=0`);
    }

    await db.runAsync(
        `UPDATE cart_items SET selected=? WHERE id=?`,
        [selected ? 1 : 0, itemId]
    );

    await db.runAsync(
        `UPDATE cart_shops SET selected=? WHERE id=?`,
        [selected ? 1 : 0, shopRef]
    );
}

// ================== SELECT SHOP ==================
export async function toggleShopSelect(shopId: string, selected: boolean) {
    const db = await getDB();

    if (selected) {
        await db.runAsync(`UPDATE cart_items SET selected=0`);
        await db.runAsync(`UPDATE cart_shops SET selected=0`);
    }

    const shop = await db.getFirstAsync<any>(
        `SELECT * FROM cart_shops WHERE shop_id=?`,
        [shopId]
    );

    if (!shop) return;

    await db.runAsync(
        `UPDATE cart_shops SET selected=? WHERE shop_id=?`,
        [selected ? 1 : 0, shopId]
    );

    await db.runAsync(
        `UPDATE cart_items SET selected=? WHERE shop_ref=?`,
        [selected ? 1 : 0, shop.id]
    );
}

// ================== GET SELECTED ==================
export async function getSelectedItems() {
    const db = await getDB();

    const items = await db.getAllAsync<any>(
        `SELECT * FROM cart_items WHERE selected=1`
    );

    if (items.length === 0) {
        throw new Error("❌ Không có sản phẩm nào được chọn.");
    }

    const uniqueShops = new Set(items.map(i => i.shop_ref));
    if (uniqueShops.size > 1) {
        throw new Error("❌ Không thể đặt hàng từ nhiều shop.");
    }

    return items.map(parseItem);
}

// ================== CLEAR SELECTED ==================
export async function clearSelectedItems() {
    const db = await getDB();

    await db.runAsync(`DELETE FROM cart_items WHERE selected=1`);

    const shops = await db.getAllAsync<any>(`SELECT id FROM cart_shops`);

    for (const s of shops) {
        const remaining = await db.getAllAsync<any>(
            `SELECT id FROM cart_items WHERE shop_ref=?`,
            [s.id]
        );

        if (!remaining.length) {
            await db.runAsync(`DELETE FROM cart_shops WHERE id=?`, [s.id]);
        } else {
            await recalcShopTotal(s.id);
        }
    }
}

// ================== CLEAR ==================
export async function clearCart() {
    const db = await getDB();
    await db.execAsync(`
    DELETE FROM cart_items;
    DELETE FROM cart_shops;
  `);
}

// ================== GET SHOP ID ==================
export async function getShopIdFromItem(itemId: number): Promise<string> {
    const db = await getDB();

    const item = await db.getFirstAsync<any>(
        `SELECT shop_ref FROM cart_items WHERE id=?`,
        [itemId]
    );

    if (!item) throw new Error("Item not found");

    const shop = await db.getFirstAsync<any>(
        `SELECT shop_id FROM cart_shops WHERE id=?`,
        [item.shop_ref]
    );

    if (!shop) throw new Error("Shop not found");

    return shop.shop_id;
}

// ================== BUILD PAYLOAD ==================
export async function buildCartPayload() {
    const grouped = await getCartGrouped();

    const shopCarts = Object.entries(grouped).map(
        ([shopId, shopData]: any) => ({
            shopId,
            shopName: shopData.shopName,
            totalPrice: shopData.total,
            items: shopData.items.map((i: any) => ({
                productId: i.productId,
                productName: i.productName,
                basePrice: i.basePrice,
                sizePrice: i.sizePrice,
                toppingPrice: i.toppingPrice,
                quantity: i.quantity,
                totalPrice: i.totalPrice,
                image: i.image,
                sizeId: i.sizeId ?? null,
                sizeName: i.sizeName || "",
                toppingIds: i.toppingIds || [],
                toppingNames: i.toppingNames || [],
            })),
        })
    );

    return { shopCarts };
}