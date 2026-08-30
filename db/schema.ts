import { pgTable, text, timestamp, varchar, pgEnum, serial, integer, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: 'date' }).defaultNow().notNull(),
});

export const vote_sessions = pgTable("vote_sessions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  startTime: timestamp("start_time", { mode: 'date' }).notNull(),
  endTime: timestamp("end_time", { mode: 'date' }).notNull(),
});

export const iot_teams = pgTable("iot_teams", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).unique().notNull(),
  className: varchar("class_name", { length: 10 }).notNull(),
  groupNumber: integer("group_number").notNull(),
  title: text("title").notNull(),
  teamMembers: text("team_members").notNull(),
  bannerImageUrl: text("banner_image_url"),
  projectImageUrl: text("project_image_url"),
  sessionId: integer("session_id").references(() => vote_sessions.id).notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => iot_teams.id).notNull(),
  sessionId: integer("session_id").references(() => vote_sessions.id).notNull(),
  voterName: varchar("voter_name", { length: 255 }),
  message: text("message"),
  votedAt: timestamp("voted_at", { mode: 'date' }).defaultNow().notNull(),
});

export const availabilityTypeEnum = pgEnum('availability_type', ['ready', 'out_of_stock', 'preorder']);

export const merch_categories = pgTable("merch_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_products = pgTable("merch_products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => merch_categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  hasSizes: boolean("has_sizes").default(false).notNull(),
  stock: integer("stock"),
  availabilityType: availabilityTypeEnum("availability_type").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_product_images = pgTable("merch_product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => merch_products.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_product_sizes = pgTable("merch_product_sizes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => merch_products.id, { onDelete: "cascade" }).notNull(),
  sizeName: varchar("size_name", { length: 50 }).notNull(),
  stock: integer("stock").notNull(),
});

export const merchOrderStatusEnum = pgEnum('merch_order_status', ['MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK']);

export const merch_orders = pgTable("merch_orders", {
  id: serial("id").primaryKey(),
  orderCode: varchar("order_code").unique().notNull(),
  buyerName: varchar("buyer_name").notNull(),
  buyerContact: varchar("buyer_contact").notNull(),
  buyerAddress: text("buyer_address").notNull(),
  buyerNote: text("buyer_note"),
  totalAmount: integer("total_amount").notNull(),
  paymentProofUrl: text("payment_proof_url").notNull(),
  status: merchOrderStatusEnum("status").default("MENUNGGU_VERIFIKASI").notNull(),
  rejectionReason: text("rejection_reason"),
  verifiedBy: text("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at", { mode: 'date' }),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_order_items = pgTable("merch_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => merch_orders.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => merch_products.id, { onDelete: "set null" }),
  productNameSnapshot: varchar("product_name_snapshot").notNull(),
  productPriceSnapshot: integer("product_price_snapshot").notNull(),
  sizeId: integer("size_id").references(() => merch_product_sizes.id, { onDelete: "set null" }),
  sizeNameSnapshot: varchar("size_name_snapshot"),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

