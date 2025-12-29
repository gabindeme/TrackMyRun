import { Request, Response } from "express";
import { Activity } from "../models/activityModel.js";
import { User } from "../models/userModel.js";
import { getValidAccessToken, getAthleteActivities, StravaActivity } from "../utils/stravaClient.js";
import mongoose from "mongoose";

/**
 * Transform Strava activity to our Activity model format
 */
function transformStravaActivity(stravaActivity: StravaActivity, userId: mongoose.Types.ObjectId) {
    return {
        user: userId,
        strava_id: stravaActivity.id,
        sport_type: stravaActivity.sport_type,
        name: stravaActivity.name,
        distance: stravaActivity.distance,
        moving_time: stravaActivity.moving_time,
        elapsed_time: stravaActivity.elapsed_time,
        total_elevation_gain: stravaActivity.total_elevation_gain,
        start_date: new Date(stravaActivity.start_date),
        start_date_local: new Date(stravaActivity.start_date_local),
        timezone: stravaActivity.timezone,

        // Speed
        average_speed: stravaActivity.average_speed,
        max_speed: stravaActivity.max_speed,

        // Heart Rate
        average_heartrate: stravaActivity.average_heartrate,
        max_heartrate: stravaActivity.max_heartrate,
        has_heartrate: stravaActivity.has_heartrate,

        // Cadence
        average_cadence: stravaActivity.average_cadence,

        // Social
        kudos_count: stravaActivity.kudos_count || 0,
        achievement_count: stravaActivity.achievement_count || 0,

        // Training Load
        suffer_score: stravaActivity.suffer_score,
        calories: stravaActivity.calories,

        // Gear
        gear_id: stravaActivity.gear_id,

        // Location
        start_latlng: stravaActivity.start_latlng,
        end_latlng: stravaActivity.end_latlng,

        // Metadata
        manual: stravaActivity.manual || false,
        visibility: stravaActivity.visibility || "everyone",
    };
}

/**
 * Sync activities from Strava and store in database
 * POST /api/activities/sync
 */
export const syncActivities = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const fullUser = await User.findById(userId).select("+strava_access_token +strava_refresh_token strava_connected strava_token_expires_at");
        if (!fullUser?.strava_connected) {
            return res.status(400).json({ error: "User is not connected to Strava" });
        }

        const accessToken = await getValidAccessToken(fullUser);

        // Fetch all activities (paginate through)
        let page = 1;
        let allActivities: StravaActivity[] = [];
        let hasMore = true;

        while (hasMore) {
            const activities = await getAthleteActivities(accessToken, { page, perPage: 100 });
            if (activities.length === 0) {
                hasMore = false;
            } else {
                allActivities = [...allActivities, ...activities];
                page++;
                // Limit to 1000 activities for MVP
                if (allActivities.length >= 1000) hasMore = false;
            }
        }

        // Upsert activities (update if exists, insert if new)
        let synced = 0;
        let updated = 0;

        for (const stravaActivity of allActivities) {
            const activityData = transformStravaActivity(stravaActivity, userId);
            const result = await Activity.findOneAndUpdate(
                { strava_id: stravaActivity.id },
                activityData,
                { upsert: true, new: true }
            );
            if (result.createdAt === result.updatedAt) {
                synced++;
            } else {
                updated++;
            }
        }

        res.json({
            message: "Activities synced successfully",
            synced,
            updated,
            total: allActivities.length,
        });
    } catch (error) {
        console.error("Error syncing activities:", error);
        res.status(500).json({ error: "Failed to sync activities" });
    }
};

/**
 * Get activities with pagination and filtering
 * GET /api/activities
 */
