import { pgTable, text, timestamp, varchar, pgEnum, serial, integer, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['admin', 'user', 'merchant']);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }),
  image: text("image"),
  role: roleEnum("role").default("user").notNull(),
  phone: varchar("phone", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("createdAt", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: 'date' }).defaultNow().notNull(),
});

export const vote_sessions = pgTable("vote_sessions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  startTime: timestamp("start_time", { mode: 'date' }).notNull(),
  endTime: timestamp("end_time", { mode: 'date' }).notNull(),
});

export const teams = pgTable("teams", {
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
  teamId: integer("team_id").references(() => teams.id).notNull(),
  sessionId: integer("session_id").references(() => vote_sessions.id).notNull(),
  voterName: varchar("voter_name", { length: 255 }),
  message: text("message"),
  votedAt: timestamp("voted_at", { mode: 'date' }).defaultNow().notNull(),
});

export const site_settings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  showPameran: boolean("show_pameran").default(true).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merchantStatusEnum = pgEnum('merchant_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const merchant_info = pgTable("merchant_info", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  description: text("description"),
  phone: varchar("phone", { length: 255 }),
  address: text("address"),
  status: merchantStatusEnum("status").default("PENDING").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { mode: 'date' }),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});

export const paymentAccountTypeEnum = pgEnum('payment_account_type', ['bank', 'e_wallet', 'qris']);

export const payment_accounts = pgTable("payment_accounts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: paymentAccountTypeEnum("type").notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 255 }),
  accountOwner: varchar("account_owner", { length: 255 }).notNull(),
  qrisImgUrl: text("qris_img_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
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
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  categoryId: integer("category_id").references(() => merch_categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  hasSizes: boolean("has_sizes").default(false).notNull(),
  hasVariants: boolean("has_variants").default(false).notNull(),
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

export const merch_product_variants = pgTable("merch_product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => merch_products.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  price: integer("price"),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merchOrderStatusEnum = pgEnum('merch_order_status', ['MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK']);

export const merch_orders = pgTable("merch_orders", {
  id: serial("id").primaryKey(),
  orderCode: varchar("order_code").unique().notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
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
  variantId: integer("variant_id").references(() => merch_product_variants.id, { onDelete: "set null" }),
  variantNameSnapshot: varchar("variant_name_snapshot"),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

export const auditEntityEnum = pgEnum('audit_entity', ['category', 'product', 'order', 'merchant', 'payment_account']);
export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT']);

export const merch_audit_logs = pgTable("merch_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: text("admin_id").references(() => users.id, { onDelete: "set null" }),
  entity: auditEntityEnum("entity").notNull(),
  entityId: integer("entity_id"),
  action: auditActionEnum("action").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});
