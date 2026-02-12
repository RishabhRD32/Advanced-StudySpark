"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  Presentation, 
  Clock, 
  CheckCircle2, 
  ListChecks, 
  BookOpen, 
  Download, 
  Zap, 
  Activity, 
  Cpu, 
  Globe, 
  X,
  Brain
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { downloadObjectAsPDF } from "@/lib/download-utils";
import { useToast } from "@/hooks/use-toast";
import { useWebLLM } from '@/hooks/use-web-llm';
import { generateLessonPlan, LessonPlanOutput } from '@/ai/flows/lesson-planner-flow';
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';

const lessonPlanSchema = z.object({
  topic: z.string().min(3, "Please provide a more descriptive topic."),
  gradeLevel: z.string().min(1, "Grade level is required."),
  duration: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Duration must be a positive number."),
});

export default function LessonPlannerPage() {
  const { userProfile } = useAuth();
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlanOutput | null>(null);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof lessonPlanSchema>>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: { topic: "", gradeLevel: "", duration: "45" },
  });

  async function onSubmit(values: z.infer<typeof lessonPlanSchema>) {
    setPlan(null);
    setIsGenerating(true);
    
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await generateLessonPlan({
          topic: values.topic,
          gradeLevel: values.gradeLevel,
          duration: Number(values.duration),
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setPlan(res);
        toast({ title: "Cloud Blueprint Ready", description: `Lesson generated via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'AI'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Provider Logic Error", 
          description: error.message || "Cloud hub is unreachable. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      // Real Local Neural Hardware Mode
      try {
        const response = await generate(
          `Create a professional lesson plan for: ${values.topic}. Grade Level: ${values.gradeLevel}. Duration: ${values.duration} minutes. Return a structured breakdown including learning objectives, required materials, a timed schedule (time, activity, description), and an assessment strategy.`,
          "You are an elite academic curriculum designer and pedagogical expert."
        );
        
        if (response) {
          // Attempt to parse JSON if the local model provided it, else format the raw text
          try {
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);
            setPlan(data);
          } catch (e) {
            setPlan({
              title: values.topic,
              objectives: ["Analyze core principles of the subject", "Apply theoretical knowledge to practical scenarios"],
              materialsNeeded: ["Textbook", "Presentation Slides", "Whiteboard"],
              schedule: [
                { time: "0-10m", activity: "Introduction", description: response.substring(0, 300) + "..." },
                { time: "10-30m", activity: "Detailed Instruction", description: "Deep dive into topic specifics." },
                { time: "30-45m", activity: "Review", description: "Wrap up and Q&A." }
              ],
              assessment: "Reflective summary and discussion."
            });
          }
          toast({ title: "Neural Blueprint Ready", description: "Lesson generated locally via hardware." });
        }
      } catch (error) { 
        toast({ variant: "destructive", title: "Hardware Error", description: "Local neural engine failed to initialize." });
      } finally { 
        setIsGenerating(false); 
      }
    }
  }

  const handleDownload = () => {
    if (!plan) return;
    const sections = [
      { title: "Grade & Duration", content: `${form.getValues('gradeLevel')} • ${form.getValues('duration')} mins` },
      { title: "Objectives", content: plan.objectives || [] },
      { title: "Materials", content: plan.materialsNeeded || [] },
      { title: "Schedule", content: (plan.schedule || []).map(s => `${s.time}: ${s.activity} - ${s.description}`) },
      { title: "Assessment", content: plan.assessment || 'N/A' }
    ];
    downloadObjectAsPDF(`Lesson Plan: ${plan.title}`, sections, "Lesson_Plan");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Presentation className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Blueprint Maker</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Create professional timed pedagogical blueprints via Cloud or Local hardware.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden max-w-3xl mx-auto w-full transition-all hover:border-primary/20">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Lesson Configuration</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="topic" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject Topic</FormLabel>
                      <FormControl><Input placeholder="e.g. Cloud Computing" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="gradeLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Grade</FormLabel>
                      <FormControl><Input placeholder="e.g. Undergraduate 1st year" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instructional Time (Minutes)</FormLabel>
                    <FormControl><Input type="number" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  {isLoading ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Calibrating Blueprint...'}</>
                  ) : (
                    <><Presentation className="mr-3 h-5 w-5" /> Blueprint Lesson</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {offlineLoading && !isReady && !isCloudMode && (
          <Card className="border-2 border-primary/20 bg-primary/5 p-6 rounded-3xl max-w-3xl mx-auto w-full animate-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                  <Cpu className="h-4 w-4 animate-spin" /> Preparing Neural Engine...
                </div>
                <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        {(isGenerating || plan) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="border-4 shadow-2xl border-primary/10 overflow-hidden rounded-[3rem] bg-background">
              <CardHeader className="bg-primary/5 border-b p-10 flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {isCloudMode ? <Globe className="h-4 w-4 text-primary" /> : <Cpu className="h-4 w-4 text-primary" />}
                    <Badge className="w-fit font-black uppercase tracking-widest px-4">{isCloudMode ? (userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud Intelligence') : 'Local Hardware Inference'}</Badge>
                  </div>
                  {isGenerating ? <Skeleton className="h-12 w-64 rounded-full" /> : <CardTitle className="text-5xl font-black tracking-tight">{plan?.title}</CardTitle>}
                </div>
                {plan && (
                  <Button onClick={handleDownload} variant="outline" className="h-14 px-8 rounded-2xl border-4 font-bold uppercase text-[10px] tracking-widest bg-background shadow-lg hover:bg-primary/5">
                    <Download className="mr-2 h-5 w-5" /> Save PDF Blueprint
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                {isGenerating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
                        <Brain className="h-16 w-16 text-primary animate-bounce relative z-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Pedagogical Synthesis</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Designing timed slots and learning objectives...</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <Skeleton className="h-48 w-full rounded-[2rem]" />
                      <Skeleton className="h-48 w-full rounded-[2rem]" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary/10 pb-3">
                          <ListChecks className="h-5 w-5" /> Learning Objectives
                        </div>
                        <ul className="space-y-4">
                          {(plan?.objectives || []).map((obj, i) => (
                            <li key={i} className="flex gap-3 items-start text-lg font-bold leading-tight">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary/10 pb-3">
                          <BookOpen className="h-5 w-5" /> Materials Required
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(plan?.materialsNeeded || []).map((mat, i) => (
                            <Badge key={i} variant="secondary" className="border-2 border-primary/10 font-black uppercase text-[10px] px-4 py-2 rounded-full bg-primary/5 text-primary">
                              {mat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary/10 pb-3">
                        <Clock className="h-5 w-5" /> Timed Lesson Structure
                      </div>
                      <div className="space-y-4">
                        {(plan?.schedule || []).map((slot, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-3xl bg-muted/20 border-2 border-transparent hover:border-primary/20 transition-all group shadow-sm">
                            <div className="md:w-40 shrink-0">
                              <Badge className="h-12 w-full font-black text-sm tabular-nums rounded-xl bg-primary text-white shadow-xl">
                                {slot.time}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="font-black text-2xl leading-none group-hover:text-primary transition-colors">{slot.activity}</p>
                              <p className="text-lg font-medium text-muted-foreground leading-relaxed">{slot.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-10 border-t-4 border-dashed">
                      <div className="p-10 rounded-[2.5rem] bg-primary/5 border-4 border-primary/10 shadow-inner relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 h-20 w-20 text-primary/5 rotate-12" />
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                          <Zap className="h-4 w-4" /> Assessment Metric
                        </p>
                        <p className="font-bold text-2xl leading-relaxed italic text-foreground/80">"{plan?.assessment}"</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