export const getActivities = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, sport_type, year, month } = req.query;

        const query: Record<string, unknown> = { user: userId };

        if (sport_type) {
            query.sport_type = sport_type;
        }

        if (year) {
            const yearNum = parseInt(year as string);
            query.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        if (month && year) {
            const yearNum = parseInt(year as string);
            const monthNum = parseInt(month as string) - 1;
            query.start_date = {
                $gte: new Date(yearNum, monthNum, 1),
                $lt: new Date(yearNum, monthNum + 1, 1),
            };
        }

        const activities = await Activity.find(query)
            .sort({ start_date: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Activity.countDocuments(query);

        res.json({
            activities,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Error getting activities:", error);
        res.status(500).json({ error: "Failed to get activities" });
    }
};

/**
 * Get summary statistics
 * GET /api/activities/summary
 */
export const getSummary = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { period = "all", year, sport_type } = req.query;

        const matchStage: Record<string, unknown> = { user: new mongoose.Types.ObjectId(userId?.toString()) };

        if (sport_type) {
            matchStage.sport_type = sport_type;
        }

        // Set date range based on period
        const now = new Date();
        if (period === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchStage.start_date = { $gte: weekAgo };
        } else if (period === "month") {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchStage.start_date = { $gte: monthAgo };
        } else if (period === "year" || year) {
            const yearNum = year ? parseInt(year as string) : now.getFullYear();
            matchStage.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        const summary = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total_distance: { $sum: "$distance" },
                    total_time: { $sum: "$moving_time" },
                    total_elevation: { $sum: "$total_elevation_gain" },
                    total_activities: { $sum: 1 },
                    avg_distance: { $avg: "$distance" },
                    avg_time: { $avg: "$moving_time" },
                    avg_speed: { $avg: "$average_speed" },
                    avg_heartrate: { $avg: "$average_heartrate" },
                    max_distance: { $max: "$distance" },
                    max_speed: { $max: "$max_speed" },
                },
            },
        ]);

        // Get breakdown by sport type
        const sportBreakdown = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$sport_type",
                    count: { $sum: 1 },
                    distance: { $sum: "$distance" },
                    time: { $sum: "$moving_time" },
                },
            },
            { $sort: { count: -1 } },
        ]);

        res.json({
            summary: summary[0] || {
                total_distance: 0,
                total_time: 0,
                total_elevation: 0,
                total_activities: 0,
            },
            sportBreakdown,
        });
    } catch (error) {
        console.error("Error getting summary:", error);
        res.status(500).json({ error: "Failed to get summary" });
    }
};

/**
 * Get performance trends over time
 * GET /api/activities/trends
 */
export const getTrends = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { period = "month", sport_type } = req.query;

        const matchStage: Record<string, unknown> = { user: new mongoose.Types.ObjectId(userId?.toString()) };
        if (sport_type) matchStage.sport_type = sport_type;

        // Group by week or month
        const groupBy = period === "week"
            ? { year: { $year: "$start_date" }, week: { $week: "$start_date" } }
            : { year: { $year: "$start_date" }, month: { $month: "$start_date" } };

        const trends = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupBy,
                    distance: { $sum: "$distance" },
                    time: { $sum: "$moving_time" },
                    activities: { $sum: 1 },
                    avg_pace: { $avg: "$pace" },
                    avg_heartrate: { $avg: "$average_heartrate" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
        ]);

        res.json({ trends });
    } catch (error) {
        console.error("Error getting trends:", error);
        res.status(500).json({ error: "Failed to get trends" });
    }
};

/**
 * Get personal bests
 * GET /api/activities/personal-bests
 */
export const getPersonalBests = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { sport_type } = req.query;

        const matchStage: Record<string, unknown> = { user: new mongoose.Types.ObjectId(userId?.toString()) };
        if (sport_type) matchStage.sport_type = sport_type;

        // Longest activity by distance
        const longestDistance = await Activity.findOne(matchStage)
            .sort({ distance: -1 })
            .limit(1);

        // Longest activity by time
        const longestTime = await Activity.findOne(matchStage)
            .sort({ moving_time: -1 })
            .limit(1);

        // Fastest pace (running activities only)
        const fastestPace = await Activity.findOne({
            ...matchStage,
            sport_type: { $regex: /run/i },
            pace: { $exists: true, $gt: 0 },
        })
            .sort({ pace: 1 })
            .limit(1);

        // Highest elevation
        const highestElevation = await Activity.findOne(matchStage)
            .sort({ total_elevation_gain: -1 })
            .limit(1);

        // Most kudos
        const mostKudos = await Activity.findOne(matchStage)
            .sort({ kudos_count: -1 })
            .limit(1);

        res.json({
            longestDistance,
            longestTime,
            fastestPace,
            highestElevation,
            mostKudos,
        });
    } catch (error) {
        console.error("Error getting personal bests:", error);
        res.status(500).json({ error: "Failed to get personal bests" });
    }
};

