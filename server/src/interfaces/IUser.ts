import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  forename: string;
  email: string;
  username: string;
  password: string;
  role: string;
  avatar: string;
  auth_type: string;
  fullname?: string; // virtual
  // Strava OAuth fields
  strava_athlete_id?: number;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_token_expires_at?: number;
  strava_connected?: boolean;
}
