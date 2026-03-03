import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth.js";

const router = Router();

// Mount Better Auth handler on /api/auth/*
router.all("/api/auth/*splat", toNodeHandler(auth));

export default router;
