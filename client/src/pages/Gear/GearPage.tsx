import { useGear, useGearStats } from "@/hooks/useGear";
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function GearPage() {
    const { gear, loading, syncing, syncGear } = useGear();
    const { data: stats } = useGearStats();

    const handleSync = async () => {
        try {
            await syncGear();
        } catch {
            // Error handled in hook
        }
    };

    const formatDistance = (meters: number) => {
        return Math.round(meters / 1000).toLocaleString();
    };

    const formatPace = (pace?: number) => {
        if (!pace) return "-";
        const mins = Math.floor(pace);
        const secs = Math.round((pace - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, "0")}/km`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading your gear...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/70 border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-white mt-1">👟 Gear & Equipment</h1>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Syncing..." : "Sync Gear"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Stats Summary */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-3xl font-bold text-white">{stats.totalGear}</div>
                            <div className="text-sm text-slate-400">Total Gear</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-3xl font-bold text-blue-400">{stats.shoesCount}</div>
                            <div className="text-sm text-slate-400">Shoes</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-3xl font-bold text-green-400">{stats.bikesCount}</div>
                            <div className="text-sm text-slate-400">Bikes</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-3xl font-bold text-orange-400">{stats.totalDistance_km.toLocaleString()}</div>
                            <div className="text-sm text-slate-400">Total km</div>
                        </div>
                    </div>
                )}

                {/* Replacement Alerts */}
                {stats && stats.needingReplacement > 0 && (
                    <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 flex items-center gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                            <div className="font-semibold text-amber-400">
                                {stats.needingReplacement} gear item{stats.needingReplacement > 1 ? "s" : ""} may need replacement
                            </div>
                            <div className="text-sm text-slate-400">
                                Check items marked with warning below
                            </div>
                        </div>
                    </div>
                )}

                {/* Gear Grid */}
                {gear.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👟</div>
                        <h2 className="text-xl text-white mb-2">No Gear Found</h2>
                        <p className="text-slate-400 mb-4">
                            Sync your activities to import gear data from Strava
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                        >
                            Sync Gear
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gear.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-slate-800/50 rounded-xl p-5 border transition-all ${item.needs_replacement
                                        ? "border-amber-500/50"
                                        : item.retired
                                            ? "border-slate-700/30 opacity-60"
                                            : "border-slate-700/50"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">
                                            {item.gear_type === "shoes" ? "👟" : item.gear_type === "bike" ? "🚴" : "⚙️"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                            <div className="text-sm text-slate-400 capitalize">{item.gear_type}</div>
                                        </div>
                                    </div>
                                    {item.needs_replacement ? (
                                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    ) : !item.retired ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Distance</span>
                                        <span className="text-white font-medium">
                                            {formatDistance(item.distance)} km
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Activities</span>
                                        <span className="text-white">{item.total_activities}</span>
                                    </div>
                                    {item.average_pace && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Avg Pace</span>
                                            <span className="text-white">{formatPace(item.average_pace)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar for replacement threshold */}
                                {item.distance_alert_threshold && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Usage</span>
                                            <span>{Math.round((item.distance / item.distance_alert_threshold) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${item.needs_replacement
                                                        ? "bg-amber-500"
                                                        : item.distance / item.distance_alert_threshold > 0.8
                                                            ? "bg-yellow-500"
                                                            : "bg-green-500"
                                                    }`}
                                                style={{
                                                    width: `${Math.min(100, (item.distance / item.distance_alert_threshold) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {item.retired && (
                                    <div className="mt-3 text-sm text-slate-500 italic">Retired</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
