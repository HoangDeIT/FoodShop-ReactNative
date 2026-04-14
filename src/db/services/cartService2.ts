// import { and, eq } from "drizzle-orm";
// import { initDb } from "../db";
// import { cartShops } from "../tables/cart.shops";
// import { cartItems } from "../tables/cart_items";

// // ✅ Helpers
// const toJSON = (arr?: string[]) => JSON.stringify(arr || []);
// const fromJSON = (str?: string | null) => {
//     if (!str) return [];
//     try {
//         const parsed = JSON.parse(str);
//         return Array.isArray(parsed) ? parsed : [];
//     } catch {
//         return [];
//     }
// };

// const parseItem = (item: any) => ({
//     id: item.id,
//     shopRef: item.shopRef,
//     productId: item.productId,
//     productName: item.productName,
//     basePrice: Number(item.basePrice || 0),
//     sizePrice: Number(item.sizePrice || 0),
//     toppingPrice: Number(item.toppingPrice || 0),
//     totalPrice: Number(item.totalPrice || 0),
//     quantity: Number(item.quantity || 0),
//     sizeId: item.sizeId === "" ? null : item.sizeId,
//     sizeName: item.sizeName || "",
//     toppingIds: fromJSON(item.toppingIds),
//     toppingNames: fromJSON(item.toppingNames),
//     note: item.note || "",
//     image: item.image || null,
//     selected: !!item.selected,
// });

// // 🧩 Interfaces
// export interface AddCartItemInput {
//     shopId: string;
//     shopName: string;
//     productId: string;
//     productName: string;
//     basePrice: number;
//     sizePrice: number;
//     toppingPrice?: number;
//     quantity: number;
//     sizeId: string | null;
//     sizeName: string;
//     toppingIds: string[];
//     toppingNames: string[];
//     note?: string;
//     image?: string;
// }

// /* 🧾 Lấy toàn bộ giỏ hàng, group theo shop */
// export async function getCartGrouped(): Promise<
//     Record<string, { shopName: string; total: number; selected: boolean; items: any[] }>
// > {
//     const db = await initDb();
//     const shops = await db.select().from(cartShops);

//     const grouped: Record<string, any> = {};
//     for (const shop of shops) {
//         const items = await db
//             .select()
//             .from(cartItems)
//             .where(eq(cartItems.shopRef, shop.id))
//             .all();

//         const parsedItems = items.map(parseItem);
//         grouped[shop.shopId] = {
//             shopName: shop.shopName,
//             total: Number(shop.total || 0),
//             selected: !!shop.selected,
//             items: parsedItems,
//         };
//     }
//     return grouped;
// }

// /**
//  * 🧩 Chuyển cart local (SQLite) thành format server yêu cầu
//  */
// export async function buildCartPayload() {
//     const grouped = await getCartGrouped();
//     const shopCarts = Object.entries(grouped).map(([shopId, shopData]) => ({
//         shopId,
//         shopName: shopData.shopName,
//         totalPrice: shopData.total, // server expects shop total
//         items: shopData.items.map((i: any) => ({
//             productId: i.productId,
//             productName: i.productName,
//             basePrice: i.basePrice,
//             sizePrice: i.sizePrice,
//             toppingPrice: i.toppingPrice,
//             quantity: i.quantity,
//             totalPrice: i.totalPrice,
//             image: i.image,
//             sizeId: i.sizeId ?? null,
//             sizeName: i.sizeName || "",
//             toppingIds: i.toppingIds || [],
//             toppingNames: i.toppingNames || [],
//             // note: i.note || "", ko cần gửi note lên server
//         })),
//     }));
//     return { shopCarts };
// }

// /* ➕ Thêm sản phẩm vào giỏ */
// export async function addToCart(item: AddCartItemInput): Promise<void> {
//     const db = await initDb();

//     // 1️⃣ Tìm hoặc tạo shop
//     const shops = await db
//         .select()
//         .from(cartShops)
//         .where(eq(cartShops.shopId, item.shopId));

//     let shop = shops[0];
//     if (!shop) {
//         const result = await db
//             .insert(cartShops)
//             .values({ shopId: item.shopId, shopName: item.shopName, total: 0, selected: false })
//             .returning({ id: cartShops.id });

//         shop = {
//             id: result[0].id,
//             shopId: item.shopId,
//             shopName: item.shopName,
//             total: 0,
//             selected: false,
//         };
//     } else {
//         // ensure shopName is up-to-date when provided (optional)
//         if (!shop.shopName && item.shopName) {
//             await db.update(cartShops).set({ shopName: item.shopName }).where(eq(cartShops.id, shop.id)).run();
//             shop.shopName = item.shopName;
//         }
//     }

//     // normalize sizeId/toppingIds for comparison/storage
//     const normalizedSizeId = item.sizeId ?? "";
//     const toppingKey = toJSON(item.toppingIds);

