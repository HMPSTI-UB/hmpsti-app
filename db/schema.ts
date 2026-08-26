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
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_products = pgTable("merch_products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => merch_categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  hasSizes: boolean("has_sizes").default(false).notNull(),
  stock: integer("stock"),
  availabilityType: availabilityTypeEnum("availability_type").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
});

export const merch_product_sizes = pgTable("merch_product_sizes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => merch_products.id, { onDelete: "cascade" }).notNull(),
  sizeName: varchar("size_name", { length: 50 }).notNull(),
  stock: integer("stock").notNull(),
});
