import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cartShops = sqliteTable('cart_shops', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    shopId: text('shop_id').notNull(),
    shopName: text('shop_name').notNull(),
    total: real('total').default(0),
    selected: integer('selected', { mode: 'boolean' }).default(false), // ✅ chọn cả shop để order
});
