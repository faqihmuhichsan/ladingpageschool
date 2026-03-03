import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 50 }).notNull().unique(), // "total_students", "total_teachers", etc.
    value: text("value").notNull(),
    label: varchar("label", { length: 100 }), // "Siswa Aktif"
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
