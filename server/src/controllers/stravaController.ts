import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import {
    getAuthorizationUrl,
    exchangeToken,
    getValidAccessToken,
    getAthleteActivities,
} from "../utils/stravaClient.js";
import jwt from "jsonwebtoken";

/**
 * Initiate Strava OAuth flow
 * GET /api/strava/connect
 */
export const connectStrava = async (req: Request, res: Response) => {
    try {
        // Use the user ID as state to verify the callback
        const userId = req.userId?.toString();
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Create a signed state token to prevent CSRF
        const state = jwt.sign({ userId }, process.env.SECRET_ACCESS_TOKEN || "secret", {
            expiresIn: "10m",
        });

        const authUrl = getAuthorizationUrl(state);
        res.json({ authUrl });
    } catch (error) {
        console.error("Error initiating Strava connection:", error);
        res.status(500).json({ error: "Failed to initiate Strava connection" });
    }
};

/**
 * Handle Strava OAuth callback
 * GET /api/strava/callback
 * Handles both:
 * - "login" state: Create/authenticate user and redirect with JWT
 * - JWT state: Connect Strava to existing authenticated user
 */
export const stravaCallback = async (req: Request, res: Response) => {
    try {
        const { code, state, error: stravaError } = req.query;

        if (stravaError) {
            return res.redirect(`${process.env.CORS_ORIGIN}/login?strava=error&reason=${stravaError}`);
        }

        if (!code || !state) {
            return res.redirect(`${process.env.CORS_ORIGIN}/login?strava=error&reason=missing_params`);
        }

        // Exchange code for tokens
        const tokenData = await exchangeToken(code as string);
        const { athlete } = tokenData;

        // Check if this is a LOGIN flow (state === "login")
        if (state === "login") {
            // Login/register flow for unauthenticated users
            let user = await User.findOne({ strava_athlete_id: athlete.id });

            if (!user) {
                // Create new user from Strava data
                const username = `strava_${athlete.id}`;
                const randomPassword = Math.random().toString(36).slice(-16) + "A1!";

                user = await User.create({
                    name: athlete.lastname || "Strava",
                    forename: athlete.firstname || "User",
                    email: `${athlete.id}@strava.trackmyrun.local`,
                    username: username,
                    password: randomPassword,
                    auth_type: "strava",
                    strava_athlete_id: athlete.id,
                    strava_access_token: tokenData.access_token,
                    strava_refresh_token: tokenData.refresh_token,
                    strava_token_expires_at: tokenData.expires_at,
                    strava_connected: true,
                });

                // Generate random avatar
                const { generateRandomAvatar } = await import("../utils/generateRandomAvatar.js");
                const avatarPath = await generateRandomAvatar(user._id);
                user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
                await user.save();
            } else {
                // Update existing user's tokens
                await User.findByIdAndUpdate(user._id, {
                    strava_access_token: tokenData.access_token,
                    strava_refresh_token: tokenData.refresh_token,
                    strava_token_expires_at: tokenData.expires_at,
                    strava_connected: true,
                });
            }

            // Generate JWT token
            const { generateAccessToken } = await import("../utils/generateAccessToken.js");
            const accessToken = generateAccessToken(user._id);

            // Redirect to frontend with token in URL (frontend will store it)
            return res.redirect(`${process.env.CORS_ORIGIN}/auth/callback?token=${accessToken}`);
        }

        // Regular connect flow for authenticated users
        let decoded: { userId: string };
        try {
            decoded = jwt.verify(state as string, process.env.SECRET_ACCESS_TOKEN || "secret") as { userId: string };
        } catch {
            return res.redirect(`${process.env.CORS_ORIGIN}/dashboard?strava=error&reason=invalid_state`);
        }

        // Update user with Strava data
        await User.findByIdAndUpdate(decoded.userId, {
            strava_athlete_id: tokenData.athlete.id,
            strava_access_token: tokenData.access_token,
            strava_refresh_token: tokenData.refresh_token,
            strava_token_expires_at: tokenData.expires_at,
            strava_connected: true,
        });

        // Redirect back to app with success
        res.redirect(`${process.env.CORS_ORIGIN}/dashboard?strava=success`);
    } catch (error) {
        console.error("Error handling Strava callback:", error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?strava=error&reason=exchange_failed`);
    }
};

/**
 * Disconnect Strava account
 * POST /api/strava/disconnect
 */
export const disconnectStrava = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        await User.findByIdAndUpdate(userId, {
            $unset: {
                strava_athlete_id: 1,
                strava_access_token: 1,
                strava_refresh_token: 1,
                strava_token_expires_at: 1,
            },
            strava_connected: false,
        });

        res.json({ message: "Strava disconnected successfully" });
    } catch (error) {
        console.error("Error disconnecting Strava:", error);
        res.status(500).json({ error: "Failed to disconnect Strava" });
    }
};

/**
 * Get Strava connection status
 * GET /api/strava/status
 */
export const getStravaStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        console.log("Strava status check for userId:", userId);

        const user = await User.findById(userId).select("strava_connected strava_athlete_id");
        console.log("Strava status user data:", {
            found: !!user,
            strava_connected: user?.strava_connected,
            strava_athlete_id: user?.strava_athlete_id,
        });

        res.json({
            connected: user?.strava_connected || false,
            athleteId: user?.strava_athlete_id,
        });
    } catch (error) {
        console.error("Error getting Strava status:", error);
        res.status(500).json({ error: "Failed to get Strava status" });
    }
};

/**
 * Manually sync activities from Strava
 * POST /api/strava/sync
 */
export const syncActivities = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Check if user is connected to Strava
        const fullUser = await User.findById(userId).select("+strava_access_token +strava_refresh_token strava_connected strava_token_expires_at");
        if (!fullUser?.strava_connected) {
            return res.status(400).json({ error: "User is not connected to Strava" });
        }

        // Get valid access token (refreshes if needed)
        const accessToken = await getValidAccessToken(fullUser);

        // Fetch activities from Strava
        const activities = await getAthleteActivities(accessToken, {
            perPage: 100,
        });

        // Return activities for now (Phase 2 will store them in Activity model)
        res.json({
            message: "Activities synced successfully",
            count: activities.length,
            activities: activities,
        });
    } catch (error) {
        console.error("Error syncing activities:", error);
        res.status(500).json({ error: "Failed to sync activities" });
    }
};