/**
 * Get Year in Sport data
 * GET /api/activities/year-in-sport/:year
 */
export const getYearInSport = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const year = parseInt(req.params.year) || new Date().getFullYear();

        const matchStage = {
            user: new mongoose.Types.ObjectId(userId?.toString()),
            start_date: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1),
            },
        };

        // Overall stats
        const overall = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total_distance: { $sum: "$distance" },
                    total_time: { $sum: "$moving_time" },
                    total_elevation: { $sum: "$total_elevation_gain" },
                    total_activities: { $sum: 1 },
                    total_kudos: { $sum: "$kudos_count" },
                },
            },
        ]);

        // Most active month
        const monthlyStats = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $month: "$start_date" },
                    activities: { $sum: 1 },
                    distance: { $sum: "$distance" },
                },
            },
            { $sort: { activities: -1 } },
        ]);

        // Most active day of week
        const dayOfWeekStats = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dayOfWeek: "$start_date" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const dayNames = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Sport breakdown
        const sportBreakdown = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$sport_type",
                    count: { $sum: 1 },
                    distance: { $sum: "$distance" },
                    time: { $sum: "$moving_time" },
                },
            },
            { $sort: { distance: -1 } },
        ]);

        // Longest activity
        const longestActivity = await Activity.findOne(matchStage)
            .sort({ distance: -1 })
            .limit(1);

        // Fastest pace (running)
        const fastestPace = await Activity.findOne({
            ...matchStage,
            sport_type: { $regex: /run/i },
            pace: { $gt: 0 },
        })
            .sort({ pace: 1 })
            .limit(1);

        // Fun insights
        const totalKm = (overall[0]?.total_distance || 0) / 1000;
        const funInsights = [];

        if (totalKm > 0) {
            // Distance comparisons
            if (totalKm >= 42.195) {
                const marathons = Math.floor(totalKm / 42.195);
                funInsights.push(`You ran the equivalent of ${marathons} marathon${marathons > 1 ? "s" : ""}! 🏃`);
            }
            if (totalKm >= 10) {
                funInsights.push(`That's ${Math.floor(totalKm / 10)} trips around a running track! 🏟️`);
            }
            // Time insights
            const totalHours = (overall[0]?.total_time || 0) / 3600;
            if (totalHours >= 24) {
                funInsights.push(`You spent ${Math.floor(totalHours / 24)} full days exercising! ⏱️`);
            }
        }

        res.json({
            year,
            overall: overall[0] || { total_distance: 0, total_time: 0, total_elevation: 0, total_activities: 0 },
            mostActiveMonth: monthlyStats[0] ? { month: monthlyStats[0]._id } : null,
            favoriteDay: dayOfWeekStats[0] ? dayNames[dayOfWeekStats[0]._id] : null,
            sportBreakdown,
            longestActivity,
            fastestPace,
            funInsights,
        });
    } catch (error) {
        console.error("Error getting year in sport:", error);
        res.status(500).json({ error: "Failed to get year in sport data" });
    }
};

/**
 * Get rolling stats (7/30/90 days)
 * GET /api/activities/rolling-stats
 */
