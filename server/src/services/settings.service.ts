import { db } from "../db/index.js";
import { siteSettings } from "../db/schema/site-settings.js";
import { eq } from "drizzle-orm";

export class SettingsService {
    static async getAll() {
        return db.select().from(siteSettings);
    }

    static async getByKey(key: string) {
        const result = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, key))
            .limit(1);
        return result[0] || null;
    }

    static async upsert(key: string, value: string, label?: string) {
        const existing = await this.getByKey(key);

        if (existing) {
            const result = await db
                .update(siteSettings)
                .set({ value, label, updatedAt: new Date() })
                .where(eq(siteSettings.key, key))
                .returning();
            return result[0];
        }

        const result = await db
            .insert(siteSettings)
            .values({ key, value, label })
            .returning();
        return result[0];
    }
}
