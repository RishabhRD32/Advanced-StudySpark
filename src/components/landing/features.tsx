"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, CalendarDays, Zap, Terminal, Sparkles, Languages, Lightbulb, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "AI Tutor",
    description: "Get instant answers to your questions based on your own notes.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: <Languages className="h-6 w-6" />,
    title: "AI Humanizer",
    description: "Make AI-generated content sound natural, human, and engaging.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Summarizer",
    description: "Turn long chapters into short, easy-to-read points in seconds.",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Note Hub",
    description: "Store all your notes and study materials in one secure folder.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "Smart Schedule",
    description: "A clear view of your classes and exams for the whole week.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Slide Maker",
    description: "Create professional presentation outlines from any study topic.",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: "Coding Help",
    description: "Get help with programming, debugging, and explaining logic.",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Mnemonic Maker",
    description: "Turn complex terms into catchy memory hacks for better recall.",
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "AI Researcher",
    description: "Conduct deep-dive academic inquiry and generate structured reports.",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Everything You Need to <span className="text-primary">Excel</span>
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          StudySpark gives you the best tools to manage your studies and save time.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <Card 
            key={idx} 
            className={cn(
              "group border-2 border-muted hover:border-primary/20 transition-all duration-500 rounded-[2rem] bg-card shadow-sm hover:shadow-2xl hover:-translate-y-2 animate-in fade-in zoom-in-95 fill-mode-both",
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardHeader className="p-8">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500", feature.color)}>
                {feature.icon}
              </div>
              <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-muted-foreground font-medium leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