export const getRollingStats = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const now = new Date();

        const calculateStats = async (days: number) => {
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const stats = await Activity.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId?.toString()),
                        start_date: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_distance: { $sum: "$distance" },
                        total_time: { $sum: "$moving_time" },
                        total_elevation: { $sum: "$total_elevation_gain" },
                        total_activities: { $sum: 1 },
                        avg_pace: { $avg: "$pace" },
                        avg_heartrate: { $avg: "$average_heartrate" },
                        total_kudos: { $sum: "$kudos_count" },
                        total_training_load: { $sum: "$training_load_score" },
                    }
                }
            ]);
            return stats[0] || {
                total_distance: 0,
                total_time: 0,
                total_elevation: 0,
                total_activities: 0,
                avg_pace: 0,
                avg_heartrate: 0,
                total_kudos: 0,
                total_training_load: 0,
            };
        };

        const [week, month, quarter] = await Promise.all([
            calculateStats(7),
            calculateStats(30),
            calculateStats(90),
        ]);

        res.json({
            rolling_7_days: week,
            rolling_30_days: month,
            rolling_90_days: quarter,
        });
    } catch (error) {
        console.error("Error getting rolling stats:", error);
        res.status(500).json({ error: "Failed to get rolling stats" });
    }
};

/**
 * Get pace analysis
 * GET /api/activities/pace-analysis
 */
export const getPaceAnalysis = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { year } = req.query;

        const matchStage: Record<string, unknown> = {
            user: new mongoose.Types.ObjectId(userId?.toString()),
            pace: { $exists: true, $gt: 0 },
            sport_type: { $regex: /run/i },
        };

        if (year) {
            const yearNum = parseInt(year as string);
            matchStage.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        // Pace distribution (buckets)
        const distribution = await Activity.aggregate([
            { $match: matchStage },
            {
                $bucket: {
                    groupBy: "$pace",
                    boundaries: [0, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10, 12, 15],
                    default: "15+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Pace trend over time (monthly averages)
        const trend = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$start_date" },
                        month: { $month: "$start_date" },
                    },
                    avg_pace: { $avg: "$pace" },
                    best_pace: { $min: "$pace" },
                    activities: { $sum: 1 },
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Best paces
        const bestPace = await Activity.findOne(matchStage)
            .sort({ pace: 1 })
            .limit(1);

        // Average pace
        const avgStats = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    avg_pace: { $avg: "$pace" },
                    median_pace: { $avg: "$pace" }, // Simplified - actual median requires sorting
                    total_runs: { $sum: 1 },
                }
            }
        ]);

        res.json({
            distribution,
            trend,
            bestPace,
            averageStats: avgStats[0] || { avg_pace: 0, median_pace: 0, total_runs: 0 },
        });
    } catch (error) {
        console.error("Error getting pace analysis:", error);
        res.status(500).json({ error: "Failed to get pace analysis" });
    }
};

/**
 * Get consistency stats (streaks, consistency score)
 * GET /api/activities/consistency
 */
