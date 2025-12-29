import { Schema, model } from "mongoose";
import { IActivity } from "../interfaces/IActivity.js";

const ActivitySchema = new Schema<IActivity>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        strava_id: { type: Number, required: true, unique: true, index: true },
        sport_type: { type: String, required: true, index: true },
        name: { type: String, required: true },
        distance: { type: Number, required: true }, // meters
        moving_time: { type: Number, required: true }, // seconds
        elapsed_time: { type: Number, required: true }, // seconds
        total_elevation_gain: { type: Number, default: 0 }, // meters
        start_date: { type: Date, required: true, index: true },
        start_date_local: { type: Date, required: true },
        timezone: { type: String },

        // Speed & Pace
        average_speed: { type: Number }, // m/s
        max_speed: { type: Number }, // m/s
        pace: { type: Number }, // minutes per km

        // Heart Rate
        average_heartrate: { type: Number }, // bpm
        max_heartrate: { type: Number }, // bpm
        has_heartrate: { type: Boolean, default: false },

        // Cadence
        average_cadence: { type: Number },

        // Training Load & Effort
        suffer_score: { type: Number }, // Strava's relative effort
        calories: { type: Number },

        // Social
        kudos_count: { type: Number, default: 0 },
        achievement_count: { type: Number, default: 0 },

        // Gear & Equipment
        gear_id: { type: String, index: true },

        // Location
        start_latlng: { type: [Number] }, // [lat, lng]
        end_latlng: { type: [Number] },

        // Metadata
        manual: { type: Boolean, default: false },
        visibility: { type: String, default: "everyone" },

        // Computed/Derived Fields
        consistency_week: { type: Number, index: true },
        training_load_score: { type: Number },
    },
    { timestamps: true }
);

// Compound indexes for efficient queries
ActivitySchema.index({ user: 1, start_date: -1 });
ActivitySchema.index({ user: 1, sport_type: 1, start_date: -1 });
ActivitySchema.index({ user: 1, gear_id: 1 });
ActivitySchema.index({ user: 1, consistency_week: 1 });

// Virtual for formatted distance (km)
ActivitySchema.virtual("distance_km").get(function () {
    return (this.distance / 1000).toFixed(2);
});

// Virtual for formatted duration
ActivitySchema.virtual("duration_formatted").get(function () {
    const hours = Math.floor(this.moving_time / 3600);
    const minutes = Math.floor((this.moving_time % 3600) / 60);
    const seconds = this.moving_time % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
});

// Pre-save hook to calculate derived fields
ActivitySchema.pre("save", function (next) {
    // Calculate pace for running activities
    if (this.sport_type.toLowerCase().includes("run") && this.distance > 0) {
        this.pace = (this.moving_time / 60) / (this.distance / 1000);
    }

    // Calculate consistency week (ISO week number)
    const date = new Date(this.start_date);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    this.consistency_week = date.getFullYear() * 100 + weekNumber; // YYYYWW format

    // Calculate training load score (simplified TRIMP-like calculation)
    if (this.moving_time > 0) {
        const durationMinutes = this.moving_time / 60;
        const hrFactor = this.average_heartrate ? (this.average_heartrate / 180) : 0.7;
        this.training_load_score = Math.round(durationMinutes * hrFactor);
    }

    next();
});

export const Activity = model<IActivity>("Activity", ActivitySchema);
