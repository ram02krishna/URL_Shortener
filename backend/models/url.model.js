import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid("id").defaultRandom().primaryKey(),

  shortCode: varchar("code", { length: 155 }).notNull().unique(),
  targetURL: text("target_url").notNull(),

  userId: uuid("user_id")
    .references(() => usersTable.id),

  deviceId: varchar("device_id", { length: 255 }),

  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
  return {
    userIdIndex: index("user_id_idx").on(table.userId),
  }
});
