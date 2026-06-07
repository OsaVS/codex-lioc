import express from "express";
import { addPumpReading } from "../services/pumps.service.js";
import { pumpReadingSchema } from "../lib/schemas.js";
import { ZodError } from "zod";
import { requireAuth, requireManagerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/pumps/:pumpId/readings
router.post("/:pumpId/readings", requireAuth, requireManagerOrAdmin, async (req, res) => {
    try {
        const pumpId = Number(req.params.pumpId);
        if (isNaN(pumpId)) {
            return res.status(400).json({ error: "Invalid pumpId" });
        }

        const parsed = pumpReadingSchema.parse(req.body);
        const result = await addPumpReading(
            pumpId,
            parsed.timestamp,
            parsed.readingValue
        );

        return res.json(result);
    }
    catch (err: any) {
        console.error(err);
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: err.flatten(),
            });
        }
        if (err?.message?.includes("Pump not found")) {
            return res.status(404).json({
                error: err.message,
            });
        }
        return res.status(500).json({
            error: err?.message || "INTERNAL_SERVER_ERROR",
        });
    }
});

export default router;
