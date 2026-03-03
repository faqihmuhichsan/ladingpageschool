import "dotenv/config";
import { db } from "./db/index.js";
import { user } from "./db/schema/auth";
import { eq } from "drizzle-orm";

const API_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// ===== ADMIN CREDENTIALS =====
const ADMIN_NAME = "Admin PKBM";
const ADMIN_EMAIL = "admin@pkbm-bl.id";
const ADMIN_PASSWORD = "Admin@123456";
// ==============================

async function createAdmin() {
    console.log("🔑 Creating admin account...\n");

    // Step 1: Register via Better Auth API
    console.log(`📧 Registering: ${ADMIN_EMAIL}`);
    const signupRes = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        }),
    });

    if (!signupRes.ok) {
        const err = await signupRes.text();
        if (err.includes("already") || err.includes("exists")) {
            console.log("  ⚠️  User already exists, updating role to admin...");
        } else {
            console.error("  ❌ Registration failed:", err);
            process.exit(1);
        }
    } else {
        console.log("  ✅ User registered successfully");
    }

    // Step 2: Update role to admin in database
    console.log("👑 Setting role to admin...");
    const result = await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.email, ADMIN_EMAIL))
        .returning({ id: user.id, name: user.name, email: user.email, role: user.role });

    if (result.length === 0) {
        console.error("  ❌ User not found in database");
        process.exit(1);
    }

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
