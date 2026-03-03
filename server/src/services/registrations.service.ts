import { db } from "../db/index.js";
import { registrations } from "../db/schema/registrations.js";
import { eq, desc } from "drizzle-orm";

export class RegistrationsService {
    static async getAll() {
        return db
            .select()
            .from(registrations)
            .orderBy(desc(registrations.createdAt));
    }

    static async getById(id: string) {
        const result = await db
            .select()
            .from(registrations)
            .where(eq(registrations.id, id))
            .limit(1);
        return result[0] || null;
    }

    static async create(data: {
        fullName: string;
        email: string;
        phone: string;
        program: string;
        message?: string;
    }) {
        const result = await db.insert(registrations).values(data).returning();
        return result[0];
    }

    static async updateStatus(id: string, status: string) {
        const result = await db
            .update(registrations)
            .set({ status, updatedAt: new Date() })
            .where(eq(registrations.id, id))
            .returning();
        return result[0] || null;
    }
}
