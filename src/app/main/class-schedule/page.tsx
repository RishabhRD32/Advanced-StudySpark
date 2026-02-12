
"use client";

import React from 'react';
import { useAuth } from "@/lib/auth/use-auth";
import { ClassScheduleView } from "../timetable/components/class-schedule-view";
import { Calendar, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassSchedulePage() {
  const { userProfile } = useAuth();

  if (userProfile?.accessTimetable === false) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 opacity-30 animate-in fade-in zoom-in-95 duration-700">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Access Blocked</h2>
          <p className="font-medium text-lg max-w-md mx-auto leading-relaxed">
            Shared schedules are disabled in your settings.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl border-2 font-bold uppercase tracking-widest">
            <a href="/main/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-24 animate-in fade-in duration-1000">
      <div className="text-center md:text-left space-y-2 border-b-4 border-primary/5 pb-10">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Institutional Sync</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase text-foreground">Class Schedule</h1>
        <p className="text-lg text-muted-foreground font-bold italic opacity-60">Master grid shared by your faculty for code: <span className="text-primary not-italic">{userProfile?.ccCode}</span></p>
      </div>

      <ClassScheduleView ccCode={userProfile?.ccCode} />
      
      <div className="text-center pt-12 opacity-30">
        <p className="text-xs font-bold uppercase tracking-widest">This view is managed by your teacher and is read-only.</p>
      </div>
    </div>
  );
}
