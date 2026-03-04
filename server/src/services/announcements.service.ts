import { db } from "../db/index.js";
import { announcements } from "../db/schema/announcements";
import { eq, desc } from "drizzle-orm";

export const announcementsService = {
    async getAll() {
        return db.select().from(announcements).orderBy(desc(announcements.createdAt));
    },

    async getPublished() {
        return db
            .select()
            .from(announcements)
            .where(eq(announcements.isPublished, true))
            .orderBy(desc(announcements.createdAt));
    },

    async getById(id: string) {
        const [item] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
        return item;
    },

    async create(data: {
        title: string;
        content: string;
        category?: string;
        priority?: string;
        authorId?: string;
        isPublished?: boolean;
        imageUrl?: string;
    }) {
        const [item] = await db.insert(announcements).values(data).returning();
        return item;
    },

    async update(id: string, data: Partial<{
        title: string;
        content: string;
        category: string;
        priority: string;
        isPublished: boolean;
        imageUrl: string;
    }>) {
        const [item] = await db
            .update(announcements)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(announcements.id, id))
            .returning();
        return item;
    },

    async delete(id: string) {
        await db.delete(announcements).where(eq(announcements.id, id));
    },
};
