import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth";
import { eq } from "drizzle-orm";

/**
 * Middleware to require authentication.
 * Supports:
 * 1. Better Auth sessions (via cookies)
 * 2. Custom admin tokens (via Authorization header: Bearer admin_<userId>)
 * 3. Custom student tokens (via Authorization header: Bearer student_<userId>)
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Method 1: Check for custom token (admin_ or student_)
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer admin_") || authHeader?.startsWith("Bearer student_")) {
            const userId = authHeader.replace("Bearer admin_", "").replace("Bearer student_", "");
            const [foundUser] = await db
                .select()
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);

            if (foundUser) {
                (req as any).user = foundUser;
                next();
                return;
            }
        }

        // Method 2: Better Auth session (via cookies)
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        (req as any).user = session.user;
        (req as any).session = session.session;

        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}

/**
 * Middleware to require admin role (admin or superadmin).
 * Must be used AFTER requireAuth.
 */
export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = (req as any).user;

    if (!user || !["admin", "superadmin"].includes(user.role)) {
        res.status(403).json({ error: "Forbidden: Admin access required" });
        return;
    }

    next();
}

/**
 * Middleware to require superadmin role.
 * Must be used AFTER requireAuth.
 */
export async function requireSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = (req as any).user;

    if (!user || user.role !== "superadmin") {
        res.status(403).json({ error: "Forbidden: Super Admin access required" });
        return;
    }

    next();
}

