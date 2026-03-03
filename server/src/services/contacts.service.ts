import { db } from "../db/index.js";
import { contacts } from "../db/schema/contacts.js";
import { eq, desc } from "drizzle-orm";

export class ContactsService {
    static async getAll() {
        return db.select().from(contacts).orderBy(desc(contacts.createdAt));
    }

    static async create(data: {
        name: string;
        email: string;
        subject?: string;
        message: string;
    }) {
        const result = await db.insert(contacts).values(data).returning();
        return result[0];
    }

    static async markRead(id: string) {
        const result = await db
            .update(contacts)
            .set({ isRead: true })
            .where(eq(contacts.id, id))
            .returning();
        return result[0] || null;
    }

    static async delete(id: string) {
        const result = await db
            .delete(contacts)
            .where(eq(contacts.id, id))
            .returning();
        return result[0] || null;
    }
}
