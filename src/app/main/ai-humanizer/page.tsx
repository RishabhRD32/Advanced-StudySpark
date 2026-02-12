"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Languages, Clipboard, Check, Activity, Cpu, Globe, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebLLM } from '@/hooks/use-web-llm';
import { useToast } from '@/hooks/use-toast';
import { humanizeContent } from '@/ai/flows/ai-humanizer-flow';
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';

const humanizerSchema = z.object({
  text: z.string().min(20, "Please provide at least 20 characters."),
  tone: z.enum(['friendly', 'professional', 'inspiring']),
});

export default function AIHumanizerPage() {
  const { userProfile } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof humanizerSchema>>({
    resolver: zodResolver(humanizerSchema),
    defaultValues: { text: "", tone: "professional" },
  });

  async function onSubmit(values: z.infer<typeof humanizerSchema>) {
    setResult(null);
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await humanizeContent({
          ...values,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult(res.humanizedText);
        toast({ title: "Cloud Processing Complete", description: `Content humanized via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Try switching to Offline Mode for local logic." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Rewrite the following text to sound more human, natural, and engaging. Tone: ${values.tone}.\n\nText: ${values.text}`,
          "You are an expert editor who makes AI content sound natural."
        );
        if (response) {
          setResult(response);
          toast({ title: "Neural Link Complete", description: "Content humanized locally." });
        }
      } catch (error) { 
        toast({ variant: "destructive", title: "Error", description: "Failed to rewrite content locally." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="text-center">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Languages className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">AI Humanizer</h1>
        <p className="text-muted-foreground font-medium">Make content sound natural and engaging via Cloud or Locally.</p>
      </div>

      <Card className="border-2 shadow-sm bg-card/50 backdrop-blur-xl rounded-[2rem]">
        <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Configuration</CardTitle>
          <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
            <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="text" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-primary">Original Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste content here..." className="min-h-[200px] font-medium border-2 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="tone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-primary">Target Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 font-bold rounded-xl">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg font-black uppercase tracking-widest rounded-xl">
                    {isGenerating ? (
                      <><Activity className="mr-2 animate-pulse" /> {isCloudMode ? 'Cloud Syncing...' : 'Neural Humanizing...'}</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> Start Transformation</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {offlineLoading && !isReady && !isCloudMode && (
        <Card className="border-2 border-primary/20 bg-primary/5 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Syncing Local Model...</span>
              </div>
              <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
            </div>
            <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
          </div>
        </Card>
      )}

      {(isGenerating || result) && (
        <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {isCloudMode ? <Globe className="h-4 w-4 text-primary" /> : <Cpu className="h-4 w-4 text-primary" />}
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">
                {isCloudMode ? 'Cloud Humanized' : 'Local Humanized'}
              </CardTitle>
            </div>
            {result && (
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="font-bold border-2 rounded-xl">
                {copied ? <><Check className="h-4 w-4 mr-2" /> Copied</> : <><Clipboard className="h-4 w-4 mr-2" /> Copy Result</>}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-8">
            {isGenerating ? (
              <div className="space-y-8">
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <Brain className="h-12 w-12 text-primary animate-pulse" />
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-primary">Refining Natural Tone</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Formulating engaging structure...</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-5/6 rounded-full" />
                  <Skeleton className="h-4 w-4/6 rounded-full" />
                </div>
              </div>
            ) : (
              <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap italic">{result}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
