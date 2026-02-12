"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollText, Sparkles, Zap, Download, Brain, Activity, Cpu, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useToast } from "@/hooks/use-toast";
import { useWebLLM } from "@/hooks/use-web-llm";
import { summarizeText } from "@/ai/flows/text-summarization";
import { useAuth } from "@/lib/auth/use-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const summarizerSchema = z.object({
  text: z.string().min(50, { message: "Provide at least 50 characters for a quality summary." }),
});

export default function AISummarizerPage() {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState("");
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof summarizerSchema>>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: { text: "" },
  });

  async function onSubmit(values: z.infer<typeof summarizerSchema>) {
    setSummary("");
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await summarizeText({
          ...values,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setSummary(res.summary);
        toast({ title: "Success", description: `Summary generated via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'} Hub.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Failure", 
          description: error.message || "Failed to summarize. Check your cloud provider settings." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Summarize the following text briefly and clearly for a student:\n\n${values.text}`,
          "You are an expert academic summarizer."
        );
        if (response) {
          setSummary(response);
          toast({ title: "Local Synthesis Complete", description: "Summary generated locally via WebGPU." });
        }
      } catch (error: any) { 
        toast({ variant: "destructive", title: "Error", description: "Failed to summarize locally." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownload = () => {
    if (!summary) return;
    downloadTextAsPDF("Study Summary", summary, "My_Summary");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Neural Summarizer</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Advanced extraction captures the soul of your notes.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Source Logic Material</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="text" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paste your research or notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your study material here..." className="resize-none font-bold border-2 rounded-2xl bg-background shadow-inner min-h-[250px] leading-relaxed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> Processing Intelligence...</>
                  ) : (
                    <><Sparkles className="mr-3 h-5 w-5" /> Generate Summary</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(isGenerating || summary) && (
          <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden rounded-[3rem] bg-card/20 backdrop-blur-xl">
            <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-8 px-10">
              <div className="flex items-center gap-4">
                {isCloudMode ? <Globe className="h-6 w-6 text-primary" /> : <Brain className="h-6 w-6 text-primary" />}
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                  {isCloudMode ? `${(userProfile?.preferredCloudProvider || 'Cloud').toUpperCase()} Extraction` : 'Neural Extraction'}
                </CardTitle>
              </div>
              {summary && (
                <Button onClick={handleDownload} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest bg-background">
                  <Download className="mr-2 h-4 w-4" /> Save PDF
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-12">
              {isGenerating ? (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <Zap className="h-12 w-12 text-primary animate-bolt fill-primary/20" />
                    <div className="text-center">
                      <p className="text-sm font-black uppercase tracking-widest text-primary">Distilling Concepts</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Synthesizing semantic logic...</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-5/6 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap tracking-tight text-foreground/90 italic">
                    {summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
