"use client"

import React, { useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Brain, Lightbulb, Zap, Download, Cpu, Activity, Globe, Camera, X, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebLLM } from '@/hooks/use-web-llm';
import { useToast } from '@/hooks/use-toast';
import { solveProblem } from '@/ai/flows/problem-solver-flow';
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const solverSchema = z.object({
  description: z.string().min(5, "Please provide some detail about the problem."),
});

export default function ProblemSolverPage() {
  const { userProfile } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof solverSchema>>({
    resolver: zodResolver(solverSchema),
    defaultValues: { description: "" },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof solverSchema>) {
    setResult(null);
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await solveProblem({ 
          description: values.description,
          photoDataUri: imageDataUri || undefined,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        
        const stepsText = res.steps?.length > 0 ? `\n\nSteps:\n${res.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}` : "";
        const conceptsText = res.keyConcepts?.length > 0 ? `\n\nKey Concepts: ${res.keyConcepts.join(', ')}` : "";
        const formatted = `Solution: ${res.solution}${stepsText}${conceptsText}`;
        
        setResult(formatted);
        toast({ title: "Cloud Solution Ready", description: `Solved via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'} Hub.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Failed to solve problem. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Solve this academic problem step-by-step: ${values.description}. Break down the logic and identify core concepts.`,
          "You are an elite academic problem solver."
        );
        if (response) {
          setResult(response);
          toast({ title: "Local Solution Complete", description: "Problem solved via neural hardware." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Local inference failed." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownload = () => {
    if (!result) return;
    downloadTextAsPDF("AI Problem Solution", result, "Problem_Solution", `Query: ${form.getValues('description')}`);
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Problem Solver</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Get step-by-step solutions running 100% locally or via Cloud Vision.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Describe Problem</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Image Upload Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Problem Image (Optional - Cloud Only)</Label>
                    {imageDataUri && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setImageDataUri(null)} className="h-6 text-destructive font-bold text-[10px] uppercase">
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  {imageDataUri ? (
                    <div className="relative rounded-2xl overflow-hidden border-4 border-primary/10 aspect-video group bg-muted/20">
                      <Image src={imageDataUri} alt="Problem Preview" fill className="object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-bold uppercase text-xs">
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all opacity-60"
                    >
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Snap or Upload Photo</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type your question or context</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. 'Solve for x in this equation' or 'Explain the diagram above'..." 
                        className="resize-none font-bold border-2 rounded-2xl bg-background shadow-inner min-h-[120px] text-lg leading-relaxed focus:border-primary transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Solving...'}</>
                  ) : (
                    <><Sparkles className="mr-3 h-5 w-5" /> Solve Problem</>
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
                  <Cpu className="h-4 w-4 animate-spin" /> Booting Neural Engine...
                </div>
                <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {(isGenerating || result) ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Card className="border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden rounded-[3rem] bg-card/20 backdrop-blur-xl">
                <CardHeader className="bg-primary/5 border-b py-8 px-10 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isCloudMode ? <Globe className="h-6 w-6 text-primary" /> : <Lightbulb className="h-6 w-6 text-primary" />}
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                      {isCloudMode ? (userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud Solution') : 'Local Neural Solution'}
                    </CardTitle>
                  </div>
                  {result && (
                    <Button onClick={handleDownload} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest bg-background">
                      <Download className="mr-2 h-4 w-4" /> Save PDF
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-10">
                  {isGenerating ? (
                    <div className="space-y-10">
                      <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                          <Lightbulb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Calculating Solution</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applying tactical step-by-step logic...</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <Skeleton className="h-6 w-full rounded-full" />
                        <Skeleton className="h-6 w-5/6 rounded-full" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-xl font-bold leading-relaxed whitespace-pre-wrap text-foreground/90 italic">
                        {result}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-[300px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group transition-all hover:opacity-30">
               <div className="h-24 w-24 rounded-[2rem] bg-muted flex items-center justify-center mb-6 border-4 border-muted-foreground/20 group-hover:scale-110 transition-transform">
                 <Brain className="h-12 w-12" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-widest">Logic Hub Standby</h3>
               <p className="text-lg font-bold mt-2 max-w-md">Ground your inquiry with a photo or text description. Cloud Vision is prioritized for diagrams.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
