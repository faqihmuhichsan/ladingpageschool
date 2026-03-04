import { Router } from "express";
import { eventsService } from "../services/events.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public: get upcoming events
router.get("/api/events", async (_req, res) => {
    try {
        const data = await eventsService.getUpcoming();
        res.json(data);
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ error: "Failed to get events" });
    }
});

// Admin: get all events
router.get("/api/admin/events", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await eventsService.getAll();
        res.json(data);
    } catch (error) {
        console.error("Get all events error:", error);
        res.status(500).json({ error: "Failed to get events" });
    }
});

// Admin: create event
router.post("/api/admin/events", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, description, eventDate, eventTime, location, category, imageUrl } = req.body;
        if (!title || !eventDate) {
            res.status(400).json({ error: "Title and event date are required" });
            return;
        }
        const item = await eventsService.create({
            title,
            description,
            eventDate: new Date(eventDate),
            eventTime,
            location,
            category,
            imageUrl,
        });
        res.status(201).json(item);
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// Admin: update event
router.put("/api/admin/events/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.eventDate) data.eventDate = new Date(data.eventDate);
        const item = await eventsService.update(req.params.id as string, data);
        res.json(item);
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
});

// Admin: delete event
router.delete("/api/admin/events/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        await eventsService.delete(req.params.id as string);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

export default router;
