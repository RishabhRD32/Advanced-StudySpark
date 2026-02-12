"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, VolumeX } from "lucide-react";
import Link from 'next/link';

export default function AudioNotesRemovedPage() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
      <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-xl animate-float">
        <VolumeX className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Feature Removed</h1>
        <p className="text-muted-foreground font-bold max-w-sm mx-auto">
          The Audio Notes tool is currently unavailable. Please use the text-based study materials in your subjects.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
        <Link href="/main/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
