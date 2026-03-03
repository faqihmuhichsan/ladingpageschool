import { db } from "../db/index.js";
import { testimonials } from "../db/schema/testimonials.js";
import { eq, desc } from "drizzle-orm";

export class TestimonialsService {
    static async getApproved() {
        return db
            .select()
            .from(testimonials)
            .where(eq(testimonials.isApproved, true))
            .orderBy(desc(testimonials.createdAt));
    }

    static async getAll() {
        return db
            .select()
            .from(testimonials)
            .orderBy(desc(testimonials.createdAt));
    }

    static async create(data: {
        name: string;
        role: string;
        rating: number;
        message: string;
        avatarColor?: string;
    }) {
        const result = await db.insert(testimonials).values(data).returning();
        return result[0];
    }

    static async update(
        id: string,
        data: Partial<{
            isApproved: boolean;
        }>
    ) {
        const result = await db
            .update(testimonials)
            .set(data)
            .where(eq(testimonials.id, id))
            .returning();
        return result[0] || null;
    }

    static async delete(id: string) {
        const result = await db
            .delete(testimonials)
            .where(eq(testimonials.id, id))
            .returning();
        return result[0] || null;
    }
}
