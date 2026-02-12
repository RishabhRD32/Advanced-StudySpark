import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { BookOpen, Target, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <section className="py-24 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-5xl font-black tracking-tighter">Our <span className="text-primary">Mission</span></h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Helping students and teachers work better together with simple, powerful AI tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: <Target className="h-8 w-8 text-primary" />,
                  title: "Our Goal",
                  description: "To build a simple place where students and teachers can manage their school work with zero stress."
                },
                {
                  icon: <Users className="h-8 w-8 text-primary" />,
                  title: "Community",
                  description: "Helping a global community of learners share notes and succeed together through our public library."
                },
                {
                  icon: <BookOpen className="h-8 w-8 text-primary" />,
                  title: "Smart Learning",
                  description: "Using the latest AI to help you summarize notes and get instant tutoring when you're stuck."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8 text-primary" />,
                  title: "Private & Safe",
                  description: "Your school data is protected by the best security, ensuring a private and safe place to learn."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-background border-2 shadow-sm space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 container max-w-4xl prose dark:prose-invert">
          <h2 className="text-3xl font-black tracking-tight mb-8">How it Works</h2>
          <div className="space-y-8 font-medium text-muted-foreground">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">1. Your Dashboard</h3>
              <p>Everything you need is in one place: your class schedule, to-do list, and important dates. It tracks your study time automatically.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">2. AI Help</h3>
              <p>Our AI tools connect directly to your notes. The AI Tutor uses your own study material to give you the most accurate answers.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">3. Resource Folders</h3>
              <p>Keep your subjects organized in simple folders. Each folder holds your notes, practical work, and old exam papers.</p>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
