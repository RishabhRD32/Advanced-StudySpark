"use client"

import { UserPlus, BookPlus, Cpu, GraduationCap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: <UserPlus className="h-8 w-8" />,
    title: "Join Free",
    description: "Create your student or teacher profile in seconds.",
    color: "bg-blue-500",
  },
  {
    icon: <BookPlus className="h-8 w-8" />,
    title: "Add Subjects",
    description: "Organize your classes and track your progress.",
    color: "bg-purple-500",
  },
  {
    icon: <Cpu className="h-8 w-8" />,
    title: "AI Power",
    description: "Use AI to summarize notes and solve problems.",
    color: "bg-amber-500",
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "Succeed",
    description: "Stay consistent and reach your academic goals.",
    color: "bg-emerald-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30 overflow-hidden">
      <div className="container">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Get started in four simple, easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-12 relative">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={cn(
                "relative flex flex-col items-center text-center space-y-6 group animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both",
              )}
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              <div className={`${step.color} w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 hover:rotate-3`}>
                {step.icon}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-[180px] mx-auto leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {idx < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-6 top-12 h-6 w-6 text-muted-foreground/30 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
