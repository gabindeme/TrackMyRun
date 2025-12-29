import { Button } from "@/components/ui/button";

interface StravaOAuthProps {
    message?: string;
}

export function StravaOAuth({ message = "Continue with Strava" }: StravaOAuthProps) {
    const handleStravaAuth = () => {
        // Redirect to backend Strava auth endpoint
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login/strava`;
    };

    return (
        <Button
            type="button"
            onClick={handleStravaAuth}
            className="flex items-center w-full gap-3 px-4 py-2 text-white bg-[#FC4C02] hover:bg-[#e54402] border-0"
        >
            <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <span className="font-medium">{message}</span>
        </Button>
    );
}
