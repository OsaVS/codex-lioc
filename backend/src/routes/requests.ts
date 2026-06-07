import express from "express";
import { createRefuelRequest } from "../services/refuelRequests.service.js";
import { refuelRequestSchema } from "../lib/schemas.js";
import { ZodError } from "zod";
import { requireAuth, requireManagerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/requests/refuel
router.post("/refuel", requireAuth, requireManagerOrAdmin, async (req, res) => {
    try {
        const parsed = refuelRequestSchema.parse(req.body);
        const refuelRequest = await createRefuelRequest(
            parsed.requestedDate,
            parsed.destinationStationId,
            parsed.typeId,
            parsed.requestedUserId
        );

        return res.status(201).json(refuelRequest);
    }
    catch (err: any) {
        console.error(err);
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                details: err.flatten(),
            });
        }
        if (
            err?.message?.includes("Filling station not found") ||
            err?.message?.includes("Fuel type not found") ||
            err?.message?.includes("User not found")
        ) {
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
