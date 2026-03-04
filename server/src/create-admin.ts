import "dotenv/config";
import crypto from "crypto";
import { db } from "./db/index.js";
import { user, account } from "./db/schema/auth";
import { eq } from "drizzle-orm";

// ===== ADMIN CREDENTIALS =====
const ADMIN_NAME = "Admin PKBM";
const ADMIN_EMAIL = "admin@pkbm-bl.id";
const ADMIN_PASSWORD = "Admin@123456";
// ==============================

function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
}

async function createAdmin() {
    console.log("🔑 Creating admin account...\n");

    // Check if user already exists
    const existing = await db
        .select()
        .from(user)
        .where(eq(user.email, ADMIN_EMAIL))
        .limit(1);

    let userId: string;

    if (existing.length > 0) {
        console.log("  ⚠️  User already exists, updating role to admin...");
        userId = existing[0].id;
    } else {
        // Create user
        console.log(`📧 Creating user: ${ADMIN_EMAIL}`);
        const hashedPassword = await hashPassword(ADMIN_PASSWORD);

        const [newUser] = await db.insert(user).values({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            emailVerified: true,
            role: "admin",
        }).returning();

        userId = newUser.id;

        // Create account (credential provider)
        await db.insert(account).values({
            userId: userId,
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
        });

        console.log("  ✅ User & account created");
    }

    // Ensure role is admin
    await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.email, ADMIN_EMAIL));

    console.log("  ✅ Admin role set\n");
    console.log("╔══════════════════════════════════════════╗");
    console.log("║        🎉 Admin Account Created!         ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log(`║  Email:    ${ADMIN_EMAIL.padEnd(28)} ║`);
    console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(28)} ║`);
    console.log(`║  Role:     admin                         ║`);
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  ⚠️  Ganti password setelah login!       ║");
    console.log("╚══════════════════════════════════════════╝");

    process.exit(0);
}

createAdmin().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
