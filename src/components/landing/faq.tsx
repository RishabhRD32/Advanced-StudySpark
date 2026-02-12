"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "IS STUDYSPARK FREE TO USE?",
    answer: "Yes! We offer a robust free tier that includes access to all core dashboard features and standard AI tool usage.",
    highlight: false
  },
  {
    question: "HOW DOES THE AI TUTOR WORK?",
    answer: "Our AI Tutor uses Google's Gemini model to analyze your study notes and give you clear, instant explanations for any question.",
    highlight: false
  },
  {
    question: "CAN TEACHERS REALLY GENERATE LESSON PLANS?",
    answer: "Absolutely. Teachers can input a topic and grade level, and the AI will create a full lesson plan with goals and schedules.",
    highlight: true
  },
  {
    question: "IS MY STUDY DATA SECURE?",
    answer: "We take privacy seriously. Your data is stored securely using Firebase and is only accessible by you or shared if you choose to make it public.",
    highlight: false
  },
  {
    question: "DO I NEED TO DOWNLOAD ANY SOFTWARE?",
    answer: "No, StudySpark works in any web browser on your phone, tablet, or computer. Just log in and start studying.",
    highlight: false
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-background relative overflow-hidden border-t">
      <div className="container max-w-4xl relative z-10">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Questions? <span className="text-primary">Answers.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Everything you need to know about StudySpark.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem 
              key={idx} 
              value={`item-${idx}`} 
              className="border-2 border-muted px-6 py-1 hover:border-primary/20 transition-all rounded-2xl bg-card animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <AccordionTrigger className={cn(
                "text-left text-lg md:text-xl font-bold hover:no-underline py-6 uppercase tracking-tight",
                faq.highlight ? "text-primary" : "text-foreground"
              )}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base font-medium pb-6 border-t pt-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)] pointer-events-none" />
    </section>
  );
}
