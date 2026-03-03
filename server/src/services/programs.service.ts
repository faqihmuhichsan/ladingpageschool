import { db } from "../db/index.js";
import { programs } from "../db/schema/programs.js";
import { eq, asc } from "drizzle-orm";

export class ProgramsService {
    static async getActive() {
        return db
            .select()
            .from(programs)
            .where(eq(programs.isActive, true))
            .orderBy(asc(programs.sortOrder));
    }

    static async getAll() {
        return db.select().from(programs).orderBy(asc(programs.sortOrder));
    }

    static async getById(id: string) {
        const result = await db
            .select()
            .from(programs)
            .where(eq(programs.id, id))
            .limit(1);
        return result[0] || null;
    }

    static async create(data: {
        title: string;
        level: string;
        levelLabel: string;
        description: string;
        imageUrl?: string;
        features?: string[];
        sortOrder?: number;
    }) {
        const result = await db.insert(programs).values(data).returning();
        return result[0];
    }

    static async update(
        id: string,
        data: Partial<{
            title: string;
            level: string;
            levelLabel: string;
            description: string;
            imageUrl: string;
            features: string[];
            isActive: boolean;
            sortOrder: number;
        }>
    ) {
        const result = await db
            .update(programs)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(programs.id, id))
            .returning();
        return result[0] || null;
    }

    static async delete(id: string) {
        const result = await db
            .delete(programs)
            .where(eq(programs.id, id))
            .returning();
        return result[0] || null;
    }
}
