import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { Activity } from "lucide-react";

export function StravaCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthUser } = useAuthContext();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                setStatus("error");
                setErrorMessage("Strava authorization was denied");
                return;
            }

            if (!code) {
                setStatus("error");
                setErrorMessage("No authorization code received");
                return;
            }

            try {
                // Send code to backend for processing
                const response = await axiosConfig.post("/auth/login/strava/callback", { code });

                // Store token and user
                localStorage.setItem("accessToken", response.data.accessToken);
                setAuthUser(response.data.user);

                // Redirect to dashboard
                navigate("/dashboard", { replace: true });
            } catch (err: any) {
                setStatus("error");
                setErrorMessage(err.response?.data?.error || "Failed to complete Strava login");
            }
        };

        handleCallback();
    }, [searchParams, navigate, setAuthUser]);

    if (status === "error") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">✕</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Login Failed</h1>
                    <p className="text-slate-400 mb-6">{errorMessage}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-6">
                    <Activity className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Connecting to Strava...</h1>
                <p className="text-slate-400">Please wait while we complete your login</p>
                <div className="mt-6">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        </div>
    );
}
