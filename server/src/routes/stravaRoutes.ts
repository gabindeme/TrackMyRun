import express, { Router } from "express";
import {
    connectStrava,
    stravaCallback,
    disconnectStrava,
    getStravaStatus,
    syncActivities,
} from "../controllers/stravaController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const stravaRouter: Router = express.Router();

/**
 * @route GET /api/strava/connect
 * @description Initiate Strava OAuth flow - returns authorization URL
 * @access Private (requires authentication)
 */
stravaRouter.get("/connect", verifyToken(), connectStrava);

/**
 * @route GET /api/strava/callback
 * @description Handle Strava OAuth callback - exchanges code for tokens
 * @access Public (callback from Strava)
 */
stravaRouter.get("/callback", stravaCallback);

/**
 * @route POST /api/strava/disconnect
 * @description Disconnect Strava account from user
 * @access Private (requires authentication)
 */
stravaRouter.post("/disconnect", verifyToken(), disconnectStrava);

/**
 * @route GET /api/strava/status
 * @description Get Strava connection status for current user
 * @access Private (requires authentication)
 */
stravaRouter.get("/status", verifyToken(), getStravaStatus);

/**
 * @route POST /api/strava/sync
 * @description Manually sync activities from Strava
 * @access Private (requires authentication)
 */
stravaRouter.post("/sync", verifyToken(), syncActivities);
