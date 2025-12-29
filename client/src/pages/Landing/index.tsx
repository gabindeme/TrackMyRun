import { Link } from "react-router-dom";
import { Activity, BarChart3, Trophy, Share2 } from "lucide-react";

export function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="absolute top-0 inset-x-0 z-10">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold">TrackMyRun</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-slate-300 hover:text-white transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="min-h-screen flex items-center justify-center px-4 pt-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Your Running,{" "}
                        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            Beautifully Tracked
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                        Connect your Strava account and get stunning insights into your running journey.
                        Track your progress, celebrate PRs, and share your Year in Sport.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-[#FC4C02] hover:bg-[#e54402] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                            </svg>
                            Get Started with Strava
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Everything you need to track your runs
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BarChart3,
                                title: "Beautiful Dashboard",
                                description: "See your stats at a glance with stunning visualizations and charts.",
                                color: "from-blue-500 to-cyan-500",
                            },
                            {
                                icon: Trophy,
                                title: "Personal Bests",
                                description: "Track your PRs and celebrate every milestone in your running journey.",
                                color: "from-yellow-500 to-orange-500",
                            },
                            {
                                icon: Share2,
                                title: "Year in Sport",
                                description: "Get a Spotify Wrapped-style summary of your year, ready to share.",
                                color: "from-purple-500 to-pink-500",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to level up your running?
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Join thousands of runners who track their progress with TrackMyRun.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                    >
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-slate-800">
                <div className="container mx-auto text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} TrackMyRun. Built with ❤️ for runners.</p>
                </div>
            </footer>
        </div>
    );
}
