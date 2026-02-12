"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal } from "lucide-react";
import Link from 'next/link';

export default function ApiLabRemovedPage() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
      <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-xl animate-float">
        <Terminal className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Feature Removed</h1>
        <p className="text-muted-foreground font-bold max-w-sm mx-auto">
          The API Diagnostic Lab has been deprecated. All intelligence systems are now monitored automatically.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
        <Link href="/main/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
