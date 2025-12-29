import mongoose, { Document } from "mongoose";

export interface IActivity extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    strava_id: number;
    sport_type: string;
    name: string;
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time: number; // seconds
    total_elevation_gain: number; // meters
    start_date: Date;
    start_date_local: Date;
    timezone?: string;

    // Speed & Pace
    average_speed?: number; // m/s
    max_speed?: number; // m/s
    pace?: number; // minutes per km (for running)

    // Heart Rate
    average_heartrate?: number; // bpm
    max_heartrate?: number; // bpm
    has_heartrate: boolean;

    // Cadence
    average_cadence?: number;

    // Training Load & Effort
    suffer_score?: number; // Strava's relative effort
    calories?: number;

    // Social
    kudos_count?: number;
    achievement_count?: number;

    // Gear & Equipment
    gear_id?: string; // Reference to Strava gear

    // Location
    start_latlng?: [number, number]; // [lat, lng]
    end_latlng?: [number, number];

    // Metadata
    manual?: boolean; // Manual entry vs GPS
    visibility?: string; // everyone, followers_only, only_me

    // Computed/Derived Fields
    consistency_week?: number; // Week number for consistency tracking
    training_load_score?: number; // Derived training load
}
