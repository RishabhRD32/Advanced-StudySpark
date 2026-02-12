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
import { Terminal, Code2, Zap, Cpu, Download, Sparkles, Activity, Globe, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWebLLM } from '@/hooks/use-web-llm';
import { mentorCode } from '@/ai/flows/code-mentor-flow';
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useAuth } from '@/lib/auth/use-auth';
import { cn } from '@/lib/utils';

const codeSchema = z.object({
  codeSnippet: z.string().min(10, "Code snippet is too short."),
  language: z.string().min(1, "Pick a language."),
  query: z.string().min(5, "What do you need help with?"),
});

const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML/CSS" },
];

export default function CodeMentorPage() {
  const { userProfile } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { codeSnippet: "", language: "javascript", query: "" },
  });

  async function onSubmit(values: z.infer<typeof codeSchema>) {
    setResult(null);
    setIsGenerating(true);
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await mentorCode({
          ...values,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        const formatted = `Explanation: ${res.explanation}\n\nOptimized Code:\n\`\`\`${values.language}\n${res.optimizedCode}\n\`\`\`\n\nPro-Tips:\n${(res.tips || []).map(t => `• ${t}`).join('\n')}`;
        setResult(formatted);
        toast({ title: "Cloud Review Success", description: `Analyzed via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'} Hub.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Cloud faculty is overwhelmed. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `You are a Senior Software Engineer. Mentor this student on the following ${values.language} code:\n\nQuery: ${values.query}\nSnippet:\n${values.codeSnippet}\n\nProvide an explanation, an optimized/fixed version, and pro-tips.`,
          "You are a Senior Software Engineer and Mentor."
        );
        if (response) {
          setResult(response);
          toast({ title: "Neural Logic Active", description: "Review generated locally." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Local AI failed to review code." });
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
    downloadTextAsPDF("Code Mentor Analysis", result, "Code_Mentor_Review");
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">AI Code Mentor</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Expert debugging help via Cloud API or Local Hardware.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Technical Setup</CardTitle>
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
                  <FormField control={form.control} name="language" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Pick language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          {supportedLanguages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} className="font-bold py-3">{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="query" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">What's the issue?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Why is this loop failing?" {...field} className="h-14 border-2 font-bold rounded-2xl bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="codeSnippet" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paste Snippet</FormLabel>
                    <FormControl>
                      <Textarea placeholder="// Paste your code here..." className="font-mono text-sm font-medium border-2 rounded-2xl bg-muted/10 min-h-[250px] shadow-inner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Code Review...'}</>
                  ) : (
                    <><Code2 className="mr-3 h-5 w-5" /> Mentor Code</>
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
                  <Cpu className="h-4 w-4 animate-spin" /> Local model waking up...
                </div>
                <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        {(isGenerating || result) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden rounded-[3rem] bg-card/20 backdrop-blur-3xl">
              <CardHeader className="bg-primary/5 border-b py-8 px-10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  {isCloudMode ? <Globe className="h-6 w-6 text-primary" /> : <Cpu className="h-6 w-6 text-primary" />}
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                    {isCloudMode ? 'Cloud Faculty Review' : 'Senior Developer Review'}
                  </CardTitle>
                </div>
                {result && (
                  <Button onClick={handleDownload} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest">
                    <Download className="mr-2 h-4 w-4" /> Save PDF
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {isGenerating ? (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border-4 border-primary/20 animate-pulse">
                        <Code2 className="h-8 w-8 text-primary animate-bounce" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black uppercase tracking-[0.2em] text-primary">Mentoring Session Active</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reviewing logic and formulating optimizations...</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <Skeleton className="h-6 w-full rounded-full" />
                      <Skeleton className="h-32 w-full rounded-2xl" />
                      <Skeleton className="h-6 w-2/3 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap italic text-foreground/80">{result}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-10 px-6 rounded-xl border-2 font-black text-[10px] uppercase">
                        {copied ? "Copied" : "Copy Result"}
                      </Button>
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
