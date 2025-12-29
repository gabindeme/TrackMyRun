import { SportBreakdown } from "@/interfaces/Activity";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SportBreakdownChartProps {
    data: SportBreakdown[];
    loading: boolean;
}

const COLORS = [
    "#f97316", // orange
    "#3b82f6", // blue
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#eab308", // yellow
];

const sportIcons: Record<string, string> = {
    Run: "🏃",
    Ride: "🚴",
    Swim: "🏊",
    Walk: "🚶",
    Hike: "🥾",
    WeightTraining: "🏋️",
    Yoga: "🧘",
    default: "🏃",
};

export function SportBreakdownChart({ data, loading }: SportBreakdownChartProps) {
    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                No activity data yet. Sync your Strava activities!
            </div>
        );
    }

    const chartData = data.map((item) => ({
        name: item._id,
        value: item.count,
        distance: (item.distance / 1000).toFixed(1),
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${sportIcons[name] || sportIcons.default} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(30, 41, 59, 0.95)",
                            border: "1px solid rgba(100, 116, 139, 0.3)",
                            borderRadius: "0.75rem",
                            color: "#fff",
                        }}
                        formatter={(value: number, name: string, props: any) => [
                            `${value} activities (${props.payload.distance} km)`,
                            sportIcons[name] || sportIcons.default + " " + name,
                        ]}
                    />
                    <Legend
                        formatter={(value) => (
                            <span className="text-slate-300 text-sm">
                                {sportIcons[value] || sportIcons.default} {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
