import { Router } from "express";
import { ContactsService } from "../services/contacts.service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const contactSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(100),
    subject: z.string().max(200).optional(),
    message: z.string().min(1).max(2000),
});

// ===== PUBLIC =====

router.post("/api/contacts", async (req, res) => {
    try {
        const validated = contactSchema.parse(req.body);
        const data = await ContactsService.create(validated);
        res.status(201).json({ message: "Pesan berhasil dikirim", data });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: error.errors });
            return;
        }
        res.status(500).json({ error: "Failed to send message" });
    }
});

// ===== ADMIN =====

router.get("/api/admin/contacts", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await ContactsService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
});

router.put("/api/admin/contacts/:id/read", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await ContactsService.markRead(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Contact not found" });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to update contact" });
    }
});

router.delete("/api/admin/contacts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const data = await ContactsService.delete(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: "Contact not found" });
            return;
        }
        res.json({ message: "Contact deleted", data });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete contact" });
    }
});

export default router;
