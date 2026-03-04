import { Router } from "express";
import { usersService } from "../services/users.service.js";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../middleware/auth.middleware.js";
import crypto from "crypto";

const router = Router();

// Admin: get all admin users
router.get("/api/admin/users/admins", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await usersService.getAdmins();
        res.json(data);
    } catch (error) {
        console.error("Get admins error:", error);
        res.status(500).json({ error: "Failed to get admins" });
    }
});

// Admin: get all students
router.get("/api/admin/users/students", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const data = await usersService.getStudents();
        res.json(data);
    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({ error: "Failed to get students" });
    }
});

// SuperAdmin: create new admin
router.post("/api/admin/users", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ error: "Nama, email, password, dan role wajib diisi" });
            return;
        }
        if (!["admin", "editor", "superadmin"].includes(role)) {
            res.status(400).json({ error: "Role tidak valid" });
            return;
        }
        const user = await usersService.createAdmin({ name, email, password, role });
        res.status(201).json(user);
    } catch (error: any) {
        console.error("Create admin error:", error);
        res.status(400).json({ error: error.message || "Failed to create admin" });
    }
});

// SuperAdmin: update user role
router.put("/api/admin/users/:id/role", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!["admin", "editor", "superadmin", "user"].includes(role)) {
            res.status(400).json({ error: "Role tidak valid" });
            return;
        }
        // Prevent changing own role
        const currentUser = (req as any).user;
        if (currentUser.id === req.params.id) {
            res.status(400).json({ error: "Tidak bisa mengubah role sendiri" });
            return;
        }
        const updated = await usersService.updateRole(req.params.id as string, role);
        res.json(updated);
    } catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({ error: "Failed to update role" });
    }
});

// SuperAdmin: delete admin user
router.delete("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        if (currentUser.id === req.params.id) {
            res.status(400).json({ error: "Tidak bisa menghapus akun sendiri" });
            return;
        }
        await usersService.deleteUser(req.params.id as string);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Student: update own profile
router.put("/api/student/profile", requireAuth, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { name, email } = req.body;
        const updated = await usersService.updateProfile(currentUser.id, { name, email });
        res.json(updated);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Gagal update profil" });
    }
});

// Student: change own password
router.put("/api/student/password", requireAuth, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            res.status(400).json({ error: "Password minimal 8 karakter" });
            return;
        }
        await usersService.changePassword(currentUser.id, newPassword);
        res.json({ success: true, message: "Password berhasil diubah" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: "Gagal ubah password" });
    }
});

export default router;
