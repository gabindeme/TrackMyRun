import { PersonalBests, Activity } from "@/interfaces/Activity";
import { Medal, Zap, Mountain, Heart } from "lucide-react";

interface PersonalBestCardsProps {
    bests: PersonalBests | null;
    loading: boolean;
}

function formatDistance(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
}

function formatPace(paceMinPerKm: number): string {
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

interface BestCardProps {
    title: string;
    activity: Activity | null;
    valueFormatter: (activity: Activity) => string;
    icon: React.ElementType;
    color: string;
}

function BestCard({ title, activity, valueFormatter, icon: Icon, color }: BestCardProps) {
    if (!activity) {
        return (
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{title}</span>
                </div>
                <div className="text-slate-600 text-sm">No data yet</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all group">
            <div className={`flex items-center gap-2 ${color} mb-2`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white mb-1">
                {valueFormatter(activity)}
            </div>
            <div className="text-xs text-slate-400 truncate" title={activity.name}>
                {activity.name}
            </div>
            <div className="text-xs text-slate-500">
                {new Date(activity.start_date).toLocaleDateString()}
            </div>
        </div>
    );
}

export function PersonalBestCards({ bests, loading }: PersonalBestCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-800/30 rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-slate-700/50 rounded w-20 mb-3" />
                        <div className="h-8 bg-slate-700/50 rounded w-16 mb-2" />
                        <div className="h-3 bg-slate-700/50 rounded w-24" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <BestCard
                title="Longest Run"
                activity={bests?.longestDistance || null}
                valueFormatter={(a) => formatDistance(a.distance)}
                icon={Medal}
                color="text-yellow-400"
            />
            <BestCard
                title="Fastest Pace"
                activity={bests?.fastestPace || null}
                valueFormatter={(a) => a.pace ? formatPace(a.pace) : "—"}
                icon={Zap}
                color="text-orange-400"
            />
            <BestCard
                title="Most Elevation"
                activity={bests?.highestElevation || null}
                valueFormatter={(a) => `${Math.round(a.total_elevation_gain)}m`}
                icon={Mountain}
                color="text-green-400"
            />
            <BestCard
                title="Longest Duration"
                activity={bests?.longestTime || null}
                valueFormatter={(a) => {
                    const h = Math.floor(a.moving_time / 3600);
                    const m = Math.floor((a.moving_time % 3600) / 60);
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                }}
                icon={Heart}
                color="text-pink-400"
            />
        </div>
    );
}
