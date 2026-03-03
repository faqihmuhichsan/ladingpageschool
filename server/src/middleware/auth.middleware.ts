import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Middleware to require authentication.
 * Attaches `req.user` and `req.session` if authenticated.
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Attach session data to request
        (req as any).user = session.user;
        (req as any).session = session.session;

        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}

/**
 * Middleware to require admin role.
 * Must be used AFTER requireAuth.
 */
export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = (req as any).user;

    if (!user || user.role !== "admin") {
        res.status(403).json({ error: "Forbidden: Admin access required" });
        return;
    }

    next();
}