export const getConsistency = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);

        // Get all weeks with activities this year
        const weeklyActivities = await Activity.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId?.toString()),
                    start_date: { $gte: yearStart },
                }
            },
            {
                $group: {
                    _id: "$consistency_week",
                    activities: { $sum: 1 },
                    distance: { $sum: "$distance" },
                }
            },
            { $sort: { _id: 1 } },
        ]);

        // Calculate weeks with activity
        const weeksWithActivity = weeklyActivities.length;

        // Calculate total weeks in year so far
        const weeksSoFar = Math.ceil((now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

        // Consistency score (0-100)
        const consistencyScore = Math.min(100, Math.round((weeksWithActivity / weeksSoFar) * 100));

        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const currentWeek = now.getFullYear() * 100 + Math.ceil(((now.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);

        // Convert to set for easy lookup
        const activeWeeks = new Set(weeklyActivities.map(w => w._id));

        // Count current streak (from current week backwards)
        for (let week = currentWeek; week >= currentWeek - 52; week--) {
            if (activeWeeks.has(week)) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Find longest streak
        const sortedWeeks = Array.from(activeWeeks).sort();
        for (let i = 0; i < sortedWeeks.length; i++) {
            if (i === 0 || sortedWeeks[i] === sortedWeeks[i - 1] + 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        res.json({
            consistencyScore,
            weeksWithActivity,
            weeksSoFar,
            currentStreak,
            longestStreak,
            weeklyBreakdown: weeklyActivities,
        });
    } catch (error) {
        console.error("Error getting consistency:", error);
        res.status(500).json({ error: "Failed to get consistency data" });
    }
};

/**
 * Get training load analysis (ACWR)
 * GET /api/activities/training-load
 */
export const getTrainingLoad = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const now = new Date();

        // Calculate weekly load for past 8 weeks
        const weeklyLoads = await Activity.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId?.toString()),
                    start_date: { $gte: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000) },
                }
            },
            {
                $group: {
                    _id: { $week: "$start_date" },
                    total_load: { $sum: "$training_load_score" },
                    total_distance: { $sum: "$distance" },
                    total_time: { $sum: "$moving_time" },
                    activities: { $sum: 1 },
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 8 },
        ]);

        // Calculate acute load (last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const acuteResult = await Activity.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId?.toString()),
                    start_date: { $gte: sevenDaysAgo },
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$training_load_score" },
                }
            }
        ]);
        const acuteLoad = acuteResult[0]?.total || 0;

        // Calculate chronic load (last 28 days average weekly)
        const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        const chronicResult = await Activity.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId?.toString()),
                    start_date: { $gte: twentyEightDaysAgo },
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$training_load_score" },
                }
            }
        ]);
        const chronicLoad = (chronicResult[0]?.total || 0) / 4; // Average weekly

        // Calculate ACWR (Acute:Chronic Workload Ratio)
        const acwr = chronicLoad > 0 ? (acuteLoad / chronicLoad).toFixed(2) : 0;

        // Determine training status
        let trainingStatus = "optimal";
        const acwrNum = parseFloat(acwr as string);
        if (acwrNum < 0.8) trainingStatus = "undertrained";
        else if (acwrNum > 1.5) trainingStatus = "high_risk";
        else if (acwrNum > 1.3) trainingStatus = "elevated";

        res.json({
            acuteLoad,
            chronicLoad: Math.round(chronicLoad),
            acwr,
            trainingStatus,
            weeklyLoads: weeklyLoads.reverse(),
        });
    } catch (error) {
        console.error("Error getting training load:", error);
        res.status(500).json({ error: "Failed to get training load data" });
    }
};

/**
 * Get kudos analytics
 * GET /api/activities/kudos-analysis
 */
export const getKudosAnalysis = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { year } = req.query;

        const matchStage: Record<string, unknown> = {
            user: new mongoose.Types.ObjectId(userId?.toString()),
        };

        if (year) {
            const yearNum = parseInt(year as string);
            matchStage.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        // Overall kudos stats
        const overall = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total_kudos: { $sum: "$kudos_count" },
                    avg_kudos: { $avg: "$kudos_count" },
                    max_kudos: { $max: "$kudos_count" },
                    total_activities: { $sum: 1 },
                }
            }
        ]);

        // Kudos by sport type
        const bySport = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$sport_type",
                    total_kudos: { $sum: "$kudos_count" },
                    avg_kudos: { $avg: "$kudos_count" },
                    count: { $sum: 1 },
                }
            },
            { $sort: { total_kudos: -1 } },
        ]);

        // Kudos trend by month
        const trend = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$start_date" },
                        month: { $month: "$start_date" },
                    },
                    total_kudos: { $sum: "$kudos_count" },
                    activities: { $sum: 1 },
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Top kudos'd activities
        const topActivities = await Activity.find(matchStage)
            .sort({ kudos_count: -1 })
            .limit(5)
            .select("name kudos_count distance start_date sport_type");

        // Kudos per km (engagement rate)
        const engagement = await Activity.aggregate([
            { $match: { ...matchStage, distance: { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    kudos_per_km: { $avg: { $divide: ["$kudos_count", { $divide: ["$distance", 1000] }] } },
                    kudos_per_hour: { $avg: { $divide: ["$kudos_count", { $divide: ["$moving_time", 3600] }] } },
                }
            }
        ]);

        res.json({
            overall: overall[0] || { total_kudos: 0, avg_kudos: 0, max_kudos: 0, total_activities: 0 },
            bySport,
            trend,
            topActivities,
            engagement: engagement[0] || { kudos_per_km: 0, kudos_per_hour: 0 },
        });
    } catch (error) {
        console.error("Error getting kudos analysis:", error);
        res.status(500).json({ error: "Failed to get kudos analysis" });
    }
};

