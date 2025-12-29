export interface Activity {
    _id: string;
    user: string;
    strava_id: number;
    sport_type: string;
    name: string;
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time: number; // seconds
    total_elevation_gain: number; // meters
    start_date: string;
    start_date_local: string;
    average_speed: number; // m/s
    max_speed: number; // m/s
    average_heartrate?: number;
    max_heartrate?: number;
    average_cadence?: number;
    has_heartrate: boolean;
    pace?: number; // minutes per km
    createdAt: string;
    updatedAt: string;
}

export interface ActivitySummary {
    total_distance: number;
    total_time: number;
    total_elevation: number;
    total_activities: number;
    avg_distance?: number;
    avg_time?: number;
    avg_speed?: number;
    avg_heartrate?: number;
    max_distance?: number;
    max_speed?: number;
    total_kudos?: number;
}

export interface SportBreakdown {
    _id: string;
    count: number;
    distance: number;
    time: number;
}

export interface TrendData {
    _id: { year: number; month?: number; week?: number };
    distance: number;
    time: number;
    activities: number;
    avg_pace?: number;
    avg_heartrate?: number;
}

export interface PersonalBests {
    longestDistance: Activity | null;
    longestTime: Activity | null;
    fastestPace: Activity | null;
    highestElevation: Activity | null;
    mostKudos: Activity | null;
}

export interface YearInSport {
    year: number;
    overall: ActivitySummary;
    mostActiveMonth: { month: number } | null;
    favoriteDay: string | null;
    sportBreakdown: SportBreakdown[];
    longestActivity: Activity | null;
    fastestPace: Activity | null;
    funInsights: string[];
}
