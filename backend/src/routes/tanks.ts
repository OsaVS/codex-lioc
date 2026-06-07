import express from "express";
import { tankHistory, createManualMeasurement } from "../services/tanks.service.js";
import { manualMeasurementSchema } from "../lib/schemas.js";
import { ZodError } from "zod";
import { requireAuth, requireManagerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/tanks/:tankId/history?days=7
router.get("/:tankId/history", async (req, res) => {
    try {
        const tankId = Number(req.params.tankId);
        const days = req.query.days ? Number(req.query.days) : 7;
        const history = await tankHistory(tankId, days);
        console.log(`Returning history for tank ${tankId} over last ${days} days:`, history);
        return res.json(history);
    }
    catch (err: any) {
        console.error(err);
        return res.status(500).json({
            error: err?.message || "INTERNAL_SERVER_ERROR",
        });
    }
});

// POST /api/tanks/:tankId/measurements/manual
router.post("/:tankId/measurements/manual", requireAuth, requireManagerOrAdmin, async (req, res) => {
    try {

        const tankId = Number(req.params.tankId);
        if (isNaN(tankId)) {
            return res.status(400).json({ error: "Invalid tankId" });
        }

        const parsed = manualMeasurementSchema.parse(req.body);
        const result = await createManualMeasurement(
            tankId,
            parsed.measuredTime,
            parsed.measurement,
            parsed.userId
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
        if (err?.message?.includes("Tank not found") || err?.message?.includes("User not found")) {
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
