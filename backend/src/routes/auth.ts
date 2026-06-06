import express from "express";
import { registerSchema, loginSchema } from "../lib/schemas.js";
import { registerUser, authenticateUser } from "../services/auth.service.js";
import { signSession, COOKIE_NAME, cookieOptions } from "../lib/auth.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { ZodError } from "zod";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await registerUser(parsed);
    const token = await signSession({ userId: user.id, username: user.username, role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ user });
  } catch (err: any) {
    console.error(err);

    // Zod validation error
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: err.flatten(),
      });
    }

    // Prisma / business logic conflict
    if (err?.message?.includes("already in use")) {
      return res.status(409).json({
        error: "CONFLICT",
        message: err.message,
      });
    }

    // Referenced resource not found (station / region)
    if (err?.message?.includes("Filling station not found")) {
      return res.status(404).json({ error: "FILLING_STATION_NOT_FOUND", message: err.message });
    }
    if (err?.message?.includes("Region not found")) {
      return res.status(404).json({ error: "REGION_NOT_FOUND", message: err.message });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await authenticateUser(parsed.usernameOrEmail, parsed.password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const token = await signSession({ userId: user.id, username: user.username, role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ user });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err?.message || "Invalid input" });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

export default router;
