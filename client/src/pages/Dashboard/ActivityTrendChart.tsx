import { TrendData } from "@/interfaces/Activity";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface ActivityTrendChartProps {
    data: TrendData[];
    loading: boolean;
}

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityTrendChart({ data, loading }: ActivityTrendChartProps) {
    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="w-full h-32 bg-slate-700/30 rounded animate-pulse" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                No trend data yet
            </div>
        );
    }

    const chartData = data.map((item) => ({
        name: item._id.month ? monthNames[item._id.month] : `W${item._id.week}`,
        distance: Number((item.distance / 1000).toFixed(1)),
        activities: item.activities,
        time: Math.round(item.time / 3600), // hours
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}km`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(30, 41, 59, 0.95)",
                            border: "1px solid rgba(100, 116, 139, 0.3)",
                            borderRadius: "0.75rem",
                            color: "#fff",
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === "distance") return [`${value} km`, "Distance"];
                            if (name === "activities") return [value, "Activities"];
                            if (name === "time") return [`${value}h`, "Time"];
                            return [value, name];
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="distance"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#colorDistance)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
