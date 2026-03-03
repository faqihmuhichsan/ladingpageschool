import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    program: varchar("program", { length: 20 }).notNull(), // "TK/PAUD", "SD/Paket A", etc.
    message: text("message"),
    status: varchar("status", { length: 20 }).notNull().default("new"), // new, contacted, enrolled, rejected
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
