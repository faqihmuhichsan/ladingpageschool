import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
} from "drizzle-orm/pg-core";

export const programs = pgTable("programs", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    level: varchar("level", { length: 20 }).notNull(), // tk, sd, smp, sma
    levelLabel: varchar("level_label", { length: 50 }).notNull(), // "TK / PAUD", "SD / Paket A"
    description: text("description").notNull(),
    imageUrl: varchar("image_url", { length: 255 }),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
