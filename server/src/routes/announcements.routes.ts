import { Router } from "express";
import { announcementsService } from "../services/announcements.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public: get published announcements
router.get("/api/announcements", async (_req, res) => {
    try {
        const data = await announcementsService.getPublished();
        res.json(data);
    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({ error: "Failed to get announcements" });
    }
});

// Admin: get all announcements
router.get("/api/admin/announcements", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await announcementsService.getAll();
        res.json(data);
    } catch (error) {
        console.error("Get all announcements error:", error);
        res.status(500).json({ error: "Failed to get announcements" });
    }
});

// Admin: create announcement
router.post("/api/admin/announcements", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, content, category, priority, isPublished, imageUrl } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: "Title and content are required" });
            return;
        }
        const authorId = (req as any).user?.id;
        const item = await announcementsService.create({
            title,
            content,
            category,
            priority,
            authorId,
            isPublished,
            imageUrl,
        });
        res.status(201).json(item);
    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({ error: "Failed to create announcement" });
    }
});

// Admin: update announcement
router.put("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const item = await announcementsService.update(req.params.id as string, req.body);
        res.json(item);
    } catch (error) {
        console.error("Update announcement error:", error);
        res.status(500).json({ error: "Failed to update announcement" });
    }
});

// Admin: delete announcement
router.delete("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        await announcementsService.delete(req.params.id as string);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ error: "Failed to delete announcement" });
    }
});

export default router;
