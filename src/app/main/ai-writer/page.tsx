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
import { Sparkles, Clipboard, Check, Download, Zap, Feather, Brain, Activity, Cpu, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { useWebLLM } from '@/hooks/use-web-llm';
import { downloadTextAsPDF } from "@/lib/download-utils";
import { generateCreativeContent } from '@/ai/flows/creative-writer-flow';
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const writerSchema = z.object({
  type: z.enum(['Essay', 'Poem', 'Story', 'Letter', 'Article', 'Report', 'Speech']),
  topic: z.string().min(3, "Please provide a topic or theme."),
  tone: z.enum(['Academic', 'Creative', 'Professional', 'Casual']),
});

export default function AIWriterPage() {
  const { userProfile } = useAuth();
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string; type: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof writerSchema>>({
    resolver: zodResolver(writerSchema),
    defaultValues: { type: "Essay", topic: "", tone: "Academic" },
  });

  async function onSubmit(values: z.infer<typeof writerSchema>) {
    setResult(null);
    setIsGenerating(true);
    
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await generateCreativeContent({
          ...values,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult({
          title: res.title,
          content: res.content,
          type: values.type
        });
        toast({ title: "Cloud Draft Generated", description: `Drafted via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'} Hub.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Failed to generate content. Try switching to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Generate a high-quality ${values.type} about "${values.topic}" with an ${values.tone} tone. Provide a Title and then the full content.`,
          "You are a master writer skilled in various formats."
        );
        if (response) {
          const lines = response.split('\n');
          const title = lines[0].replace('Title: ', '').replace(/[*#]/g, '');
          const content = lines.slice(1).join('\n').trim();
          setResult({ title: title || values.topic, content: content || response, type: values.type });
          toast({ title: "Local Draft Complete", description: "Composition successful via neural hardware." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Neural Error", description: "Local inference failed." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const copyToClipboard = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    downloadTextAsPDF(result.title, result.content, `Draft_${result.type}`);
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Feather className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Neural Writer</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Professional-grade composition engine running on Cloud or Local hardware.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Creative Blueprint</CardTitle>
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
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          {['Essay', 'Poem', 'Story', 'Letter', 'Article', 'Report', 'Speech'].map((type) => (
                            <SelectItem key={type} value={type} className="font-bold py-3">{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="tone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vibe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          {['Academic', 'Creative', 'Professional', 'Casual'].map((tone) => (
                            <SelectItem key={tone} value={tone} className="font-bold py-3">{tone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">What are we writing about?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Impact of AI on Modern Education" {...field} className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Drafting...'}</>
                  ) : (
                    <><Feather className="mr-3 h-5 w-5" /> Generate Advanced Draft</>
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
                  <Cpu className="h-4 w-4 animate-spin" /> Preparing Neural Hardware...
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
                    <Badge className="font-black uppercase tracking-widest">{isCloudMode ? (userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud Intelligence') : 'Local Neural Composition'}</Badge>
                  </div>
                  {isGenerating ? <Skeleton className="h-10 w-64 rounded-full" /> : <CardTitle className="text-4xl font-black tracking-tight">{result?.title}</CardTitle>}
                </div>
                {result && (
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-12 px-6 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest">
                      {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Clipboard className="h-4 w-4 mr-2" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm" className="h-12 px-6 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest">
                      <Download className="mr-2 h-4 w-4" /> Save PDF
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-12">
                {isGenerating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
                        <Feather className="h-16 w-16 text-primary animate-bounce relative z-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Authoring Content</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Synthesizing semantic flow and tone...</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-4 w-5/6 rounded-full" />
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-4 w-4/6 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap opacity-90 text-foreground/80 italic">
                      {result?.content}
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
