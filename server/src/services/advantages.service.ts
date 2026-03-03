import { db } from "../db/index.js";
import { advantages } from "../db/schema/advantages.js";
import { eq, asc } from "drizzle-orm";

export class AdvantagesService {
    static async getActive() {
        return db
            .select()
            .from(advantages)
            .where(eq(advantages.isActive, true))
            .orderBy(asc(advantages.sortOrder));
    }

    static async getAll() {
        return db.select().from(advantages).orderBy(asc(advantages.sortOrder));
    }

    static async create(data: {
        title: string;
        description: string;
        icon: string;
        sortOrder?: number;
    }) {
        const result = await db.insert(advantages).values(data).returning();
        return result[0];
    }

    static async update(
        id: string,
        data: Partial<{
            title: string;
            description: string;
            icon: string;
            sortOrder: number;
            isActive: boolean;
        }>
    ) {
        const result = await db
            .update(advantages)
            .set(data)
            .where(eq(advantages.id, id))
            .returning();
        return result[0] || null;
    }

    static async delete(id: string) {
        const result = await db
            .delete(advantages)
            .where(eq(advantages.id, id))
            .returning();
        return result[0] || null;
    }
}
