import { Schema, model } from "mongoose";
import { IGear } from "../interfaces/IGear.js";

const GearSchema = new Schema<IGear>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        strava_gear_id: { type: String, required: true, index: true },
        name: { type: String, required: true },
        brand_name: { type: String },
        model_name: { type: String },
        gear_type: {
            type: String,
            enum: ["bike", "shoes", "other"],
            default: "other"
        },
        distance: { type: Number, default: 0 }, // meters
        retired: { type: Boolean, default: false },

        // Computed stats
        total_activities: { type: Number, default: 0 },
        total_time: { type: Number, default: 0 }, // seconds
        average_pace: { type: Number },
        first_activity_date: { type: Date },
        last_activity_date: { type: Date },

        // Alerts
        distance_alert_threshold: { type: Number, default: 800000 }, // 800km default for shoes
        needs_replacement: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index
GearSchema.index({ user: 1, strava_gear_id: 1 }, { unique: true });

// Virtual for formatted distance
GearSchema.virtual("distance_km").get(function () {
    return Math.round(this.distance / 1000);
});

// Pre-save hook to check replacement alert
GearSchema.pre("save", function (next) {
    if (this.distance_alert_threshold && this.distance >= this.distance_alert_threshold) {
        this.needs_replacement = true;
    }
    next();
});

export const Gear = model<IGear>("Gear", GearSchema);
