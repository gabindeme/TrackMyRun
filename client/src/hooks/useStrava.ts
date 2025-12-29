import { useState, useEffect, useCallback } from "react";
import { axiosConfig } from "@/config/axiosConfig";

interface StravaStatus {
    connected: boolean;
    athleteId?: number;
}

export function useStrava() {
    const [status, setStatus] = useState<StravaStatus>({ connected: false });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axiosConfig.get("/strava/status");
            setStatus(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch Strava status");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const connect = async () => {
        try {
            const response = await axiosConfig.get("/strava/connect");
            // Redirect to Strava authorization page
            window.location.href = response.data.authUrl;
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to initiate Strava connection");
        }
    };

    const disconnect = async () => {
        try {
            await axiosConfig.post("/strava/disconnect");
            setStatus({ connected: false });
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to disconnect Strava");
        }
    };

    const syncActivities = async () => {
        setSyncing(true);
        try {
            const response = await axiosConfig.post("/activities/sync");
            setError(null);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to sync activities");
            throw err;
        } finally {
            setSyncing(false);
        }
    };

    return {
        status,
        loading,
        syncing,
        error,
        connect,
        disconnect,
        syncActivities,
        refetchStatus: fetchStatus,
    };
}
