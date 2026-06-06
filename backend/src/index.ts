import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Express + TypeScript!");
});

app.get("/protected", requireAuth, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});