import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    smallint,
    timestamp,
} from "drizzle-orm/pg-core";

export const testimonials = pgTable("testimonials", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    role: varchar("role", { length: 50 }).notNull(), // "Siswa TK/PAUD", "Alumni", etc.
    rating: smallint("rating").notNull(), // 1-5
    message: text("message").notNull(),
    avatarColor: varchar("avatar_color", { length: 100 }), // CSS gradient string
    isApproved: boolean("is_approved").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
