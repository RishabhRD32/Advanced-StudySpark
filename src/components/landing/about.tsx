"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import imageData from "@/app/lib/placeholder-images.json";
import { Check, Target, Sparkles } from "lucide-react";

export function About() {
  const [seed, setSeed] = useState<number>(1);

  useEffect(() => {
    // Generate a random seed on refresh
    setSeed(Math.floor(Math.random() * 10000));
  }, []);

  const aboutImage = imageData.images.find(img => img.id === 'about-collaboration');

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 aspect-video animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="w-full h-full animate-3d-float">
              <Image 
                src={`https://picsum.photos/seed/${seed}/600/400`} 
                alt={aboutImage?.alt || "Students learning together"} 
                width={600} 
                height={400} 
                className="object-cover w-full h-full"
                data-ai-hint={aboutImage?.hint || "students collaboration"}
              />
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-1000">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                <Target className="h-4 w-4" /> Built for Success
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Learning Made <span className="text-primary">Simple</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe school should be exciting, not stressful. StudySpark brings everything you need—notes, schedules, and AI help—into one clear place.
              </p>
            </div>
            
            <div className="grid gap-4">
              {[
                "Organize your subjects easily",
                "Get instant help from our AI Tutor",
                "Create a perfect study plan in seconds",
                "Share notes with students worldwide"
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-foreground/80">{text}</span>
                </div>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
              <Sparkles className="h-6 w-6 text-primary shrink-0" />
              <p className="text-sm font-medium text-muted-foreground">
                "Whether you're in school or college, our tools help you save time and get better grades."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
