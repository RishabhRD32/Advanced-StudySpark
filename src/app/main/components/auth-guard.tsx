"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Zap } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.replace("/");
    }
  }, [user, loading, isLoggingOut, router]);

  if (loading || isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-colors duration-500">
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Zap className="h-16 w-16 text-primary animate-bolt relative z-10 fill-primary/20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-black tracking-[0.3em] uppercase text-primary">
              {isLoggingOut ? "Logging Out..." : "Authenticating..."}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              {isLoggingOut ? "Securing your session and refreshing neural data" : "Synchronizing academic workspace"}
            </p>
            {isLoggingOut && (
              <div className="mt-4 flex items-center justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}