import { pgTable, text, timestamp, varchar, pgEnum, serial, integer } from "drizzle-orm/pg-core";

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
