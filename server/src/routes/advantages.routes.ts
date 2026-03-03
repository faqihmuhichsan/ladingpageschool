import { Router } from "express";
import { AdvantagesService } from "../services/advantages.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const advantageSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1),
    icon: z.string().min(1).max(10),
    sortOrder: z.number().int().optional(),
});

// ===== PUBLIC =====

router.get("/api/advantages", async (_req, res) => {
    try {
        const data = await AdvantagesService.getActive();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch advantages" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/advantages", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await AdvantagesService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch advantages" });
    }
});

router.post("/api/admin/advantages", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = advantageSchema.parse(req.body);
        const data = await AdvantagesService.create(validated);
        res.status(201).json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to create advantage" });
    }
});

router.put("/api/admin/advantages/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = advantageSchema.partial().parse(req.body);
        const data = await AdvantagesService.update(req.params.id as string, validated);
        if (!data) {
            res.status(404).json({ error: "Advantage not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update advantage" });
    }
});

router.delete("/api/admin/advantages/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await AdvantagesService.delete(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Advantage not found" });
            return;
        }
        res.json({ message: "Advantage deleted", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete advantage" });
    }
});

export default router;
