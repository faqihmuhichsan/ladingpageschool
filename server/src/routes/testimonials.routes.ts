import { Router } from "express";
import { TestimonialsService } from "../services/testimonials.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const testimonialSchema = z.object({
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(50),
    rating: z.number().int().min(1).max(5),
    message: z.string().min(1).max(1000),
    avatarColor: z.string().optional(),
});

// ===== PUBLIC =====

router.get("/api/testimonials", async (_req, res) => {
    try {
        const data = await TestimonialsService.getApproved();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch testimonials" });
    }
});

router.post("/api/testimonials", async (req, res) => {
    try {
        const validated = testimonialSchema.parse(req.body);
        const data = await TestimonialsService.create(validated);
        res.status(201).json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to create testimonial" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/testimonials", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await TestimonialsService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch testimonials" });
    }
});

router.put("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const validated = z.object({ isApproved: z.boolean() }).parse(req.body);
        const data = await TestimonialsService.update(req.params.id as string, validated);
        if (!data) {
            res.status(404).json({ error: "Testimonial not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update testimonial" });
    }
});

router.delete("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await TestimonialsService.delete(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Testimonial not found" });
            return;
        }
        res.json({ message: "Testimonial deleted", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete testimonial" });
    }
});

export default router;
