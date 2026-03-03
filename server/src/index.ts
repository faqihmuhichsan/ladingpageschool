import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { mountRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ===== MIDDLEWARE =====

// CORS — allow frontend to access API
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5500",
        credentials: true,
    })
);

// Parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

// Serve frontend static files (optional — if serving from same origin)
app.use(express.static(path.resolve(__dirname, "../../")));

// ===== ROUTES =====
mountRoutes(app);

// ===== HEALTH CHECK =====
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ===== ERROR HANDLER =====
app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error("Unhandled error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
);

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   PKBM Bintang Literasi — API Server    ║
  ║                                          ║
  ║   🚀 Running on port ${PORT}              ║
  ║   📍 http://localhost:${PORT}              ║
  ║   🔑 Auth: /api/auth/*                  ║
  ║   📚 API:  /api/*                        ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
