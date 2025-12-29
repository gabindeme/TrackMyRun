import { useHRZones, useComparisons } from "@/hooks/useActivities";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, Minus, Heart, TrendingUp, Calendar } from "lucide-react";

export default function AnalyticsPage() {
    const { data: hrData, loading: hrLoading } = useHRZones();
    const { data: compareData, loading: compareLoading } = useComparisons();

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const ChangeIndicator = ({ change }: { change: number }) => {
        if (change > 0) {
            return (
                <span className="flex items-center gap-1 text-green-400">
                    <ArrowUp className="w-4 h-4" />
                    +{change}%
                </span>
            );
        } else if (change < 0) {
            return (
                <span className="flex items-center gap-1 text-red-400">
                    <ArrowDown className="w-4 h-4" />
                    {change}%
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-4 h-4" />
                0%
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/70 border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-1">📊 Advanced Analytics</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-8">
                {/* Year Comparison */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-white">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Year-over-Year Comparison
                    </h2>

                    {compareLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bg-slate-800/50 rounded-xl h-28 animate-pulse" />
                            ))}
                        </div>
                    ) : compareData ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Distance</div>
                                <div className="text-xl font-bold text-white">
                                    {Math.round(compareData.comparison.distance.current / 1000)} km
                                </div>
                                <ChangeIndicator change={compareData.comparison.distance.change} />
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Time</div>
                                <div className="text-xl font-bold text-white">
                                    {formatTime(compareData.comparison.time.current)}
                                </div>
                                <ChangeIndicator change={compareData.comparison.time.change} />
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Activities</div>
                                <div className="text-xl font-bold text-white">
                                    {compareData.comparison.activities.current}
                                </div>
                                <ChangeIndicator change={compareData.comparison.activities.change} />
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Elevation</div>
                                <div className="text-xl font-bold text-white">
                                    {Math.round(compareData.comparison.elevation.current)} m
                                </div>
                                <ChangeIndicator change={compareData.comparison.elevation.change} />
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Kudos</div>
                                <div className="text-xl font-bold text-white">
                                    {compareData.comparison.kudos.current}
                                </div>
                                <ChangeIndicator change={compareData.comparison.kudos.change} />
                            </div>
                        </div>
                    ) : null}

                    {compareData && (
                        <p className="text-sm text-slate-500 mt-2">
                            Comparing {compareData.currentYear} vs {compareData.previousYear}
                        </p>
                    )}
                </section>

                {/* HR Zones */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-white">
                        <Heart className="w-5 h-5 text-red-400" />
                        Heart Rate Zones
                    </h2>

                    {hrLoading ? (
                        <div className="bg-slate-800/50 rounded-xl h-64 animate-pulse" />
                    ) : hrData && hrData.zones.length > 0 ? (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="space-y-4">
                                {hrData.zones.map((zone) => (
                                    <div key={zone.zone} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white font-medium">{zone.name}</span>
                                            <span className="text-slate-400">
                                                {zone.minHR}-{zone.maxHR} bpm • {formatTime(zone.totalTime)} • {zone.activities} activities
                                            </span>
                                        </div>
                                        <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${zone.zone === 1 ? "bg-blue-500" :
                                                        zone.zone === 2 ? "bg-green-500" :
                                                            zone.zone === 3 ? "bg-yellow-500" :
                                                                zone.zone === 4 ? "bg-orange-500" :
                                                                    "bg-red-500"
                                                    }`}
                                                style={{ width: `${zone.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 text-right">{zone.percentage}%</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between text-sm text-slate-400">
                                <span>Based on {hrData.totalActivitiesWithHR} activities with HR data</span>
                                <span>Max HR: {hrData.maxHRUsed} bpm</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
                            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No heart rate data available</p>
                            <p className="text-sm text-slate-500">Record activities with a HR monitor to see zone analysis</p>
                        </div>
                    )}
                </section>

                {/* Navigation Links */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/gear"
                        className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl p-4 border border-amber-700/30 hover:border-amber-500/50 transition-all"
                    >
                        <div className="text-2xl mb-2">👟</div>
                        <div className="font-semibold text-white">Gear Analytics</div>
                        <div className="text-sm text-slate-400">Track equipment usage</div>
                    </Link>
                    <Link
                        to="/year-in-sport"
                        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700/30 hover:border-purple-500/50 transition-all"
                    >
                        <div className="text-2xl mb-2">🎉</div>
                        <div className="font-semibold text-white">Year in Sport</div>
                        <div className="text-sm text-slate-400">Your yearly recap</div>
                    </Link>
                    <Link
                        to="/dashboard"
                        className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-4 border border-blue-700/30 hover:border-blue-500/50 transition-all"
                    >
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-semibold text-white">Dashboard</div>
                        <div className="text-sm text-slate-400">Training overview</div>
                    </Link>
                </section>
            </main>
        </div>
    );
}
