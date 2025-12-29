import express, { Router } from "express";
import {
    getGear,
    syncGear,
    getGearStats,
    updateGear,
} from "../controllers/gearController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const gearRouter: Router = express.Router();

/**
 * @route GET /api/gear
 * @description Get all user's gear
 * @access Private
 */
gearRouter.get("/", verifyToken(), getGear);

/**
 * @route POST /api/gear/sync
 * @description Sync gear from activities
 * @access Private
 */
gearRouter.post("/sync", verifyToken(), syncGear);

/**
 * @route GET /api/gear/stats
 * @description Get gear statistics summary
 * @access Private
 */
gearRouter.get("/stats", verifyToken(), getGearStats);

/**
 * @route PATCH /api/gear/:id
 * @description Update gear details (name, alert threshold, retired status)
 * @access Private
 */
gearRouter.patch("/:id", verifyToken(), updateGear);