//     // 2️⃣ Kiểm tra sản phẩm trùng (same product + size + topping)
//     const existing = await db
//         .select()
//         .from(cartItems)
//         .where(
//             and(
//                 eq(cartItems.shopRef, shop!.id),
//                 eq(cartItems.productId, item.productId),
//                 eq(cartItems.sizeId, normalizedSizeId),
//                 eq(cartItems.toppingIds, toppingKey)
//             )
//         )
//         .get();

//     // 🧮 Tính toán giá thực tế (gồm size + topping)
//     const sizePrice = item.sizePrice || 0;
//     const toppingPrice = item.toppingPrice || 0;
//     const unitPrice = (item.basePrice || 0) + sizePrice + toppingPrice;

//     if (existing) {
//         // Nếu đã có -> cộng dồn số lượng
//         const newQty = Number(existing.quantity) + Number(item.quantity);
//         const newTotal = newQty * unitPrice;

//         await db
//             .update(cartItems)
//             .set({
//                 quantity: newQty,
//                 totalPrice: newTotal,
//                 sizePrice,
//                 toppingPrice,
//                 // update image/note if provided in new item
//                 image: item.image ?? existing.image,
//                 note: item.note ?? existing.note,
//             })
//             .where(eq(cartItems.id, existing.id))
//             .run();
//     } else {
//         // Nếu chưa có -> thêm mới
//         const totalPrice = unitPrice * item.quantity;
//         await db
//             .insert(cartItems)
//             .values({
//                 shopRef: shop!.id,
//                 productId: item.productId,
//                 productName: item.productName,
//                 basePrice: item.basePrice,
//                 sizePrice,
//                 toppingPrice,
//                 quantity: item.quantity,
//                 totalPrice,
//                 sizeId: normalizedSizeId,
//                 sizeName: item.sizeName ?? "",
//                 toppingIds: toppingKey,
//                 toppingNames: toJSON(item.toppingNames),
//                 note: item.note ?? "",
//                 image: item.image ?? null,
//                 selected: false,
//             })
//             .run();
//     }

//     // 3️⃣ Cập nhật tổng tiền shop
//     await recalcShopTotal(shop!.id);
// }

// /* 🔄 Tính lại tổng tiền của 1 shop */
// export async function recalcShopTotal(shopRef: number): Promise<void> {
//     const db = await initDb();
//     const items = await db.select().from(cartItems).where(eq(cartItems.shopRef, shopRef)).all();
//     const total = items.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);
//     await db.update(cartShops).set({ total }).where(eq(cartShops.id, shopRef)).run();
// }

// /* 🧹 Xoá toàn bộ giỏ của 1 shop */
// export async function clearShop(shopId: string): Promise<void> {
//     const db = await initDb();
//     const shop = await db.select().from(cartShops).where(eq(cartShops.shopId, shopId)).get();
//     if (!shop) return;

//     await db.delete(cartItems).where(eq(cartItems.shopRef, shop.id)).run();
//     await db.delete(cartShops).where(eq(cartShops.id, shop.id)).run();
// }

// /* ✏️ Chọn / bỏ chọn item (chỉ 1 shop được phép cùng lúc) */
// export async function toggleItemSelect(itemId: number, selected: boolean): Promise<void> {
//     const db = await initDb();

//     // Lấy item cần chọn
//     const item = await db.select().from(cartItems).where(eq(cartItems.id, itemId)).get();
//     if (!item) return;

//     const shopRef = item.shopRef;

//     // 🔍 Nếu chọn item mới mà có item của shop khác đang được chọn → bỏ chọn hết
//     if (selected) {
//         const selectedItems = await db.select().from(cartItems).where(eq(cartItems.selected, true)).all();
//         const uniqueShops = new Set(selectedItems.map((i) => i.shopRef));

//         if (uniqueShops.size > 0 && !uniqueShops.has(shopRef)) {
//             // Bỏ chọn toàn bộ shop và item cũ
//             await db.update(cartItems).set({ selected: false }).run();
//             await db.update(cartShops).set({ selected: false }).run();
//         }
//     }

//     // ✅ Cập nhật item được chọn/bỏ chọn
//     await db.update(cartItems).set({ selected }).where(eq(cartItems.id, itemId)).run();

//     // Kiểm tra toàn bộ item trong shop
//     const shopItems = await db.select().from(cartItems).where(eq(cartItems.shopRef, shopRef)).all();
//     const allSelected = shopItems.every((i) => i.selected);
//     const anySelected = shopItems.some((i) => i.selected);

//     // Cập nhật trạng thái shop tương ứng
//     await db
//         .update(cartShops)
//         .set({ selected: allSelected ? true : anySelected ? true : false })
//         .where(eq(cartShops.id, shopRef))
//         .run();
// }

// /* ✏️ Chọn / bỏ chọn shop (chỉ 1 shop được phép cùng lúc) */
// export async function toggleShopSelect(shopId: string, selected: boolean): Promise<void> {
//     const db = await initDb();

//     // 🔍 Nếu chọn shop mới mà đã có shop khác được chọn → bỏ chọn toàn bộ
//     if (selected) {
//         const selectedShops = await db.select().from(cartShops).where(eq(cartShops.selected, true)).all();
//         if (selectedShops.length > 0) {
//             await db.update(cartShops).set({ selected: false }).run();
//             await db.update(cartItems).set({ selected: false }).run();
//         }
//     }

