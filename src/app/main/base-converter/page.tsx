
"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import Link from 'next/link';

export default function BaseConverterMovedPage() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
      <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-xl animate-float">
        <ArrowRightLeft className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Feature Integrated</h1>
        <p className="text-muted-foreground font-bold max-w-sm mx-auto">
          The Base Converter has been merged into the <strong>Metric Matrix</strong> (Unit Converter) for a unified experience.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
        <Link href="/main/unit-converter">Go to Metric Matrix</Link>
      </Button>
    </div>
  );
}
