import { YearInSport } from "@/interfaces/Activity";
import { X, Download, Share } from "lucide-react";
import { useRef } from "react";

interface ShareExportProps {
    data: YearInSport;
    year: number;
    onClose: () => void;
}

export function ShareExport({ data, year, onClose }: ShareExportProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const formatDistance = (meters: number) => `${(meters / 1000).toFixed(0)} km`;
    const formatTime = (seconds: number) => `${Math.floor(seconds / 3600)} hours`;

    const handleDownload = async () => {
        // For MVP, we'll use a simple approach - open print dialog
        // In production, you'd use html2canvas or similar
        window.print();
    };

    const handleShare = async () => {
        const shareData = {
            title: `My ${year} Year in Sport`,
            text: `I ran ${formatDistance(data.overall.total_distance)} in ${year}! 🏃 #YearInSport #TrackMyRun`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareData.text);
            alert("Copied to clipboard!");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Share Your Year</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Shareable Card Preview */}
                <div className="p-4">
                    <div
                        ref={cardRef}
                        className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-1"
                    >
                        <div className="bg-slate-900 rounded-xl p-6 text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">My {year} 🏃</h3>
                            <p className="text-slate-400 text-sm mb-6">Year in Sport</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-orange-400">
                                        {formatDistance(data.overall.total_distance)}
                                    </div>
                                    <div className="text-xs text-slate-400">Distance</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {formatTime(data.overall.total_time)}
                                    </div>
                                    <div className="text-xs text-slate-400">Time</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-green-400">
                                        {data.overall.total_activities}
                                    </div>
                                    <div className="text-xs text-slate-400">Activities</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-cyan-400">
                                        {data.overall.total_elevation.toFixed(0)}m
                                    </div>
                                    <div className="text-xs text-slate-400">Elevation</div>
                                </div>
                            </div>

                            <div className="text-xs text-slate-500">
                                TrackMyRun • trackmyrun.app
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-700 flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors min-h-[48px]"
                    >
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors min-h-[48px]"
                    >
                        <Share className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
}