/**
 * Get heart rate zones analysis
 * GET /api/activities/hr-zones
 */
export const getHRZones = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { year, maxHR = 190 } = req.query;

        const matchStage: Record<string, unknown> = {
            user: new mongoose.Types.ObjectId(userId?.toString()),
            average_heartrate: { $exists: true, $gt: 0 },
        };

        if (year) {
            const yearNum = parseInt(year as string);
            matchStage.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        const maxHRNum = parseInt(maxHR as string);

        // Define HR zones (% of max HR)
        const zones = [
            { name: "Zone 1 (Recovery)", min: 0, max: 0.6 },
            { name: "Zone 2 (Aerobic)", min: 0.6, max: 0.7 },
            { name: "Zone 3 (Tempo)", min: 0.7, max: 0.8 },
            { name: "Zone 4 (Threshold)", min: 0.8, max: 0.9 },
            { name: "Zone 5 (Max)", min: 0.9, max: 1.0 },
        ];

        // Get activities with heart rate data
        const activities = await Activity.find(matchStage)
            .select("average_heartrate moving_time start_date")
            .lean();

        // Calculate time in each zone (approximate from average HR)
        const zoneStats = zones.map((zone, index) => {
            const zoneMinHR = zone.min * maxHRNum;
            const zoneMaxHR = zone.max * maxHRNum;

            const activitiesInZone = activities.filter(
                a => a.average_heartrate &&
                    a.average_heartrate >= zoneMinHR &&
                    a.average_heartrate < zoneMaxHR
            );

            const totalTime = activitiesInZone.reduce((sum, a) => sum + (a.moving_time || 0), 0);

            return {
                zone: index + 1,
                name: zone.name,
                minHR: Math.round(zoneMinHR),
                maxHR: Math.round(zoneMaxHR),
                totalTime,
                activities: activitiesInZone.length,
                percentage: 0, // Will calculate below
            };
        });

        // Calculate percentages
        const totalZoneTime = zoneStats.reduce((sum, z) => sum + z.totalTime, 0);
        zoneStats.forEach(z => {
            z.percentage = totalZoneTime > 0 ? Math.round((z.totalTime / totalZoneTime) * 100) : 0;
        });

        // HR trend over time
        const hrTrend = await Activity.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: "$start_date" },
                        month: { $month: "$start_date" },
                    },
                    avg_hr: { $avg: "$average_heartrate" },
                    max_hr: { $max: "$max_heartrate" },
                    avg_pace: { $avg: "$pace" },
                    activities: { $sum: 1 },
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // HR vs Pace correlation
        const hrPaceData = await Activity.find({
            ...matchStage,
            pace: { $exists: true, $gt: 0 },
        })
            .select("average_heartrate pace")
            .limit(100)
            .lean();

        res.json({
            zones: zoneStats,
            totalActivitiesWithHR: activities.length,
            hrTrend,
            hrPaceCorrelation: hrPaceData,
            maxHRUsed: maxHRNum,
        });
    } catch (error) {
        console.error("Error getting HR zones:", error);
        res.status(500).json({ error: "Failed to get HR zones" });
    }
};

/**
 * Get geographic analytics
 * GET /api/activities/locations
 */
