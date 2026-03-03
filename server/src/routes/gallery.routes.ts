import { Router } from "express";
import { GalleryService } from "../services/gallery.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { z } from "zod";

const router = Router();

// ===== PUBLIC =====

router.get("/api/gallery", async (_req, res) => {
    try {
        const data = await GalleryService.getActive();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch gallery" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/gallery", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await GalleryService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch gallery" });
    }
});

router.post(
    "/api/admin/gallery",
    requireAuth,
    requireAdmin,
    upload.single("image"),
    async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: "Image file is required" });
                return;
            }

            const body = z.object({
                title: z.string().min(1).max(100),
                category: z.string().max(30).optional(),
                sortOrder: z.coerce.number().int().optional(),
            }).parse(req.body);

            const data = await GalleryService.create({
                ...body,
                imageUrl: `/uploads/${file.filename}`,
            });

            res.status(201).json(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.errors });
                return;
            }
            res.status(500).json({ error: "Failed to create gallery item" });
        }
    }
);

router.put("/api/admin/gallery/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = z.object({
            title: z.string().min(1).max(100).optional(),
            category: z.string().max(30).optional(),
            sortOrder: z.number().int().optional(),
            isActive: z.boolean().optional(),
        }).parse(req.body);

        const data = await GalleryService.update(req.params.id as string, validated);
        if (!data) {
            res.status(404).json({ error: "Gallery item not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update gallery item" });
    }
});

router.delete("/api/admin/gallery/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await GalleryService.delete(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Gallery item not found" });
            return;
        }
        res.json({ message: "Gallery item deleted", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete gallery item" });
    }
});

export default router;
