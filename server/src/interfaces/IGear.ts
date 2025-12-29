import mongoose, { Document } from "mongoose";

export interface IGear extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    strava_gear_id: string; // e.g., "g1234567"
    name: string;
    brand_name?: string;
    model_name?: string;
    gear_type: "bike" | "shoes" | "other";
    distance: number; // Total distance in meters
    retired: boolean;

    // Computed stats
    total_activities: number;
    total_time: number; // seconds
    average_pace?: number; // For shoes
    first_activity_date?: Date;
    last_activity_date?: Date;

    // Alerts
    distance_alert_threshold?: number; // Alert when exceeded
    needs_replacement?: boolean;
}
