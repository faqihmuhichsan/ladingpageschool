import { Router } from "express";
import { RegistrationsService } from "../services/registrations.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const registrationSchema = z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email().max(100),
    phone: z.string().min(1).max(20),
    program: z.string().min(1).max(20),
    message: z.string().max(500).optional(),
});

// ===== PUBLIC =====

router.post("/api/registrations", async (req, res) => {
    try {
        const validated = registrationSchema.parse(req.body);
        const data = await RegistrationsService.create(validated);
        res.status(201).json({ message: "Pendaftaran berhasil dikirim", data });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to submit registration" });
    }
});

// Check registration status by email (for student portal)
router.get("/api/registrations/check", async (req, res) => {
    try {
        const email = req.query.email as string;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }
        const data = await RegistrationsService.getByEmail(email);
        if (!data) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to check registration" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/registrations", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await RegistrationsService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch registrations" });
    }
});

router.put("/api/admin/registrations/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status } = z.object({
            status: z.enum(["new", "contacted", "enrolled", "rejected"]),
        }).parse(req.body);

        const data = await RegistrationsService.updateStatus(req.params.id as string, status);
        if (!data) {
            res.status(404).json({ error: "Registration not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to update registration" });
    }
});

export default router;
