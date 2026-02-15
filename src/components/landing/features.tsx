"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, CalendarDays, Zap, Terminal, Sparkles, Languages, Lightbulb, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <BrainCircuit className="h-7 w-7" />,
    title: "AI Tutor",
    description: "Get instant answers to your questions based on your own notes.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: <Languages className="h-7 w-7" />,
    title: "AI Humanizer",
    description: "Make AI-generated content sound natural, human, and engaging.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "Summarizer",
    description: "Turn long chapters into short, easy-to-read points in seconds.",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: "Note Hub",
    description: "Store all your notes and study materials in one secure folder.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: <CalendarDays className="h-7 w-7" />,
    title: "Smart Schedule",
    description: "A clear view of your classes and exams for the whole week.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: "AI Slide Maker",
    description: "Create professional presentation outlines from any study topic.",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: <Terminal className="h-7 w-7" />,
    title: "Coding Help",
    description: "Get help with programming, debugging, and explaining logic.",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: <Lightbulb className="h-7 w-7" />,
    title: "Mnemonic Maker",
    description: "Turn complex terms into catchy memory hacks for better recall.",
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    icon: <Search className="h-7 w-7" />,
    title: "AI Researcher",
    description: "Conduct deep-dive academic inquiry and generate structured reports.",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-32">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
          Everything You Need to <span className="text-primary">Excel</span>
        </h2>
        <p className="text-xl text-muted-foreground font-bold opacity-60 tracking-tight">
          StudySpark gives you the best tools to manage your studies and save time.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <Card 
            key={idx} 
            className={cn(
              "group border-4 border-primary/5 hover:border-primary/20 transition-all duration-500 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl hover:-translate-y-3 animate-in fade-in zoom-in-95 fill-mode-both",
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardHeader className="p-10">
              <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border-4 border-primary/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner", feature.color)}>
                {feature.icon}
              </div>
              <CardTitle className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <p className="text-lg text-muted-foreground font-medium leading-relaxed italic opacity-80">
                "{feature.description}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
