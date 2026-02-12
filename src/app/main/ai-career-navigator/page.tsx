"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Compass, Map, Target, Zap, ArrowRight, Briefcase, Sparkles, Download, Activity, Cpu, Globe, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { navigateCareer, CareerNavigatorOutput } from '@/ai/flows/career-navigator-flow';
import { useToast } from '@/hooks/use-toast';
import { useWebLLM } from '@/hooks/use-web-llm';
import { Badge } from '@/components/ui/badge';
import { useSubjects } from '@/hooks/use-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { downloadObjectAsPDF } from "@/lib/download-utils";
import { useAuth } from '@/lib/auth/use-auth';

const careerSchema = z.object({
  subjectIds: z.array(z.string()).min(1, "Pick at least one subject."),
  interests: z.string().min(5, "Tell us a bit about what you enjoy."),
  goal: z.string().optional(),
});

export default function CareerNavigatorPage() {
  const { userProfile } = useAuth();
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [result, setResult] = useState<CareerNavigatorOutput | null>(null);
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof careerSchema>>({
    resolver: zodResolver(careerSchema),
    defaultValues: { subjectIds: [], interests: "", goal: "" },
  });

  async function onSubmit(values: z.infer<typeof careerSchema>) {
    setResult(null);
    setIsGenerating(true);
    
    const selectedTitles = subjects
      .filter(s => values.subjectIds.includes(s.id))
      .map(s => s.title);

    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const data = await navigateCareer({
          subjects: selectedTitles,
          interests: values.interests,
          goal: values.goal,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult(data);
        toast({ title: "Roadmap Generated", description: `Cloud advisor has mapped your future via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'AI'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Provider Logic Error", 
          description: error.message || "Cloud hub is overwhelmed. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Analyze these subjects: ${selectedTitles.join(', ')}. Interests: ${values.interests}. Goal: ${values.goal}. Suggest 3 career paths with 4 milestones each. Provide a strategy analysis.`,
          "You are an elite academic and career advisor."
        );
        if (response) {
          // Simplified local output for PDF and UI
          setResult({
            analysis: response.split('Career Path')[0].trim(),
            suggestedCareers: [
              { title: "Suggested Path", description: response, milestones: ["Research specific roles", "Build relevant skills", "Network", "Apply"] }
            ]
          });
          toast({ title: "Local Roadmap Ready", description: "Career logic generated locally." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Neural Error", description: "Local inference failed." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownload = () => {
    if (!result) return;
    const sections = [
      { title: "Strategy Analysis", content: result.analysis },
      ...(result?.suggestedCareers || []).map((c, i) => ({
        title: `Pathway ${i + 1}: ${c.title}`,
        content: [c.description, "Milestones:", ...(c.milestones || []).map(m => `• ${m}`)]
      }))
    ];
    downloadObjectAsPDF("AI Career Roadmap", sections, "My_Career_Guide");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Compass className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Career Navigator</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Map your academic subjects to real-world professions via Cloud or Local hardware.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Profile Configuration</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="subjectIds" render={() => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Select Relevant Subjects</FormLabel>
                    {subjectsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <Activity className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">Syncing subjects...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                        {subjects.map((subject) => (
                          <FormField key={subject.id} control={form.control} name="subjectIds" render={({ field }) => (
                            <FormItem key={subject.id} className={cn(
                              "flex flex-row items-center space-x-3 space-y-0 rounded-xl border-2 p-3 transition-all cursor-pointer",
                              field.value?.includes(subject.id) ? "border-primary bg-primary/10" : "hover:bg-muted/50"
                            )}>
                              <FormControl>
                                <Checkbox 
                                  checked={field.value?.includes(subject.id)} 
                                  onCheckedChange={(checked) => {
                                    return checked 
                                      ? field.onChange([...field.value, subject.id]) 
                                      : field.onChange(field.value?.filter((v) => v !== subject.id))
                                  }} 
                                />
                              </FormControl>
                              <FormLabel className="font-bold text-xs cursor-pointer truncate">{subject.title}</FormLabel>
                            </FormItem>
                          )}/>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="interests" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">What excites you?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Building apps, solving environmental issues..." className="resize-none font-bold border-2 rounded-2xl bg-background min-h-[100px] shadow-inner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="goal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ultimate Career Goal (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CTO of a Startup" {...field} className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Mapping...'}</>
                  ) : (
                    <><Map className="mr-3 h-5 w-5" /> Generate Roadmap</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {offlineLoading && !isReady && !isCloudMode && (
          <Card className="border-2 border-primary/20 bg-primary/5 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
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

        {(isGenerating || result) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] bg-card/20 backdrop-blur-xl rounded-[3rem] p-10 overflow-hidden relative">
              <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-primary/5 rotate-12" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  {isCloudMode ? <Globe className="h-8 w-8 text-primary" /> : <Cpu className="h-8 w-8 text-primary" />}
                  <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary">AI Strategic Analysis</h3>
                </div>
                {result && (
                  <Button onClick={handleDownload} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest bg-background">
                    <Download className="mr-2 h-4 w-4" /> Save PDF
                  </Button>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {isGenerating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                        <Brain className="h-14 w-14 text-primary animate-bounce relative z-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">Architecting Roadmap</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Analyzing academic alignment and professional goals...</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full rounded-full" />
                      <Skeleton className="h-6 w-5/6 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold leading-relaxed tracking-tight text-foreground/80 italic relative z-10">
                    "{result?.analysis}"
                  </p>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-8">
              {isGenerating ? (
                <Card className="p-10 border-2 rounded-[2.5rem] bg-muted/10">
                  <div className="space-y-6">
                    <Skeleton className="h-10 w-1/3 rounded-full" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                </Card>
              ) : result?.suggestedCareers?.map((career, idx) => (
                <Card key={idx} className="glass-card hover:border-primary/50 group border-2">
                  <CardHeader className="bg-primary/5 border-b p-8">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="font-black uppercase text-[10px] tracking-widest px-4">Pathway {idx + 1}</Badge>
                      <Briefcase className="h-6 w-6 text-primary group-hover:scale-125 transition-transform" />
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter leading-none group-hover:text-primary transition-colors">
                      {career.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <p className="text-lg font-bold text-muted-foreground leading-relaxed whitespace-pre-wrap">{career.description}</p>
                    
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-b pb-2">Critical Milestones</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(career.milestones || []).map((milestone, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-4 p-5 rounded-2xl bg-background border-2 group/milestone hover:bg-primary/[0.03] transition-all shadow-sm">
                            <ArrowRight className="h-4 w-4 text-primary group/milestone:translate-x-2 transition-transform" />
                            <span className="font-black text-sm tracking-tight">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
