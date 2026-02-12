"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { MonitorPlay, ListChecks, Image as ImageIcon, Download, Zap, Activity, Cpu, Globe, Brain, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { downloadObjectAsPDF, downloadPresentationAsPPTX } from "@/lib/download-utils";
import { generatePresentation } from '@/ai/flows/ppt-generator-flow';
import { useToast } from '@/hooks/use-toast';
import { useWebLLM } from '@/hooks/use-web-llm';
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';

const pptSchema = z.object({
  topic: z.string().min(5, "Topic must be descriptive."),
  audience: z.string().min(3, "Please specify an audience."),
  count: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 3, "Minimum 3 slides."),
});

type Slide = {
  title: string;
  content: string[];
  visualSuggestion: string;
};

export default function PPTGeneratorPage() {
  const { userProfile } = useAuth();
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; slides: Slide[] } | null>(null);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pptSchema>>({
    resolver: zodResolver(pptSchema),
    defaultValues: { topic: "", audience: "Students", count: "5" },
  });

  async function onSubmit(values: z.infer<typeof pptSchema>) {
    setResult(null);
    setIsGenerating(true);
    
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await generatePresentation({
          topic: values.topic,
          targetAudience: values.audience,
          slideCount: Number(values.count),
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult(res);
        toast({ title: "Cloud Design Ready", description: `Slide blueprint generated via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'AI'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Cloud Hub is congested. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      // Algorithmic Offline Implementation for speed
      try {
        const topic = values.topic;
        const slides: Slide[] = [
          { 
            title: `Intro: ${topic}`, 
            content: [`Defining the core principles of ${topic}`, `Why this matters to ${values.audience}`, "Historical context overview"],
            visualSuggestion: `A high-impact header image related to ${topic}`
          },
          { 
            title: "Theoretical Framework", 
            content: ["Foundational rules and laws", "Mathematical or structural components", "Academic source overview"],
            visualSuggestion: "A structured flow-chart or diagram"
          },
          { 
            title: "Practical Case Study", 
            content: ["Real-world application example", "Data analysis and results", "Overcoming common challenges"],
            visualSuggestion: "A bar-chart or comparison table"
          },
          { 
            title: "Critical Analysis", 
            content: ["Strengths and limitations", "Impact on modern industry", "Expert perspectives"],
            visualSuggestion: "A balanced pros vs cons graphic"
          },
          { 
            title: "Conclusion & Outcomes", 
            content: ["Summary of key takeaways", "Future projections", "Final summary for ${values.audience}"],
            visualSuggestion: "A motivational background with summary bullets"
          }
        ];

        const finalSlides = slides.slice(0, Number(values.count));
        await new Promise(r => setTimeout(r, 1500));
        setResult({ title: topic, slides: finalSlides });
        toast({ title: "Logic Blueprint Ready", description: "Slides generated using local design logic." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to generate local blueprint." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownloadPDF = () => {
    if (!result) return;
    const sections = result.slides.map((s, i) => ({
      title: `Slide ${i + 1}: ${s.title}`,
      content: [...s.content, `Visual Suggestion: ${s.visualSuggestion}`]
    }));
    downloadObjectAsPDF(`Presentation Outline: ${result.title}`, sections, "Slide_Outline");
  };

  const handleDownloadPPTX = () => {
    if (!result) return;
    downloadPresentationAsPPTX(result.title, result.slides.map(s => ({
      title: s.title,
      content: s.content
    })));
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <MonitorPlay className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Outline Maker</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Design structural slide blueprints via Cloud or Local hardware.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Slide Blueprints</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Presentation Topic</FormLabel>
                    <FormControl><Input placeholder="e.g. Climate Change Impacts" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="audience" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Audience</FormLabel>
                      <FormControl><Input placeholder="e.g. Science Students" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="count" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Length (Slides)</FormLabel>
                      <FormControl><Input type="number" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Structuring...'}</>
                  ) : (
                    <><MonitorPlay className="mr-3 h-5 w-5" /> Generate Blueprint</>
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
            <Card className="border-4 shadow-2xl bg-card/20 backdrop-blur-xl rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center gap-2">
                  {isCloudMode ? <Globe className="h-4 w-4 text-primary" /> : <Cpu className="h-4 w-4 text-primary" />}
                  <Badge className="font-black uppercase tracking-widest">{isCloudMode ? (userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud Intelligence') : 'Local Neural Logic'}</Badge>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-primary truncate max-w-sm">{result?.title || 'Slide Blueprint'}</h2>
              </div>
              {result && (
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={handleDownloadPPTX} variant="outline" className="h-14 px-8 rounded-2xl border-4 font-bold uppercase text-[10px] tracking-widest bg-background shadow-lg hover:bg-primary/5">
                    <MonitorPlay className="mr-2 h-5 w-5" /> PPTX File
                  </Button>
                  <Button onClick={handleDownloadPDF} variant="outline" className="h-14 px-8 rounded-2xl border-4 font-bold uppercase text-[10px] tracking-widest bg-background shadow-lg hover:bg-primary/5">
                    <Download className="mr-2 h-5 w-5" /> PDF Outline
                  </Button>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 gap-8">
              {isGenerating ? (
                <div className="space-y-10">
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="h-20 w-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center border-4 border-primary/10 shadow-lg animate-pulse">
                      <Sparkles className="h-10 w-10 text-primary animate-spin-slow" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Designing Slides</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applying pedagogical structure and visual suggestions...</p>
                    </div>
                  </div>
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="p-10 border-2 rounded-[2.5rem] bg-muted/5">
                      <div className="space-y-6">
                        <Skeleton className="h-8 w-1/2 rounded-full" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : result?.slides.map((slide, idx) => (
                <Card key={idx} className="border-2 shadow-xl hover:border-primary/50 transition-all overflow-hidden rounded-[2.5rem] bg-background group">
                  <div className="absolute top-6 right-8 h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-2xl text-primary/20">{idx + 1}</div>
                  <CardHeader className="bg-muted/30 border-b p-10">
                    <CardTitle className="text-3xl font-black tracking-tight">{slide.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2"><ListChecks className="h-5 w-5" /> Key Content</p>
                      <ul className="space-y-4">
                        {(slide.content || []).map((point, pIdx) => (
                          <li key={pIdx} className="flex gap-4 text-xl font-bold leading-snug"><span className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0 shadow-lg" />{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6 p-8 bg-primary/[0.03] rounded-[2rem] border-4 border-dashed border-primary/10">
                      <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Visual Aid</p>
                      <p className="text-lg font-bold leading-relaxed italic text-foreground/70">{slide.visualSuggestion}</p>
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
