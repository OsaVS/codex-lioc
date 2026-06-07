import express from "express";
import { getStationTanks } from "../services/stations.service.js";


const router = express.Router();

// Mounted at /api/stations
// GET /api/stations/:stationId/tanks
router.get("/:stationId/tanks", async (req, res) => {
    try {
        const stationId = Number(req.params.stationId);
        const tanks = await getStationTanks(stationId);
        return res.json(tanks);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            error: err?.message || "INTERNAL_SERVER_ERROR",
        });
    }
});

export default router;