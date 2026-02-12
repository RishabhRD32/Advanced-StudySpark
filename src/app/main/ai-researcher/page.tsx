"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Search, Download, Zap, Sparkles, Globe, Brain, Cpu, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useWebLLM } from '@/hooks/use-web-llm';
import { researchTopic } from '@/ai/flows/researcher-flow';
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';

const researchSchema = z.object({
  topic: z.string().min(2, "What would you like to research?"),
  depth: z.enum(['concise', 'detailed', 'encyclopedic']),
});

export default function ResearcherPage() {
  const { userProfile } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof researchSchema>>({
    resolver: zodResolver(researchSchema),
    defaultValues: { topic: "", depth: "detailed" },
  });

  async function onSubmit(values: z.infer<typeof researchSchema>) {
    setResult(null);
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await researchTopic({
          topic: values.topic,
          depth: values.depth as any,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        
        const sectionsText = (res.sections || []).map(s => `## ${s.title}\n${s.content}`).join('\n\n');
        const refsText = (res.references || []).join('\n');
        const formatted = `${res.title || 'Research Report'}\n\n${sectionsText}\n\n### References\n${refsText}`;
        setResult(formatted);
        toast({ title: "Intelligence Link Ready", description: `Report synthesized via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Failure", 
          description: error.message || "Cloud hub is currently overwhelmed. Try Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Generate a comprehensive research report on: ${values.topic}. Depth: ${values.depth}. Include structured sections covering Overview, History, Core Principles, and Modern Significance. Include academic references.`,
          "You are an expert academic researcher and encyclopedia editor."
        );
        if (response) {
          setResult(response);
          toast({ title: "Local Search Complete", description: "Neural knowledge base indexed." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Neural Error", description: "Could not establish local connection." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownload = () => {
    if (!result) return;
    downloadTextAsPDF(`Research Report: ${form.getValues('topic')}`, result, "Neural_Research_Report");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Intelligence Researcher</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Deep-dive academic inquiry via Cloud or Neural Hardware.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Inquiry Matrix</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="topic" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Quantum Computing or Roman Empire" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="depth" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Depth</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4 font-bold">
                          <SelectItem value="concise" className="py-3 px-4">Quick Summary</SelectItem>
                          <SelectItem value="detailed" className="py-3 px-4">Structured Paper</SelectItem>
                          <SelectItem value="encyclopedic" className="py-3 px-4">Full Thesis</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Intelligence...' : 'Neural Searching...'}</>
                  ) : (
                    <><Search className="mr-3 h-5 w-5" /> Start Research</>
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
                  <Cpu className="h-4 w-4 animate-spin" /> Initializing Hardware...
                </div>
                <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        {(isGenerating || result) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="border-4 shadow-2xl rounded-[3rem] bg-background overflow-hidden">
              <CardHeader className="bg-primary/5 border-b p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isCloudMode ? <Globe className="h-4 w-4 text-primary" /> : <Brain className="h-4 w-4 text-primary" />}
                    <Badge className="font-black uppercase tracking-widest px-4">{isCloudMode ? (userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud Intelligence') : 'Local Neural knowledge'}</Badge>
                  </div>
                  <CardTitle className="text-4xl font-black tracking-tight">{form.getValues('topic') || 'Research Inquiry'}</CardTitle>
                </div>
                {result && (
                  <Button onClick={handleDownload} variant="outline" className="h-14 px-8 rounded-2xl border-4 font-bold uppercase text-[10px] tracking-widest bg-background shadow-lg hover:bg-primary/5">
                    <Download className="mr-2 h-5 w-5" /> Export PDF
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-10">
                {isGenerating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                      <div className="h-20 w-20 rounded-full border-8 border-primary/10 border-t-primary animate-spin" />
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Synthesizing Report</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Indexing academic parameters and sources...</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-1/2 rounded-full" />
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full rounded-full" />
                        <Skeleton className="h-4 w-5/6 rounded-full" />
                        <Skeleton className="h-4 w-full rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-1/3 rounded-full" />
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full rounded-full" />
                        <Skeleton className="h-4 w-4/6 rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap opacity-90 text-foreground/80">
                      {result}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
