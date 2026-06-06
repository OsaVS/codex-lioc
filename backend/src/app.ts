import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/authMiddleware.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Express + TypeScript!");
});

app.get("/protected", requireAuth, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
});

export default app;
