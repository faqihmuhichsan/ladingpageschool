import { db } from "../db/index.js";
import { gallery } from "../db/schema/gallery.js";
import { eq, asc } from "drizzle-orm";

export class GalleryService {
    static async getActive() {
        return db
            .select()
            .from(gallery)
            .where(eq(gallery.isActive, true))
            .orderBy(asc(gallery.sortOrder));
    }

    static async getAll() {
        return db.select().from(gallery).orderBy(asc(gallery.sortOrder));
    }

    static async create(data: {
        title: string;
        imageUrl: string;
        category?: string;
        sortOrder?: number;
    }) {
        const result = await db.insert(gallery).values(data).returning();
        return result[0];
    }

    static async update(
        id: string,
        data: Partial<{
            title: string;
            imageUrl: string;
            category: string;
            sortOrder: number;
            isActive: boolean;
        }>
    ) {
        const result = await db
            .update(gallery)
            .set(data)
            .where(eq(gallery.id, id))
            .returning();
        return result[0] || null;
    }

    static async delete(id: string) {
        const result = await db
            .delete(gallery)
            .where(eq(gallery.id, id))
            .returning();
        return result[0] || null;
    }
}
