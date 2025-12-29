import { useState, useRef } from "react";
import { useYearInSport } from "@/hooks/useActivities";
import { ChevronLeft, ChevronRight, Share2, Download, Activity } from "lucide-react";
import { StatSlide } from "./StatSlide";
import { InsightSlide } from "./InsightSlide";
import { ShareExport } from "./ShareExport";

export default function YearInSport() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showShare, setShowShare] = useState(false);
    const { data, loading, error } = useYearInSport(year);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0); // Moved before early returns to fix hooks order

    const monthNames = ["", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-purple-300">Loading your year...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl text-white mb-2">No Data Available</h2>
                    <p className="text-slate-400">Sync your Strava activities first!</p>
                </div>
            </div>
        );
    }

    // Build slides from data
    const slides = [
        // Title slide
        {
            type: "title" as const,
            title: `Your ${year}`,
            subtitle: "in Running",
            gradient: "from-orange-500 via-red-500 to-pink-500",
        },
        // Total distance
        {
            type: "stat" as const,
            label: "Total Distance",
            value: `${(data.overall.total_distance / 1000).toFixed(0)}`,
            unit: "kilometers",
            emoji: "🏃",
            gradient: "from-blue-500 via-cyan-500 to-teal-500",
        },
        // Total time
        {
            type: "stat" as const,
            label: "Time Moving",
            value: `${Math.floor(data.overall.total_time / 3600)}`,
            unit: "hours",
            emoji: "⏱️",
            gradient: "from-purple-500 via-violet-500 to-indigo-500",
        },
        // Total activities
        {
            type: "stat" as const,
            label: "Activities Completed",
            value: data.overall.total_activities.toString(),
            unit: "workouts",
            emoji: "💪",
            gradient: "from-green-500 via-emerald-500 to-teal-500",
        },
        // Elevation
        {
            type: "stat" as const,
            label: "Elevation Climbed",
            value: `${(data.overall.total_elevation).toFixed(0)}`,
            unit: "meters",
            emoji: "⛰️",
            gradient: "from-amber-500 via-orange-500 to-red-500",
        },
        // Most active month
        ...(data.mostActiveMonth ? [{
            type: "stat" as const,
            label: "Most Active Month",
            value: monthNames[data.mostActiveMonth.month],
            unit: "was your peak",
            emoji: "📅",
            gradient: "from-pink-500 via-rose-500 to-red-500",
        }] : []),
        // Favorite day
        ...(data.favoriteDay ? [{
            type: "stat" as const,
            label: "Favorite Day",
            value: data.favoriteDay,
            unit: "is your day",
            emoji: "📆",
            gradient: "from-indigo-500 via-purple-500 to-pink-500",
        }] : []),
        // Longest activity
        ...(data.longestActivity ? [{
            type: "stat" as const,
            label: "Longest Run",
            value: `${(data.longestActivity.distance / 1000).toFixed(1)}`,
            unit: "km",
            emoji: "🏅",
            gradient: "from-yellow-500 via-amber-500 to-orange-500",
        }] : []),
        // Kudos received (social engagement)
        ...(data.overall.total_kudos ? [{
            type: "stat" as const,
            label: "Kudos Received",
            value: data.overall.total_kudos.toString(),
            unit: "high fives from friends",
            emoji: "👍",
            gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
        }] : []),
        // Fun insights
        ...data.funInsights.map((insight, i) => ({
            type: "insight" as const,
            text: insight,
            gradient: ["from-cyan-500 via-blue-500 to-purple-500",
                "from-green-500 via-teal-500 to-cyan-500",
                "from-pink-500 via-purple-500 to-indigo-500"][i % 3],
        })),
        // Finale
        {
            type: "title" as const,
            title: "Amazing Year! 🎉",
            subtitle: `See you in ${year + 1}`,
            gradient: "from-orange-500 via-pink-500 to-purple-500",
        },
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    // Touch handling for swipe (touchStartX ref is at top of component)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) nextSlide();
        else if (diff < -50) prevSlide();
    };

    const slide = slides[currentSlide];

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <header className="flex items-center justify-between p-4 z-10">
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-slate-700 min-h-[44px]"
                >
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all min-h-[44px]"
                >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                </button>
            </header>

            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div
                    className={`w-full max-w-md aspect-[9/16] md:aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br ${slide.gradient} p-1`}
                >
                    <div className="w-full h-full bg-slate-900/90 rounded-[1.4rem] flex items-center justify-center p-6 md:p-10">
                        {slide.type === "title" && (
                            <div className="text-center">
                                <h1 className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                                    {slide.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-slate-300">{slide.subtitle}</p>
                            </div>
                        )}
                        {slide.type === "stat" && (
                            <StatSlide
                                label={slide.label}
                                value={slide.value}
                                unit={slide.unit}
                                emoji={slide.emoji}
                                gradient={slide.gradient}
                            />
                        )}
                        {slide.type === "insight" && (
                            <InsightSlide text={slide.text} gradient={slide.gradient} />
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex items-center justify-center gap-4">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all min-w-[44px] min-h-[44px]"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* Progress dots */}
                <div className="flex gap-1.5 overflow-x-auto max-w-[200px] px-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${i === currentSlide
                                ? "bg-white w-6"
                                : "bg-white/30 hover:bg-white/50"
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all min-w-[44px] min-h-[44px]"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </nav>

            {/* Share Modal */}
            {showShare && (
                <ShareExport
                    data={data}
                    year={year}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    );
}
