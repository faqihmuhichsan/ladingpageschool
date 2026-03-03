import { Router } from "express";
import { ProgramsService } from "../services/programs.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const programSchema = z.object({
    title: z.string().min(1).max(100),
    level: z.enum(["tk", "sd", "smp", "sma"]),
    levelLabel: z.string().min(1).max(50),
    description: z.string().min(1),
    imageUrl: z.string().optional(),
    features: z.array(z.string()).optional(),
    sortOrder: z.number().int().optional(),
});

// ===== PUBLIC =====

router.get("/api/programs", async (_req, res) => {
    try {
        const data = await ProgramsService.getActive();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch programs" });
    }
});

router.get("/api/programs/:id", async (req, res) => {
    try {
        const data = await ProgramsService.getById(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Program not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch program" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/programs", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await ProgramsService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch programs" });
    }
});

router.post("/api/admin/programs", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = programSchema.parse(req.body);
        const data = await ProgramsService.create(validated);
        res.status(201).json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to create program" });
    }
});

router.put("/api/admin/programs/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = programSchema.partial().parse(req.body);
        const data = await ProgramsService.update(req.params.id as string, validated);
        if (!data) {
            res.status(404).json({ error: "Program not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update program" });
    }
});

router.delete("/api/admin/programs/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await ProgramsService.delete(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Program not found" });
            return;
        }
        res.json({ message: "Program deleted", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete program" });
    }
});

export default router;
