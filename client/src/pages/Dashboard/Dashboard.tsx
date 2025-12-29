import { useSummary, useTrends, usePersonalBests } from "@/hooks/useActivities";
import { useStrava } from "@/hooks/useStrava";
import { SummaryCards } from "./SummaryCards";
import { SportBreakdownChart } from "./SportBreakdownChart";
import { ActivityTrendChart } from "./ActivityTrendChart";
import { PersonalBestCards } from "./PersonalBestCards";
import { StravaConnect } from "./StravaConnect";
import { RollingStatsWidget, ConsistencyWidget, TrainingLoadWidget } from "./AdvancedWidgets";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { RefreshCw, TrendingUp, Trophy, Activity, CheckCircle } from "lucide-react";

type Period = "week" | "month" | "year" | "all";

export default function Dashboard() {
    const [period, setPeriod] = useState<Period>("year");
    const [searchParams, setSearchParams] = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);
    const { status, loading: stravaLoading, syncing, syncActivities, connect, disconnect, refetchStatus } = useStrava();
    const { summary, sportBreakdown, loading: summaryLoading, refetch: refetchSummary } = useSummary(period);
    const { trends, loading: trendsLoading } = useTrends("month");
    const { bests, loading: bestsLoading } = usePersonalBests();

    // Handle OAuth callback
    useEffect(() => {
        const stravaResult = searchParams.get("strava");
        if (stravaResult === "success") {
            setShowSuccess(true);
            // Clear the URL params
            setSearchParams({});
            // Refresh Strava status and trigger initial sync
            refetchStatus();
            setTimeout(() => {
                syncActivities().then(() => refetchSummary());
            }, 1000);
            // Hide success message after 5 seconds
            setTimeout(() => setShowSuccess(false), 5000);
        } else if (stravaResult === "error") {
            console.error("Strava connection failed:", searchParams.get("reason"));
            setSearchParams({});
        }
    }, [searchParams]);

    const handleSync = async () => {
        try {
            await syncActivities();
            refetchSummary();
        } catch {
            // Error handled in hook
        }
    };

    // Show loading state while checking Strava connection
    if (stravaLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not connected to Strava, show connection prompt
    if (!status.connected) {
        return <StravaConnect onConnect={connect} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20 md:pb-8">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-5 h-5" />
                    <span>Connected to Strava! Syncing your activities...</span>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/70 border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                    TrackMyRun
                                </h1>
                                <p className="text-xs md:text-sm text-slate-400">Your Performance Dashboard</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all min-h-[44px]"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync"}</span>
                        </button>
                    </div>

                    {/* Period Toggle - Mobile Optimized */}
                    <div className="flex gap-1 mt-4 bg-slate-800/50 p-1 rounded-lg">
                        {(["week", "month", "year", "all"] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`flex-1 py-2 px-2 md:px-4 text-xs md:text-sm font-medium rounded-md transition-all min-h-[44px] ${period === p
                                    ? "bg-orange-500 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Year in Sport Hero Banner */}
                <Link
                    to="/year-in-sport"
                    className="group block relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-1"
                >
                    <div className="relative bg-slate-900/90 backdrop-blur rounded-xl p-4 md:p-6 flex items-center justify-between gap-4 overflow-hidden">
                        {/* Background animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl md:text-4xl">
                                🎉
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    Your {new Date().getFullYear()} Year in Sport
                                </h2>
                                <p className="text-sm md:text-base text-slate-300">
                                    See your yearly recap and share your achievements
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all group-hover:translate-x-1 shrink-0">
                            <span className="hidden sm:inline">View Recap</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Summary Cards */}
                <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-300">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        Overview
                    </h2>
                    <SummaryCards summary={summary} loading={summaryLoading} />
                </section>

                {/* Advanced Analytics Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ConsistencyWidget />
                    <TrainingLoadWidget />
                </div>
                <RollingStatsWidget />

                {/* Charts Grid - Stack on mobile, side by side on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sport Breakdown */}
                    <section className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold mb-4 text-slate-300">Activity Breakdown</h3>
                        <SportBreakdownChart data={sportBreakdown} loading={summaryLoading} />
                    </section>

                    {/* Activity Trends */}
                    <section className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold mb-4 text-slate-300">Monthly Trends</h3>
                        <ActivityTrendChart data={trends} loading={trendsLoading} />
                    </section>
                </div>

                {/* Personal Bests */}
                <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-300">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Personal Bests
                    </h2>
                    <PersonalBestCards bests={bests} loading={bestsLoading} />
                </section>

                {/* Disconnect Option */}
                <div className="text-center pt-6">
                    <button
                        onClick={disconnect}
                        className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                    >
                        Disconnect Strava
                    </button>
                </div>
            </main>
        </div>
    );
}
