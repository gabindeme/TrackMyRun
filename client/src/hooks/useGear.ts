import { useState, useEffect, useCallback } from "react";
import { axiosConfig } from "@/config/axiosConfig";

export interface Gear {
    _id: string;
    user: string;
    strava_gear_id: string;
    name: string;
    brand_name?: string;
    model_name?: string;
    gear_type: "bike" | "shoes" | "other";
    distance: number;
    retired: boolean;
    total_activities: number;
    total_time: number;
    average_pace?: number;
    first_activity_date?: string;
    last_activity_date?: string;
    distance_alert_threshold?: number;
    needs_replacement?: boolean;
}

export interface GearStats {
    totalGear: number;
    shoesCount: number;
    bikesCount: number;
    needingReplacement: number;
    mostUsed: { name: string; distance_km: number } | null;
    totalDistance_km: number;
    gear: Gear[];
}

export function useGear() {
    const [gear, setGear] = useState<Gear[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGear = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosConfig.get("/gear");
            setGear(response.data.gear);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch gear");
        } finally {
            setLoading(false);
        }
    }, []);

    const syncGear = async () => {
        setSyncing(true);
        try {
            const response = await axiosConfig.post("/gear/sync");
            setGear(response.data.gear);
            setError(null);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to sync gear");
            throw err;
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchGear();
    }, [fetchGear]);

    return { gear, loading, syncing, error, refetch: fetchGear, syncGear };
}

export function useGearStats() {
    const [data, setData] = useState<GearStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/gear/stats");
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch gear stats");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}
