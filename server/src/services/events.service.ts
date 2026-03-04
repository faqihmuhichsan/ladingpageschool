import { db } from "../db/index.js";
import { events } from "../db/schema/events";
import { eq, desc, gte } from "drizzle-orm";

export const eventsService = {
    async getAll() {
        return db.select().from(events).orderBy(desc(events.eventDate));
    },

    async getUpcoming() {
        const now = new Date();
        return db
            .select()
            .from(events)
            .where(gte(events.eventDate, now))
            .orderBy(events.eventDate);
    },

    async getById(id: string) {
        const [item] = await db.select().from(events).where(eq(events.id, id)).limit(1);
        return item;
    },

    async create(data: {
        title: string;
        description?: string;
        eventDate: Date;
        eventTime?: string;
        location?: string;
        category?: string;
        imageUrl?: string;
    }) {
        const [item] = await db.insert(events).values(data).returning();
        return item;
    },

    async update(id: string, data: Partial<{
        title: string;
        description: string;
        eventDate: Date;
        eventTime: string;
        location: string;
        category: string;
        imageUrl: string;
    }>) {
        const [item] = await db
            .update(events)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(events.id, id))
            .returning();
        return item;
    },

    async delete(id: string) {
        await db.delete(events).where(eq(events.id, id));
    },
};
