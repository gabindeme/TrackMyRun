import { Request, Response } from "express";
import { Activity } from "../models/activityModel.js";
import { Gear } from "../models/gearModel.js";
import mongoose from "mongoose";

/**
 * Get all user's gear with stats
 * GET /api/gear
 */
export const getGear = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const gear = await Gear.find({ user: userId }).sort({ distance: -1 });

        res.json({ gear });
    } catch (error) {
        console.error("Error getting gear:", error);
        res.status(500).json({ error: "Failed to get gear" });
    }
};

/**
 * Sync gear from activities
 * POST /api/gear/sync
 */
export const syncGear = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        // Get unique gear IDs from activities
        const gearIds = await Activity.distinct("gear_id", {
            user: userId,
            gear_id: { $exists: true, $ne: null }
        });

        // Calculate stats for each gear
        for (const gearId of gearIds) {
            const stats = await Activity.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId?.toString()),
                        gear_id: gearId
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_distance: { $sum: "$distance" },
                        total_time: { $sum: "$moving_time" },
                        total_activities: { $sum: 1 },
                        avg_pace: { $avg: "$pace" },
                        first_activity: { $min: "$start_date" },
                        last_activity: { $max: "$start_date" },
                    }
                }
            ]);

            const stat = stats[0];
            if (stat) {
                await Gear.findOneAndUpdate(
                    { user: userId, strava_gear_id: gearId },
                    {
                        user: userId,
                        strava_gear_id: gearId,
                        name: `Gear ${gearId}`, // Will be updated when we fetch from Strava
                        distance: stat.total_distance,
                        total_activities: stat.total_activities,
                        total_time: stat.total_time,
                        average_pace: stat.avg_pace,
                        first_activity_date: stat.first_activity,
                        last_activity_date: stat.last_activity,
                        gear_type: gearId.startsWith("g") ? "bike" : "shoes",
                    },
                    { upsert: true, new: true }
                );
            }
        }

        const gear = await Gear.find({ user: userId }).sort({ distance: -1 });

        res.json({
            message: "Gear synced successfully",
            gear,
            count: gear.length
        });
    } catch (error) {
        console.error("Error syncing gear:", error);
        res.status(500).json({ error: "Failed to sync gear" });
    }
};

/**
 * Get gear stats summary
 * GET /api/gear/stats
 */
export const getGearStats = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        // Get all gear
        const gear = await Gear.find({ user: userId, retired: false });

        // Find gear needing replacement
        const needingReplacement = gear.filter(g => g.needs_replacement);

        // Find most used gear
        const mostUsed = gear.length > 0 ? gear.reduce((max, g) =>
            g.distance > max.distance ? g : max
        ) : null;

        // Total distance across all gear
        const totalDistance = gear.reduce((sum, g) => sum + g.distance, 0);

        res.json({
            totalGear: gear.length,
            shoesCount: gear.filter(g => g.gear_type === "shoes").length,
            bikesCount: gear.filter(g => g.gear_type === "bike").length,
            needingReplacement: needingReplacement.length,
            mostUsed: mostUsed ? {
                name: mostUsed.name,
                distance_km: Math.round(mostUsed.distance / 1000),
            } : null,
            totalDistance_km: Math.round(totalDistance / 1000),
            gear,
        });
    } catch (error) {
        console.error("Error getting gear stats:", error);
        res.status(500).json({ error: "Failed to get gear stats" });
    }
};

/**
 * Update gear details
 * PATCH /api/gear/:id
 */
export const updateGear = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name, distance_alert_threshold, retired } = req.body;

        const gear = await Gear.findOneAndUpdate(
            { _id: id, user: userId },
            {
                ...(name && { name }),
                ...(distance_alert_threshold && { distance_alert_threshold }),
                ...(retired !== undefined && { retired }),
            },
            { new: true }
        );

        if (!gear) {
            return res.status(404).json({ error: "Gear not found" });
        }

        res.json({ gear });
    } catch (error) {
        console.error("Error updating gear:", error);
        res.status(500).json({ error: "Failed to update gear" });
    }
};
