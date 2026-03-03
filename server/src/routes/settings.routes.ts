import { Router } from "express";
import { SettingsService } from "../services/settings.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

// ===== PUBLIC =====

router.get("/api/settings", async (_req, res) => {
    try {
        const data = await SettingsService.getAll();
        // Transform array to key-value object for frontend convenience
        const settings: Record<string, { value: string; label: string | null }> = {};
        for (const item of data) {
            settings[item.key] = { value: item.value, label: item.label };
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

// ===== ADMIN =====

router.put("/api/admin/settings/:key", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { value, label } = z.object({
            value: z.string().min(1),
            label: z.string().optional(),
        }).parse(req.body);

        const data = await SettingsService.upsert(req.params.key as string, value, label);
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update setting" });
    }
});

export default router;
