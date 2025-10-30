import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cartItems = sqliteTable("cart_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    shopRef: integer("shop_ref").notNull(), // 🔗 liên kết với cart_shops.id
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    basePrice: real("base_price").notNull(),
    sizePrice: real("size_price").default(0), // ✅ giá thêm từ size
    toppingPrice: real("topping_price").default(0), // ✅ tổng giá toppings
    totalPrice: real("total_price").notNull(),
    sizeId: text("size_id"),
    sizeName: text("size_name").default(""),
    toppingIds: text("topping_ids").default(""),
    toppingNames: text("topping_names").default(""),
    quantity: integer("quantity").notNull(),
    note: text("note").default(""),
    image: text("image"),
    selected: integer("selected", { mode: "boolean" }).default(false),
});
