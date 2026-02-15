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
import { Sparkles, Lightbulb, Clipboard, Check, Download, Zap, Brain, BookOpen, Cpu, Activity, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { useWebLLM } from '@/hooks/use-web-llm';
import { generateMnemonic } from '@/ai/flows/mnemonics-generator-flow';
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const mnemonicSchema = z.object({
  terms: z.string().min(3, "Please enter some terms or a formula."),
  style: z.enum(['Acronym', 'Sentence', 'Story', 'Rhyme']),
});

export default function MemoryTricksPage() {
  const { userProfile } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof mnemonicSchema>>({
    resolver: zodResolver(mnemonicSchema),
    defaultValues: { terms: "", style: "Acronym" },
  });

  async function onSubmit(values: z.infer<typeof mnemonicSchema>) {
    setResult(null);
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await generateMnemonic({
          ...values,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult(`${res.mnemonic}\n\nExplanation: ${res.explanation}`);
        toast({ title: "Memory Trick Ready", description: "Your custom recall hack is generated." });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Failed to generate mnemonic." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Create a catchy mnemonic for these terms: ${values.terms}. Style: ${values.style}. Provide the mnemonic and a brief explanation.`,
          "You are an expert memory coach and learning specialist."
        );
        if (response) {
          setResult(response);
          toast({ title: "Local Trick Ready", description: "Generated using private local AI." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Local AI failed to run." });
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

  const handleDownload = () => {
    if (!result) return;
    downloadTextAsPDF("Memory Tricks Aid", result, "My_Memory_Hacks");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Memory Tricks</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Turn hard terms into easy-to-remember hacks using AI.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Memorization Target</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="terms" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Terms or List (Separate by comma)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Mercury, Venus, Earth, Mars..." 
                        className="resize-none font-bold border-2 rounded-2xl bg-background shadow-inner min-h-[120px] text-lg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="style" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trick Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Pick a style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          <SelectItem value="Acronym" className="font-bold py-3">Acronym (First Letters)</SelectItem>
                          <SelectItem value="Sentence" className="font-bold py-3">Sentence (Catchy Phrase)</SelectItem>
                          <SelectItem value="Story" className="font-bold py-3">Short Story (Funny)</SelectItem>
                          <SelectItem value="Rhyme" className="font-bold py-3">Rhyme (Poem)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="flex items-end">
                    <Button type="submit" disabled={isLoading} className="w-full h-14 text-md font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                      {isGenerating ? (
                        <><Activity className="mr-3 h-6 w-6 animate-pulse" /> Making Trick...</>
                      ) : (
                        <><Sparkles className="mr-3 h-5 w-5" /> Generate Trick</>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {(isGenerating || result) ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Card className="border-4 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden rounded-[3rem] bg-background">
                <CardHeader className="bg-primary/5 border-b p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
                        {isCloudMode ? <Globe className="h-5 w-5" /> : <Cpu className="h-5 w-5" />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{isCloudMode ? 'Cloud Generation' : 'Local Memory Trick'}</p>
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tight text-primary">Your Result</CardTitle>
                  </div>
                  {result && (
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-12 px-6 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest">
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button onClick={handleDownload} variant="outline" size="sm" className="h-12 px-6 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest">
                        <Download className="mr-2 h-4 w-4" /> Save PDF
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                  {isGenerating ? (
                    <div className="space-y-10">
                      <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center border-4 border-dashed border-primary/20 animate-spin-slow">
                          <Brain className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Drafting Tricks</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full rounded-2xl" />
                        <Skeleton className="h-20 w-3/4 rounded-2xl" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 bg-primary/5 rounded-[2.5rem] border-4 border-dashed border-primary/10 relative overflow-hidden group">
                      <Sparkles className="absolute -top-4 -right-4 h-20 w-20 text-primary/5 rotate-12" />
                      <p className="text-2xl font-black leading-tight tracking-tight text-foreground/90 whitespace-pre-wrap italic">
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
                 <BookOpen className="h-12 w-12" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-widest">Awaiting Input</h3>
               <p className="text-lg font-bold mt-2">Enter terms above to generate your memory trick.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
