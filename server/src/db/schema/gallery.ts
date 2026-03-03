import {
    pgTable,
    uuid,
    varchar,
    boolean,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

export const gallery = pgTable("gallery", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    category: varchar("category", { length: 30 }), // kegiatan, pembelajaran, acara
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
