import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import stationsRouter from "./routes/stations.js";
import tanksRouter from "./routes/tanks.js";
import pumpsRouter from "./routes/pumps.js";
import requestsRouter from "./routes/requests.js";
import { requireAuth } from "./middleware/authMiddleware.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/stations", stationsRouter);
app.use("/api/tanks", tanksRouter);
app.use("/api/pumps", pumpsRouter);
app.use("/api/requests", requestsRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Express + TypeScript!");
});

app.get("/protected", requireAuth, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
});

export default app;
