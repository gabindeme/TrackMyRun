import { Activity } from "lucide-react";

interface StravaConnectProps {
    onConnect: () => void;
}

export function StravaConnect({ onConnect }: StravaConnectProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
                        <Activity className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        TrackMyRun
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Your personal running analytics dashboard
                    </p>
                </div>

                {/* Features */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Connect with Strava to unlock:
                    </h2>
                    <ul className="space-y-3 text-left">
                        {[
                            "📊 Beautiful performance dashboards",
                            "📈 Track your progress over time",
                            "🏆 Personal bests & achievements",
                            "🎉 Spotify Wrapped-style Year in Sport",
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <span className="text-lg">{feature.slice(0, 2)}</span>
                                <span>{feature.slice(3)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Connect Button */}
                <button
                    onClick={onConnect}
                    className="w-full py-4 px-6 bg-[#FC4C02] hover:bg-[#e54402] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 min-h-[56px]"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connect with Strava
                </button>

                <p className="text-xs text-slate-500 mt-4">
                    We only request read access to your activities.
                    Your data stays private and secure.
                </p>
            </div>
        </div>
    );
}
