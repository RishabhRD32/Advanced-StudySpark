"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Zap, ChevronRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  const [seed, setSeed] = useState<number>(1);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 10000));
  }, []);

  return (
    <section className="relative container min-h-[80vh] flex flex-col lg:flex-row items-center py-16 gap-12 overflow-hidden">
      <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-tight uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          <Zap className="h-3 w-3 fill-primary animate-bolt" />
          The Easiest Way to Study
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-foreground">
            Study <span className="text-primary">Smarter</span>,<br /> Not Harder.
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-xl mx-auto lg:mx-0">
            A simple and powerful tool for students and teachers to organize school life and learn with AI.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <Button size="lg" asChild className="h-14 px-10 text-base font-bold rounded-2xl shadow-xl hover:scale-105 transition-all group animate-pulse-glow">
            <Link href="/signup">Join Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-14 px-10 text-base font-bold rounded-2xl border-2 hover:bg-primary/5 transition-all group">
            <Link href="#features" className="flex items-center">
              Learn More <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 opacity-70">
           <div className="flex items-center gap-2">
             <CheckCircle2 className="h-5 w-5 text-emerald-500" />
             <span className="text-sm font-bold">Free for Students & Teachers</span>
           </div>
           <div className="flex items-center gap-2">
             <CheckCircle2 className="h-5 w-5 text-emerald-500" />
             <span className="text-sm font-bold">Safe & Private</span>
           </div>
        </div>
      </div>

      <div className="flex-1 relative w-full max-w-[600px] mx-auto animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
        <div className="relative rounded-[2rem] border-4 border-primary/10 bg-card overflow-hidden shadow-2xl animate-3d-float">
          <Image
            src={`https://picsum.photos/seed/${seed}/800/600`}
            alt="StudySpark Dashboard"
            width={800}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint="academic dashboard"
            priority
          />
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
