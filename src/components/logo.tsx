import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20 shrink-0 shadow-sm">
        <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
      </div>
      <span className="text-xl font-black tracking-tighter text-foreground uppercase italic">StudySpark</span>
    </div>
  );
}
