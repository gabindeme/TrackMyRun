import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";
import { axiosConfig } from "@/config/axiosConfig";
import { Activity } from "lucide-react";

/**
 * Auth callback page that receives JWT token from URL and stores it
 * Used after OAuth login flows (Strava, etc.)
 */
export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthUser } = useAuthContext();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get("token");
            console.log("[AuthCallback] Token from URL:", token?.substring(0, 20) + "...");

            if (!token) {
                // No token, redirect to login
                console.log("[AuthCallback] No token found, redirecting to login");
                navigate("/login?error=no_token", { replace: true });
                return;
            }

            // Store the token
            localStorage.setItem("accessToken", token);
            console.log("[AuthCallback] Token stored in localStorage");

            // Fetch the user data using the new token
            try {
                console.log("[AuthCallback] Fetching user data...");
                const response = await axiosConfig.get("/auth/me");
                console.log("[AuthCallback] User data received:", response.data?.email);
                setAuthUser(response.data);

                // Small delay to ensure state is updated
                setTimeout(() => {
                    console.log("[AuthCallback] Navigating to dashboard");
                    navigate("/dashboard", { replace: true });
                }, 100);
            } catch (error) {
                console.error("[AuthCallback] Failed to fetch user:", error);
                localStorage.removeItem("accessToken");
                navigate("/login?error=auth_failed", { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, navigate, setAuthUser]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-6">
                    <Activity className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Logging you in...</h1>
                <p className="text-slate-400">Please wait</p>
                <div className="mt-6">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        </div>
    );
}
