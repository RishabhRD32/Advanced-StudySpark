"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Zap, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";

export function Hero() {
  const [seed, setSeed] = useState<number>(1);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 10000));
  }, []);

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden mesh-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />

      <div className="container relative z-10 text-center max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="inline-flex items-center gap-3 px-6 py-2 text-[10px] font-black tracking-[0.3em] uppercase rounded-full bg-primary/10 text-primary border-2 border-primary/20 shadow-xl">
          <Zap className="h-4 w-4 fill-primary animate-bolt" />
          The Easiest Way to Study
        </div>
        <meta name="google-site-verification" content="QdbGJR8rn3lTcpfBEXwMS2tbvhujJNrXUsq36gmB75g" />
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-foreground italic">
            Study <span className="text-primary not-italic">Smarter</span>,<br /> 
            Not Harder.
          </h1>
          <p className="text-xl md:text-3xl font-bold text-muted-foreground/80 max-w-2xl mx-auto leading-tight tracking-tight">
            A simple and powerful tool for students and teachers to organize school life and learn with AI.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
          <Button size="lg" asChild className="h-20 px-16 text-lg font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl hover:scale-105 transition-all group animate-pulse-glow">
            <Link href="/signup">Join Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-20 px-16 text-lg font-black uppercase tracking-[0.2em] rounded-[2rem] border-4 hover:bg-primary/5 transition-all group bg-background">
            <Link href="#features" className="flex items-center">
              Learn More <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-10 pt-8 opacity-50">
           <div className="flex items-center gap-3">
             <CheckCircle2 className="h-5 w-5 text-emerald-500" />
             <span className="text-xs font-black uppercase tracking-widest">Free for Students & Teachers</span>
           </div>
           <div className="flex items-center gap-3">
             <Sparkles className="h-5 w-5 text-primary" />
             <span className="text-xs font-black uppercase tracking-widest">Safe & Private</span>
           </div>
        </div>
      </div>

      <div className="container mt-20 max-w-6xl animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
        <div className="relative rounded-[3rem] md:rounded-[4rem] border-8 border-primary/5 bg-background overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] animate-3d-float">
          <Image
            src={`https://picsum.photos/seed/${seed}/1200/800`}
            alt="StudySpark Dashboard"
            width={1200}
            height={800}
            className="w-full h-auto object-cover opacity-90"
            data-ai-hint="academic dashboard"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
