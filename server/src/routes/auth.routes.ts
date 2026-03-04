import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth.js";
import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

// Mount Better Auth handler on /api/auth/*
router.all("/api/auth/*splat", toNodeHandler(auth));

// Custom admin login (supports scrypt passwords from create-admin script)
router.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email dan password wajib diisi" });
            return;
        }

        // Find user
        const [foundUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (!foundUser) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        // Check admin role
        if (foundUser.role !== "admin") {
            res.status(403).json({ message: "Akun ini bukan admin" });
            return;
        }

        // Get account with password
        const [foundAccount] = await db
            .select()
            .from(account)
            .where(eq(account.userId, foundUser.id))
            .limit(1);

        if (!foundAccount || !foundAccount.password) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        // Verify scrypt password (format: salt:hash)
        const [salt, storedHash] = foundAccount.password.split(":");
        const isValid = await new Promise<boolean>((resolve, reject) => {
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString("hex") === storedHash);
            });
        });

        if (!isValid) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        // Return user data (session managed client-side)
        res.json({
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
            },
            token: "admin_" + foundUser.id,
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Login gagal" });
    }
});

// ===== STUDENT REGISTER =====
router.post("/api/student/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ message: "Password minimal 8 karakter" });
            return;
        }

        // Check if email already exists
        const [existing] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (existing) {
            res.status(409).json({ message: "Email sudah terdaftar. Silakan login." });
            return;
        }

        // Hash password with scrypt
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = await new Promise<string>((resolve, reject) => {
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString("hex"));
            });
        });
        const hashedPassword = `${salt}:${hash}`;

        // Create user
        const userId = crypto.randomUUID();
        await db.insert(user).values({
            id: userId,
            name,
            email,
            emailVerified: true,
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create account
        await db.insert(account).values({
            id: crypto.randomUUID(),
            userId,
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({
            message: "Akun berhasil dibuat",
            user: { id: userId, name, email },
        });
    } catch (error) {
        console.error("Student register error:", error);
        res.status(500).json({ message: "Gagal membuat akun" });
    }
});

// ===== STUDENT LOGIN =====
router.post("/api/student/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email dan password wajib diisi" });
            return;
        }

        const [foundUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (!foundUser) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        const [foundAccount] = await db
            .select()
            .from(account)
            .where(eq(account.userId, foundUser.id))
            .limit(1);

        if (!foundAccount || !foundAccount.password) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        // Verify scrypt password
        const [salt, storedHash] = foundAccount.password.split(":");
        const isValid = await new Promise<boolean>((resolve, reject) => {
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString("hex") === storedHash);
            });
        });

        if (!isValid) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }

        res.json({
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
            },
            token: "student_" + foundUser.id,
        });
    } catch (error) {
        console.error("Student login error:", error);
        res.status(500).json({ message: "Login gagal" });
    }
});

export default router;
