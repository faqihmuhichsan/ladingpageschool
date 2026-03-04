import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth";
import { eq, or, ilike } from "drizzle-orm";
import crypto from "crypto";

function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
}

export const usersService = {
    async getAdmins() {
        return db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            })
            .from(user)
            .where(or(eq(user.role, "admin"), eq(user.role, "superadmin"), eq(user.role, "editor")));
    },

    async getStudents() {
        return db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            })
            .from(user)
            .where(eq(user.role, "user"));
    },

    async getById(id: string) {
        const [foundUser] = await db.select().from(user).where(eq(user.id, id)).limit(1);
        return foundUser;
    },

    async createAdmin(data: { name: string; email: string; password: string; role: string }) {
        // Check existing
        const [existing] = await db.select().from(user).where(eq(user.email, data.email)).limit(1);
        if (existing) throw new Error("Email sudah digunakan");

        const hashedPassword = await hashPassword(data.password);
        const userId = crypto.randomUUID();

        await db.insert(user).values({
            id: userId,
            name: data.name,
            email: data.email,
            emailVerified: true,
            role: data.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await db.insert(account).values({
            id: crypto.randomUUID(),
            userId,
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { id: userId, name: data.name, email: data.email, role: data.role };
    },

    async updateRole(id: string, role: string) {
        const [updated] = await db
            .update(user)
            .set({ role, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updated;
    },

    async updateProfile(id: string, data: { name?: string; email?: string }) {
        const [updated] = await db
            .update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updated;
    },

    async changePassword(id: string, newPassword: string) {
        const hashedPassword = await hashPassword(newPassword);
        await db
            .update(account)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(account.userId, id));
    },

    async deleteUser(id: string) {
        await db.delete(user).where(eq(user.id, id));
    },
};
