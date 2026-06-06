import express from "express";
import { tankHistory } from "../services/tanks.service.js";

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

export default router;