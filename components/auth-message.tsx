"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function AuthMessage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    const message = searchParams.get("message");
    const error = searchParams.get("error");
    const code = searchParams.get("code");

    useEffect(() => {
        if (message || error) {
            setIsVisible(true);
        }

        // Auto-redirect if code is present (handling the case where redirect_to was root)
        if (code) {
            router.replace(`/auth/callback?code=${code}`);
        }
    }, [message, error, code, router]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-full border shadow-lg backdrop-blur-md ${error ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                }`}>
                {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                <p className="text-sm font-medium">{error || message}</p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-2 hover:bg-black/5 rounded-full p-1 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
