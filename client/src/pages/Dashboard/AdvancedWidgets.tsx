import { useRollingStats, useConsistency, useTrainingLoad } from "@/hooks/useActivities";
import { TrendingUp, Target, Activity, Flame, Award } from "lucide-react";

interface WidgetCardProps {
    title: string;
    icon: React.ReactNode;
    value: string;
    subtitle: string;
    color?: string;
}

function WidgetCard({ title, icon, value, subtitle, color = "orange" }: WidgetCardProps) {
    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
                <div className={`text-${color}-400`}>{icon}</div>
                <span className="text-sm text-slate-400">{title}</span>
            </div>
            <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
    );
}

export function RollingStatsWidget() {
    const { data, loading } = useRollingStats();

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl h-24" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    const stats = data.rolling_7_days;
    const km = (stats.total_distance / 1000).toFixed(1);
    const hours = (stats.total_time / 3600).toFixed(1);

    return (
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-300">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Last 7 Days
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <WidgetCard
                    title="Distance"
                    icon={<Activity className="w-4 h-4" />}
                    value={`${km} km`}
                    subtitle={`${stats.total_activities} activities`}
                    color="blue"
                />
                <WidgetCard
                    title="Time"
                    icon={<Target className="w-4 h-4" />}
                    value={`${hours}h`}
                    subtitle="moving time"
                    color="green"
                />
                <WidgetCard
                    title="Elevation"
                    icon={<TrendingUp className="w-4 h-4" />}
                    value={`${Math.round(stats.total_elevation)}m`}
                    subtitle="climbed"
                    color="amber"
                />
                <WidgetCard
                    title="Kudos"
                    icon={<Award className="w-4 h-4" />}
                    value={stats.total_kudos.toString()}
                    subtitle="received"
                    color="pink"
                />
            </div>
        </div>
    );
}

export function ConsistencyWidget() {
    const { data, loading } = useConsistency();

    if (loading) {
        return (
            <div className="bg-slate-800/50 rounded-xl h-32 animate-pulse" />
        );
    }

    if (!data) return null;

    return (
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-4 border border-purple-700/30">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-300">
                        <Flame className="w-5 h-5" />
                        Consistency
                    </h3>
                    <div className="mt-2">
                        <span className="text-4xl font-bold text-white">{data.consistencyScore}%</span>
                        <span className="text-purple-300 ml-2">consistency score</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">{data.currentStreak}</div>
                    <div className="text-sm text-slate-400">week streak</div>
                    <div className="text-xs text-slate-500 mt-1">Best: {data.longestStreak} weeks</div>
                </div>
            </div>
        </div>
    );
}

export function TrainingLoadWidget() {
    const { data, loading } = useTrainingLoad();

    if (loading) {
        return (
            <div className="bg-slate-800/50 rounded-xl h-32 animate-pulse" />
        );
    }

    if (!data) return null;

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        undertrained: { bg: "from-blue-900/50 to-cyan-900/50", text: "text-blue-400", label: "Low Load" },
        optimal: { bg: "from-green-900/50 to-emerald-900/50", text: "text-green-400", label: "Optimal" },
        elevated: { bg: "from-yellow-900/50 to-amber-900/50", text: "text-yellow-400", label: "Elevated" },
        high_risk: { bg: "from-red-900/50 to-rose-900/50", text: "text-red-400", label: "High Risk" },
    };

    const status = statusColors[data.trainingStatus] || statusColors.optimal;

    return (
        <div className={`bg-gradient-to-r ${status.bg} rounded-2xl p-4 border border-slate-700/30`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-300">
                        <Activity className="w-5 h-5" />
                        Training Load
                    </h3>
                    <div className="mt-2">
                        <span className={`text-2xl font-bold ${status.text}`}>{status.label}</span>
                        <div className="text-sm text-slate-400 mt-1">ACWR: {data.acwr}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-400">Acute (7d)</div>
                    <div className="text-xl font-bold text-white">{data.acuteLoad}</div>
                    <div className="text-sm text-slate-400 mt-2">Chronic (28d avg)</div>
                    <div className="text-lg font-semibold text-slate-300">{data.chronicLoad}</div>
                </div>
            </div>
        </div>
    );
}
