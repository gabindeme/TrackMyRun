import express, { Router } from "express";
import { getConnectedUser, login, logout, register, signInWithGoogle } from "../controllers/authenticationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getLoginAuthorizationUrl, exchangeToken } from "../utils/stravaClient.js";
import { User } from "../models/userModel.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { authTypes } from "../utils/enums/authTypes.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { generateRandomAvatar } from "../utils/generateRandomAvatar.js";
import { saveAvatarFromUrl } from "../utils/saveAvatarFromUrl.js";

export const authRouter: Router = express.Router();
/**
 * @route POST /login
 * @description Authenticates a user with their credentials (e.g., email and password).
 */
authRouter.post("/login", login);

/**
 * @route POST /google
 * @description Authenticates a user using Google OAuth.
 * @body {Object} - Contains user details like name, email, and photoURL.
 */
authRouter.post("/login/google", signInWithGoogle);

/**
 * @route GET /login/strava
 * @description Redirects to Strava OAuth for login/registration
 */
authRouter.get("/login/strava", (req, res) => {
    try {
        const authUrl = getLoginAuthorizationUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error("Error initiating Strava login:", error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=strava_config`);
    }
});

/**
 * @route POST /login/strava/callback
 * @description Handles Strava OAuth callback for login/registration
 */
authRouter.post("/login/strava/callback", async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            res.status(400).json({ error: "Authorization code is required" });
            return;
        }

        // Exchange code for tokens
        const tokenData = await exchangeToken(code);
        const { athlete } = tokenData;

        // Check if user already exists with this Strava athlete ID
        let user = await User.findOne({ strava_athlete_id: athlete.id });

        if (!user) {
            // Create new user from Strava data
            const username = `strava_${athlete.id}`;
            const randomPassword = Math.random().toString(36).slice(-16) + "A1!";

            user = await User.create({
                name: athlete.lastname || "Strava",
                forename: athlete.firstname || "User",
                email: `${athlete.id}@strava.trackmyrun.local`, // Placeholder email
                username: username,
                password: randomPassword, // Required field, but not used for Strava login
                auth_type: authTypes.STRAVA || "strava",
                strava_athlete_id: athlete.id,
                strava_access_token: tokenData.access_token,
                strava_refresh_token: tokenData.refresh_token,
                strava_token_expires_at: tokenData.expires_at,
                strava_connected: true,
            });

            // Set avatar from Strava profile
            if (athlete.profile && !athlete.profile.includes("avatar/athlete/large")) {
                try {
                    const avatarPath = await saveAvatarFromUrl(athlete.profile, user._id);
                    if (avatarPath) {
                        user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
                        await user.save();
                    }
                } catch {
                    // Generate random avatar if Strava avatar fails
                    const avatarPath = await generateRandomAvatar(user._id);
                    user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
                    await user.save();
                }
            } else {
                const avatarPath = await generateRandomAvatar(user._id);
                user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
                await user.save();
            }

            // Make first user admin
            const userCount = await User.countDocuments();
            if (userCount === 1) {
                user.role = userRoles.ADMIN;
                await user.save();
            }
        } else {
            // Update existing user's tokens
            await User.findByIdAndUpdate(user._id, {
                strava_access_token: tokenData.access_token,
                strava_refresh_token: tokenData.refresh_token,
                strava_token_expires_at: tokenData.expires_at,
                strava_connected: true,
            });
        }

        const accessToken = generateAccessToken(user._id);

        res.status(200).json({
            user,
            message: "server.auth.messages.login_success",
            accessToken,
        });
    } catch (error) {
        console.error("Error handling Strava login callback:", error);
        res.status(500).json({ error: "Failed to complete Strava login" });
    }
});

/**
 * @route POST /register
 * @description Registers a new user with the provided details.
 */
authRouter.post("/register", register);

/**
 * @route GET /logout
 * @description Logs out the currently authenticated user.
 * @middleware verifyToken() - Ensures the user is authenticated before logging out.
 */
authRouter.get("/logout", verifyToken(), logout);

/**
 * @route GET /me
 * @description Fetches the currently authenticated user's information.
 * @middleware verifyToken() - Ensures the user is authenticated by validating the JWT token.
 */
authRouter.get("/me", verifyToken(), getConnectedUser);
