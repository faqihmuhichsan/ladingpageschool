import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const announcements = pgTable("announcements", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 50 }).notNull().default("umum"), // umum, akademik, acara, penting
    priority: varchar("priority", { length: 20 }).notNull().default("normal"), // normal, penting, urgent
    authorId: uuid("author_id").references(() => user.id, { onDelete: "set null" }),
    isPublished: boolean("is_published").notNull().default(true),
    imageUrl: varchar("image_url", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
