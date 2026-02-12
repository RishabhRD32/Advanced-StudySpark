"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function VideoGeneratorRemovedPage() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center opacity-20">
        <ArrowLeft className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Feature Removed</h1>
      <p className="text-muted-foreground font-medium max-w-sm">This AI tool has been disabled. Please use our other study helpers.</p>
      <Button asChild variant="outline" className="rounded-xl border-2 font-bold uppercase tracking-widest">
        <Link href="/main/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}