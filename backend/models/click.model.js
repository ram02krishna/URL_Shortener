import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { urlsTable } from "./url.model.js";

export const clicksTable = pgTable("url_clicks", {
  id: uuid("id").defaultRandom().primaryKey(),

  urlId: uuid("url_id")
    .notNull()
    .references(() => urlsTable.id, { onDelete: "cascade" }),

  ipAddress: varchar("ip_address", { length: 45 }),  // supports IPv6
  country:   varchar("country",    { length: 100 }),
  city:      varchar("city",       { length: 100 }),

  browser: varchar("browser", { length: 100 }),
  os:      varchar("os",      { length: 100 }),
  device:  varchar("device",  { length: 50 }),  // "mobile" | "tablet" | "desktop"

  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
}, (table) => ({
  urlIdIndex:      index("clicks_url_id_idx").on(table.urlId),
  clickedAtIndex:  index("clicks_clicked_at_idx").on(table.clickedAt),
}));