//     // ✅ Lấy shop hiện tại
//     const shop = await db.select().from(cartShops).where(eq(cartShops.shopId, shopId)).get();
//     if (!shop) return;

//     // ✅ Cập nhật trạng thái shop
//     await db.update(cartShops).set({ selected }).where(eq(cartShops.shopId, shopId)).run();

//     // ✅ Cập nhật toàn bộ item trong shop
//     await db.update(cartItems).set({ selected }).where(eq(cartItems.shopRef, shop.id)).run();
// }


// /* ✅ Lấy toàn bộ item được chọn để order */

// export async function getSelectedItems(): Promise<any[]> {
//     const db = await initDb();

//     const items = await db.select().from(cartItems).where(eq(cartItems.selected, true)).all();

//     if (items.length === 0) {
//         throw new Error("❌ Không có sản phẩm nào được chọn.");
//     }

//     const uniqueShops = new Set(items.map((item) => item.shopRef));
//     if (uniqueShops.size > 1) {
//         throw new Error("❌ Không thể đặt hàng từ nhiều cửa hàng cùng lúc. Vui lòng chỉ chọn sản phẩm từ 1 cửa hàng.");
//     }

//     return items.map(parseItem);
// }

// /* 💳 Xoá item đã order (sau khi checkout thành công) */
// export async function clearSelectedItems(): Promise<void> {
//     const db = await initDb();
//     await db.delete(cartItems).where(eq(cartItems.selected, true)).run();
//     // update shops totals and remove empties
//     const shops = await db.select().from(cartShops).all();
//     for (const s of shops) {
//         const remaining = await db.select().from(cartItems).where(eq(cartItems.shopRef, s.id)).all();
//         if (!remaining.length) {
//             await db.delete(cartShops).where(eq(cartShops.id, s.id)).run();
//         } else {
//             await recalcShopTotal(s.id);
//         }
//     }
// }

// /* ❌ Xoá toàn bộ cart */
// export async function clearCart(): Promise<void> {
//     const db = await initDb();
//     await db.delete(cartItems).run();
//     await db.delete(cartShops).run();
// }

// /* 🔼 Tăng/giảm số lượng item */
// export async function updateQuantity(itemId: number, delta: number): Promise<void> {
//     const db = await initDb();

//     const rows = await db.select().from(cartItems).where(eq(cartItems.id, itemId)).all();
//     if (!rows.length) return;

//     const item = rows[0];
//     const newQty = Math.max(0, Number(item.quantity) + delta);
//     const unitPrice = Number(item.basePrice || 0) + Number(item.sizePrice || 0) + Number(item.toppingPrice || 0);

//     if (newQty <= 0) {
//         await db.delete(cartItems).where(eq(cartItems.id, itemId)).run();
//     } else {
//         const newTotal = newQty * unitPrice;
//         await db
//             .update(cartItems)
//             .set({ quantity: newQty, totalPrice: newTotal })
//             .where(eq(cartItems.id, itemId))
//             .run();
//     }

//     await recalcShopTotal(item.shopRef);

//     const remaining = await db.select().from(cartItems).where(eq(cartItems.shopRef, item.shopRef)).all();
//     if (!remaining.length) {
//         await db.delete(cartShops).where(eq(cartShops.id, item.shopRef)).run();
//     }
// }

// /* ❌ Xoá 1 item riêng lẻ */
// export async function removeItem(itemId: number): Promise<void> {
//     const db = await initDb();
//     const rows = await db.select().from(cartItems).where(eq(cartItems.id, itemId)).all();
//     if (!rows.length) return;

//     const item = rows[0];
//     await db.delete(cartItems).where(eq(cartItems.id, itemId)).run();

//     await recalcShopTotal(item.shopRef);

//     const remaining = await db.select().from(cartItems).where(eq(cartItems.shopRef, item.shopRef)).all();
//     if (!remaining.length) {
//         await db.delete(cartShops).where(eq(cartShops.id, item.shopRef)).run();
//     }
// }

// //🔍 Tìm shopId (chuỗi) thật từ item trong giỏ hàng

// export async function getShopIdFromItem(itemId: number): Promise<string> {
//     const db = await initDb();

//     // 1️⃣ Lấy item
//     const item = await db
//         .select({ shopRef: cartItems.shopRef })
//         .from(cartItems)
//         .where(eq(cartItems.id, itemId))
//         .get();

//     if (!item) {
//         throw new Error(`❌ Không tìm thấy item có id = ${itemId}`);
//     }

//     // 2️⃣ Lấy shop tương ứng
//     const shop = await db
//         .select({ shopId: cartShops.shopId })
//         .from(cartShops)
//         .where(eq(cartShops.id, item.shopRef))
//         .get();

//     if (!shop) {
//         throw new Error(`❌ Không tìm thấy shop tương ứng cho item ${itemId}`);
//     }

//     return shop.shopId;
// }