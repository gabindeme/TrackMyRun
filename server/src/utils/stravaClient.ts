import { IUser } from "../interfaces/IUser.js";
import { User } from "../models/userModel.js";

// Strava API configuration
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

interface StravaTokenResponse {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: {
        id: number;
        firstname: string;
        lastname: string;
        profile: string;
    };
}

interface StravaActivity {
    id: number;
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    sport_type: string;
    start_date: string;
    start_date_local: string;
    timezone?: string;

    // Speed
    average_speed: number;
    max_speed: number;

    // Heart Rate
    average_heartrate?: number;
    max_heartrate?: number;
    has_heartrate: boolean;

    // Cadence
    average_cadence?: number;

    // Social & Achievements
    kudos_count?: number;
    achievement_count?: number;

    // Training Load
    suffer_score?: number; // Strava's relative effort
    calories?: number;

    // Gear
    gear_id?: string;

    // Location
    start_latlng?: [number, number];
    end_latlng?: [number, number];

    // Metadata
    manual?: boolean;
    visibility?: string;
}

/**
 * Get Strava OAuth configuration from environment variables
 */
function getStravaConfig() {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const callbackUrl = process.env.STRAVA_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw new Error("Missing Strava API configuration. Please set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_CALLBACK_URL environment variables.");
    }

    return { clientId, clientSecret, callbackUrl };
}

/**
 * Generate Strava OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
    const { clientId, callbackUrl } = getStravaConfig();

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        approval_prompt: "auto",
        scope: "read,activity:read_all",
        state: state,
    });

    return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Generate Strava OAuth authorization URL for login (unauthenticated users)
 * Uses the same callback URL but with 'login' state to differentiate
 */
export function getLoginAuthorizationUrl(): string {
    const { clientId, callbackUrl } = getStravaConfig();

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl, // Use the same registered callback URL
        response_type: "code",
        approval_prompt: "auto",
        scope: "read,activity:read_all",
        state: "login", // Special state for login flow
    });

    return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeToken(code: string): Promise<StravaTokenResponse> {
    const { clientId, clientSecret } = getStravaConfig();

    const response = await fetch(STRAVA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: "authorization_code",
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange token: ${error}`);
    }

    return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
    const { clientId, clientSecret } = getStravaConfig();

    const response = await fetch(STRAVA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
}

/**
 * Get a valid access token for a user, refreshing if expired
 */
export async function getValidAccessToken(user: IUser): Promise<string> {
    // Get user with Strava tokens
    const userWithTokens = await User.findById(user._id)
        .select("+strava_access_token +strava_refresh_token")
        .exec();

    if (!userWithTokens?.strava_access_token || !userWithTokens?.strava_refresh_token) {
        throw new Error("User is not connected to Strava");
    }

    // Check if token is expired (with 5 minute buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresAt = userWithTokens.strava_token_expires_at || 0;

    if (currentTime >= expiresAt - 300) {
        // Token is expired or will expire soon, refresh it
        const tokenData = await refreshAccessToken(userWithTokens.strava_refresh_token);

        // Update user with new tokens
        await User.findByIdAndUpdate(user._id, {
            strava_access_token: tokenData.access_token,
            strava_refresh_token: tokenData.refresh_token,
            strava_token_expires_at: tokenData.expires_at,
        });

        return tokenData.access_token;
    }

    return userWithTokens.strava_access_token;
}

/**
 * Fetch activities from Strava API
 */
export async function getAthleteActivities(
    accessToken: string,
    options: {
        before?: number;
        after?: number;
        page?: number;
        perPage?: number;
    } = {}
): Promise<StravaActivity[]> {
    const params = new URLSearchParams();

    if (options.before) params.append("before", options.before.toString());
    if (options.after) params.append("after", options.after.toString());
    params.append("page", (options.page || 1).toString());
    params.append("per_page", (options.perPage || 100).toString());

    const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch activities: ${error}`);
    }

    return response.json();
}

/**
 * Get authenticated athlete's profile
 */
export async function getAthlete(accessToken: string) {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch athlete: ${error}`);
    }

    return response.json();
}

export type { StravaTokenResponse, StravaActivity };
