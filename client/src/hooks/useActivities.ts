import { useState, useEffect, useCallback } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import {
    Activity,
    ActivitySummary,
    SportBreakdown,
    TrendData,
    PersonalBests,
    YearInSport,
} from "@/interfaces/Activity";

export function useActivities(params?: { page?: number; limit?: number; sport_type?: string; year?: number }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosConfig.get("/activities", { params });
            setActivities(response.data.activities);
            setPagination(response.data.pagination);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch activities");
        } finally {
            setLoading(false);
        }
    }, [params?.page, params?.limit, params?.sport_type, params?.year]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    return { activities, pagination, loading, error, refetch: fetchActivities };
}

export function useSummary(period: string = "all", year?: number, sport_type?: string) {
    const [summary, setSummary] = useState<ActivitySummary | null>(null);
    const [sportBreakdown, setSportBreakdown] = useState<SportBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosConfig.get("/activities/summary", {
                params: { period, year, sport_type },
            });
            setSummary(response.data.summary);
            setSportBreakdown(response.data.sportBreakdown);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch summary");
        } finally {
            setLoading(false);
        }
    }, [period, year, sport_type]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { summary, sportBreakdown, loading, error, refetch: fetchSummary };
}

export function useTrends(period: string = "month", sport_type?: string) {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/trends", {
                    params: { period, sport_type },
                });
                setTrends(response.data.trends);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch trends");
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, [period, sport_type]);

    return { trends, loading, error };
}

export function usePersonalBests(sport_type?: string) {
    const [bests, setBests] = useState<PersonalBests | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBests = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/personal-bests", {
                    params: { sport_type },
                });
                setBests(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch personal bests");
            } finally {
                setLoading(false);
            }
        };
        fetchBests();
    }, [sport_type]);

    return { bests, loading, error };
}

export function useYearInSport(year?: number) {
    const [data, setData] = useState<YearInSport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchYearInSport = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get(`/activities/year-in-sport/${year || new Date().getFullYear()}`);
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch year in sport");
            } finally {
                setLoading(false);
            }
        };
        fetchYearInSport();
    }, [year]);

    return { data, loading, error };
}

// =====================================================
// ADVANCED ANALYTICS HOOKS
// =====================================================

export interface RollingStats {
    total_distance: number;
    total_time: number;
    total_elevation: number;
    total_activities: number;
    avg_pace: number;
    avg_heartrate: number;
    total_kudos: number;
    total_training_load: number;
}

export function useRollingStats() {
    const [data, setData] = useState<{
        rolling_7_days: RollingStats;
        rolling_30_days: RollingStats;
        rolling_90_days: RollingStats;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/rolling-stats");
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch rolling stats");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}

export interface PaceAnalysis {
    distribution: { _id: number | string; count: number }[];
    trend: { _id: { year: number; month: number }; avg_pace: number; best_pace: number; activities: number }[];
    bestPace: Activity | null;
    averageStats: { avg_pace: number; median_pace: number; total_runs: number };
}

export function usePaceAnalysis(year?: number) {
    const [data, setData] = useState<PaceAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/pace-analysis", { params: { year } });
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch pace analysis");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [year]);

    return { data, loading, error };
}

export interface Consistency {
    consistencyScore: number;
    weeksWithActivity: number;
    weeksSoFar: number;
    currentStreak: number;
    longestStreak: number;
    weeklyBreakdown: { _id: number; activities: number; distance: number }[];
}

export function useConsistency() {
    const [data, setData] = useState<Consistency | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/consistency");
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch consistency");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}

export interface TrainingLoad {
    acuteLoad: number;
    chronicLoad: number;
    acwr: string;
    trainingStatus: "undertrained" | "optimal" | "elevated" | "high_risk";
    weeklyLoads: { _id: number; total_load: number; total_distance: number; total_time: number; activities: number }[];
}

export function useTrainingLoad() {
    const [data, setData] = useState<TrainingLoad | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/training-load");
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch training load");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}

export interface KudosAnalysis {
    overall: { total_kudos: number; avg_kudos: number; max_kudos: number; total_activities: number };
    bySport: { _id: string; total_kudos: number; avg_kudos: number; count: number }[];
    trend: { _id: { year: number; month: number }; total_kudos: number; activities: number }[];
    topActivities: Activity[];
    engagement: { kudos_per_km: number; kudos_per_hour: number };
}

export function useKudosAnalysis(year?: number) {
    const [data, setData] = useState<KudosAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/kudos-analysis", { params: { year } });
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch kudos analysis");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [year]);

    return { data, loading, error };
}

// HR Zones Hook
export interface HRZone {
    zone: number;
    name: string;
    minHR: number;
    maxHR: number;
    totalTime: number;
    activities: number;
    percentage: number;
}

export interface HRZonesData {
    zones: HRZone[];
    totalActivitiesWithHR: number;
    hrTrend: { _id: { year: number; month: number }; avg_hr: number; max_hr: number }[];
    hrPaceCorrelation: { average_heartrate: number; pace: number }[];
    maxHRUsed: number;
}

export function useHRZones(year?: number, maxHR = 190) {
    const [data, setData] = useState<HRZonesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/hr-zones", { params: { year, maxHR } });
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch HR zones");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [year, maxHR]);

    return { data, loading, error };
}

// Locations Hook
export interface LocationsData {
    totalActivitiesWithLocation: number;
    uniqueLocations: number;
    timezones: { _id: string; count: number; distance: number }[];
    heatmapData: { lat: number; lng: number; weight: number }[];
    mostFrequentStarts: { lat: number; lng: number; count: number }[];
}

export function useLocations(year?: number) {
    const [data, setData] = useState<LocationsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/locations", { params: { year } });
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch locations");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [year]);

    return { data, loading, error };
}

// Comparisons Hook
export interface ComparisonData {
    currentYear: number;
    previousYear: number;
    comparison: {
        distance: { current: number; previous: number; change: number };
        time: { current: number; previous: number; change: number };
        activities: { current: number; previous: number; change: number };
        elevation: { current: number; previous: number; change: number };
        kudos: { current: number; previous: number; change: number };
    };
}

export function useComparisons() {
    const [data, setData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/activities/comparisons");
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch comparisons");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading, error };
}

