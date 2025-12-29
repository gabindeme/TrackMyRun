import { ActivitySummary } from "@/interfaces/Activity";
import { MapPin, Clock, TrendingUp, Activity } from "lucide-react";

interface SummaryCardsProps {
    summary: ActivitySummary | null;
    loading: boolean;
}

function formatDistance(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function formatElevation(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}k m`;
    }
    return `${Math.round(meters)} m`;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
    const cards = [
        {
            label: "Total Distance",
            value: summary ? formatDistance(summary.total_distance) : "—",
            icon: MapPin,
            color: "from-blue-500 to-cyan-500",
        },
        {
            label: "Total Time",
            value: summary ? formatDuration(summary.total_time) : "—",
            icon: Clock,
            color: "from-purple-500 to-pink-500",
        },
        {
            label: "Elevation Gain",
            value: summary ? formatElevation(summary.total_elevation) : "—",
            icon: TrendingUp,
            color: "from-green-500 to-emerald-500",
        },
        {
            label: "Activities",
            value: summary?.total_activities?.toString() || "—",
            icon: Activity,
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="relative overflow-hidden bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50 group hover:border-slate-600/50 transition-all"
                >
                    {/* Gradient Background */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                    />

                    <div className="relative">
                        {/* Icon */}
                        <div
                            className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-3`}
                        >
                            <card.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>

                        {/* Value */}
                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
                            {loading ? (
                                <div className="h-8 bg-slate-700/50 rounded animate-pulse w-20" />
                            ) : (
                                card.value
                            )}
                        </div>

                        {/* Label */}
                        <div className="text-xs md:text-sm text-slate-400">{card.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
