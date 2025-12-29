import express, { Router } from "express";
import {
    syncActivities,
    getActivities,
    getSummary,
    getTrends,
    getPersonalBests,
    getYearInSport,
    getRollingStats,
    getPaceAnalysis,
    getConsistency,
    getTrainingLoad,
    getKudosAnalysis,
    getHRZones,
    getLocations,
    getComparisons,
} from "../controllers/activitiesController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const activitiesRouter: Router = express.Router();

/**
 * @route POST /api/activities/sync
 * @description Sync activities from Strava to database
 * @access Private (requires authentication)
 */
activitiesRouter.post("/sync", verifyToken(), syncActivities);

/**
 * @route GET /api/activities
 * @description Get user's activities with pagination and filtering
 * @query page, limit, sport_type, year, month
 * @access Private (requires authentication)
 */
activitiesRouter.get("/", verifyToken(), getActivities);

/**
 * @route GET /api/activities/summary
 * @description Get aggregated summary statistics
 * @query period (week/month/year/all), year, sport_type
 * @access Private (requires authentication)
 */
activitiesRouter.get("/summary", verifyToken(), getSummary);

/**
 * @route GET /api/activities/trends
 * @description Get performance trends over time
 * @query period (week/month), sport_type
 * @access Private (requires authentication)
 */
activitiesRouter.get("/trends", verifyToken(), getTrends);

/**
 * @route GET /api/activities/personal-bests
 * @description Get user's personal best activities
 * @query sport_type
 * @access Private (requires authentication)
 */
activitiesRouter.get("/personal-bests", verifyToken(), getPersonalBests);

/**
 * @route GET /api/activities/year-in-sport/:year
 * @description Get Year in Sport summary data
 * @param year - Year to get summary for (defaults to current year)
 * @access Private (requires authentication)
 */
activitiesRouter.get("/year-in-sport", verifyToken(), getYearInSport);
activitiesRouter.get("/year-in-sport/:year", verifyToken(), getYearInSport);

// =====================================================
// ADVANCED ANALYTICS ENDPOINTS
// =====================================================

activitiesRouter.get("/rolling-stats", verifyToken(), getRollingStats);
activitiesRouter.get("/pace-analysis", verifyToken(), getPaceAnalysis);
activitiesRouter.get("/consistency", verifyToken(), getConsistency);
activitiesRouter.get("/training-load", verifyToken(), getTrainingLoad);
activitiesRouter.get("/kudos-analysis", verifyToken(), getKudosAnalysis);

/**
 * @route GET /api/activities/hr-zones
 * @description Get heart rate zones analysis
 * @query year, maxHR
 */
activitiesRouter.get("/hr-zones", verifyToken(), getHRZones);

/**
 * @route GET /api/activities/locations
 * @description Get geographic analytics (heatmap data, locations)
 * @query year
 */
activitiesRouter.get("/locations", verifyToken(), getLocations);

/**
 * @route GET /api/activities/comparisons
 * @description Get year-over-year comparisons
 */
activitiesRouter.get("/comparisons", verifyToken(), getComparisons);