export const getLocations = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { year } = req.query;

        const matchStage: Record<string, unknown> = {
            user: new mongoose.Types.ObjectId(userId?.toString()),
            start_latlng: { $exists: true, $ne: null },
        };

        if (year) {
            const yearNum = parseInt(year as string);
            matchStage.start_date = {
                $gte: new Date(yearNum, 0, 1),
                $lt: new Date(yearNum + 1, 0, 1),
            };
        }

        // Get all activities with location data
        const activities = await Activity.find(matchStage)
            .select("start_latlng end_latlng timezone start_date distance name")
            .lean();

        // Extract unique timezones/cities
        const timezones = await Activity.aggregate([
            { $match: { ...matchStage, timezone: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$timezone",
                    count: { $sum: 1 },
                    distance: { $sum: "$distance" },
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Get heatmap data (simplified - just start points)
        const heatmapData = activities
            .filter(a => a.start_latlng && a.start_latlng.length === 2)
            .map(a => ({
                lat: a.start_latlng![0],
                lng: a.start_latlng![1],
                weight: Math.min(1, (a.distance || 0) / 10000),
            }));

        // Calculate unique locations (rounded to ~1km grid)
        const uniqueLocations = new Set(
            activities
                .filter(a => a.start_latlng && a.start_latlng.length === 2)
                .map(a => `${Math.round(a.start_latlng![0] * 100)}:${Math.round(a.start_latlng![1] * 100)}`)
        );

        // Most frequent starting point
        const startingPoints: Record<string, number> = {};
        activities.forEach(a => {
            if (a.start_latlng && a.start_latlng.length === 2) {
                const key = `${a.start_latlng[0].toFixed(3)},${a.start_latlng[1].toFixed(3)}`;
                startingPoints[key] = (startingPoints[key] || 0) + 1;
            }
        });

        const mostFrequentStart = Object.entries(startingPoints)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([coords, count]) => {
                const [lat, lng] = coords.split(",").map(Number);
                return { lat, lng, count };
            });

        res.json({
            totalActivitiesWithLocation: activities.length,
            uniqueLocations: uniqueLocations.size,
            timezones,
            heatmapData: heatmapData.slice(0, 1000), // Limit for performance
            mostFrequentStarts: mostFrequentStart,
        });
    } catch (error) {
        console.error("Error getting locations:", error);
        res.status(500).json({ error: "Failed to get location data" });
    }
};

/**
 * Get comparisons (year over year, month over month)
 * GET /api/activities/comparisons
 */
export const getComparisons = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const calculateYearStats = async (year: number) => {
            const stats = await Activity.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId?.toString()),
                        start_date: {
                            $gte: new Date(year, 0, 1),
                            $lt: new Date(year + 1, 0, 1),
                        },
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_distance: { $sum: "$distance" },
                        total_time: { $sum: "$moving_time" },
                        total_elevation: { $sum: "$total_elevation_gain" },
                        total_activities: { $sum: 1 },
                        total_kudos: { $sum: "$kudos_count" },
                        avg_pace: { $avg: "$pace" },
                    }
                }
            ]);
            return stats[0] || {
                total_distance: 0,
                total_time: 0,
                total_elevation: 0,
                total_activities: 0,
                total_kudos: 0,
                avg_pace: 0,
            };
        };

        const [thisYear, lastYear] = await Promise.all([
            calculateYearStats(currentYear),
            calculateYearStats(previousYear),
        ]);

        // Calculate percentage changes
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const comparison = {
            distance: {
                current: thisYear.total_distance,
                previous: lastYear.total_distance,
                change: calculateChange(thisYear.total_distance, lastYear.total_distance),
            },
            time: {
                current: thisYear.total_time,
                previous: lastYear.total_time,
                change: calculateChange(thisYear.total_time, lastYear.total_time),
            },
            activities: {
                current: thisYear.total_activities,
                previous: lastYear.total_activities,
                change: calculateChange(thisYear.total_activities, lastYear.total_activities),
            },
            elevation: {
                current: thisYear.total_elevation,
                previous: lastYear.total_elevation,
                change: calculateChange(thisYear.total_elevation, lastYear.total_elevation),
            },
            kudos: {
                current: thisYear.total_kudos,
                previous: lastYear.total_kudos,
                change: calculateChange(thisYear.total_kudos, lastYear.total_kudos),
            },
        };

        res.json({
            currentYear,
            previousYear,
            thisYear,
            lastYear,
            comparison,
        });
    } catch (error) {
        console.error("Error getting comparisons:", error);
        res.status(500).json({ error: "Failed to get comparisons" });
    }
};
