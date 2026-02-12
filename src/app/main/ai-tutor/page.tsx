"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Zap, Sparkles, Download, Search, Brain, Cpu, Activity, Globe, X } from "lucide-react";
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWebLLM } from "@/hooks/use-web-llm";
import { aiTutorAssistance } from "@/ai/flows/ai-tutor-assistance";
import { useAuth } from "@/lib/auth/use-auth";
import { Badge } from "@/components/ui/badge";

const tutorSchema = z.object({
  question: z.string().min(2, { message: "Please type a topic or question." }),
});

export default function AITutorPage() {
  const { userProfile } = useAuth();
  const [answer, setAnswer] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof tutorSchema>>({
    resolver: zodResolver(tutorSchema),
    defaultValues: { question: "" },
  });

  async function onSubmit(values: z.infer<typeof tutorSchema>) {
    setAnswer(null);
    setLastQuestion(values.question);
    setIsGenerating(true);
    
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await aiTutorAssistance({ 
          question: values.question,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-2.0-flash'
        });
        setAnswer(res.answer);
        toast({ title: "Signal Established", description: `Response generated via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Google'}.` });
      } catch (error: any) { 
        toast({ 
          variant: "destructive", 
          title: "Provider Logic Error", 
          description: error.message || "Failed to contact cloud hub. Check your API keys or switch providers." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          values.question,
          "You are an expert AI Tutor. Provide a comprehensive, accurate, and deeply explained answer to the student's question.",
          userProfile?.preferredWebLLMModel || undefined
        );
        if (response) {
          setAnswer(response);
          toast({ title: "Neural Link Complete", description: "Response generated locally." });
        }
      } catch (error: any) { 
        toast({ variant: "destructive", title: "Neural Link Error", description: "Local inference failed. Ensure WebGPU is enabled." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const handleDownload = () => {
    if (!answer) return;
    downloadTextAsPDF("AI Tutor Session", answer, "Tutor_Help", `Question: ${lastQuestion}`);
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">AI Tutor</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Advanced intelligence for deep academic reasoning.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Neural Inquiry</CardTitle>
                <Badge variant="outline" className="text-[8px] uppercase tracking-widest px-2">
                  {isCloudMode ? (userProfile?.preferredCloudProvider || 'Google') : 'Local'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ask anything (Concepts, Calculations, Logic)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. 'Explain Newton's Laws' or 'How does cellular respiration work?'" 
                        className="resize-none font-black text-lg border-2 rounded-2xl bg-background shadow-inner min-h-[120px] focus:border-primary transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-6 w-6 animate-pulse" /> Processing Logic...</>
                  ) : (
                    <><Zap className="mr-3 h-5 w-5" /> Start Analysis</>
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
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Waking Neural Link...</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{progress.includes('%') ? progress : 'Initializing'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {(isGenerating || answer) ? (
            <Card className="border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden rounded-[3rem] bg-card/20 backdrop-blur-xl">
              <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-8 px-10">
                <div className="flex items-center gap-4">
                  {isCloudMode ? <Globe className="h-6 w-6 text-primary" /> : <Cpu className="h-6 w-6 text-primary" />}
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                    {isCloudMode ? `${(userProfile?.preferredCloudProvider || 'Cloud').toUpperCase()} Intelligence` : 'Local Neural Explanation'}
                  </CardTitle>
                </div>
                {answer && (
                  <Button onClick={handleDownload} variant="outline" size="sm" className="h-10 px-4 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest bg-background">
                    <Download className="mr-2 h-4 w-4" /> Save PDF
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-12 relative">
                {isGenerating ? (
                  <div className="space-y-8">
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Brain className="h-16 w-16 text-primary animate-bounce relative z-10" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-xl font-black uppercase tracking-[0.2em] text-primary animate-pulse">AI is Thinking...</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {isCloudMode ? `Synthesizing via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'} Hub` : 'Formulating logic within local neural pathways'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4 rounded-full" />
                      <Skeleton className="h-6 w-full rounded-full" />
                      <Skeleton className="h-6 w-5/6 rounded-full" />
                      <Skeleton className="h-6 w-4/6 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap tracking-tight text-foreground/90">
                      {answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="py-20 border-4 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group transition-all hover:opacity-30">
               <Sparkles className="h-12 w-12 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-3xl font-black uppercase tracking-widest">Hybrid Intelligence Active</h3>
               <p className="text-lg font-bold mt-2 max-w-md">Switch between Cloud Intelligence or 100% private local processing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
