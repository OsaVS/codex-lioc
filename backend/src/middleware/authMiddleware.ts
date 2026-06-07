import type { Request, Response, NextFunction } from "express";
import { verifySession, COOKIE_NAME } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const payload = await verifySession(token);
    const userId = payload?.sub ? Number(payload.sub) : payload?.userId;
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { id: true, username: true, email: true, role: true } });
    if (!user) return res.status(401).json({ error: "User not found" });

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("auth middleware error", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role !== "MANAGER" && user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

