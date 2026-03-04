import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    eventDate: timestamp("event_date").notNull(),
    eventTime: varchar("event_time", { length: 20 }), // e.g. "08:00 - 12:00"
    location: varchar("location", { length: 255 }),
    category: varchar("category", { length: 50 }).notNull().default("umum"), // umum, akademik, ujian, libur, kegiatan
    imageUrl: varchar("image_url", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
