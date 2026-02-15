
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
import { Zap, Sparkles, Download, Search, Brain, Cpu, Activity, Globe, X, AlertTriangle } from "lucide-react";
import { downloadTextAsPDF } from "@/lib/download-utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useWebLLM } from "@/hooks/use-web-llm";
import { aiTutorAssistance } from "@/ai/flows/ai-tutor-assistance";
import { useAuth } from "@/lib/auth/use-auth";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { generate, loading: offlineLoading, progress, isReady, error: hardwareError, hardwareWarning } = useWebLLM();
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
          description: error.message || "Failed to contact cloud hub." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          values.question,
          "You are an expert AI Tutor. Provide a comprehensive, accurate, and deeply explained answer.",
          userProfile?.preferredWebLLMModel || undefined
        );
        if (response) {
          setAnswer(response);
          toast({ title: "Neural Link Complete", description: "Response generated locally." });
        }
      } catch (error: any) { 
        toast({ variant: "destructive", title: "Neural Link Error", description: "Local inference failed." });
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
    <div className="space-y-10 max-w-4xl mx-auto pb-24 px-2 md:px-4 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-14 md:h-16 w-14 md:w-16 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Brain className="h-7 md:h-8 w-7 md:w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">AI Tutor</h1>
        <p className="text-lg md:text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto px-4 leading-relaxed">
          Advanced intelligence for deep academic reasoning.
        </p>
      </div>

      {!isCloudMode && (hardwareError || hardwareWarning) && (
        <Alert variant={hardwareError ? "destructive" : "default"} className="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-3xl p-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase tracking-widest text-[10px] ml-2">{hardwareError ? "Hardware Incompatible" : "Resource Warning"}</AlertTitle>
          <AlertDescription className="font-bold text-sm mt-2 ml-2">
            {hardwareError || hardwareWarning}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-6 md:p-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 md:h-10 w-9 md:w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Search className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary">Neural Inquiry</CardTitle>
                <Badge variant="outline" className="text-[7px] md:text-[8px] uppercase tracking-widest px-2">
                  {isCloudMode ? (userProfile?.preferredCloudProvider || 'Google') : 'Local'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-background/50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2">
              <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors", !isCloudMode ? "text-primary" : "text-muted-foreground")}>Offline</span>
              <Switch checked={isCloudMode} onCheckedChange={setIsCloudMode} className="scale-75 md:scale-100" />
              <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors", isCloudMode ? "text-primary" : "text-muted-foreground")}>Cloud</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ask anything (Concepts, Calculations, Logic)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. 'Explain Newton's Laws' or 'How does cellular respiration work?'" 
                        className="resize-none font-black text-base md:text-lg border-2 rounded-2xl bg-background shadow-inner min-h-[120px] focus:border-primary transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                  {isGenerating ? (
                    <><Activity className="mr-3 h-5 md:h-6 w-5 md:w-6 animate-pulse" /> Processing...</>
                  ) : (
                    <><Zap className="mr-3 h-4 md:h-5 w-4 md:w-5" /> Start Analysis</>
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
                <span className="text-[10px] font-bold text-muted-foreground">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {(isGenerating || answer) ? (
            <Card className="border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-card/20 backdrop-blur-xl">
              <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-6 md:py-8 px-6 md:px-10">
                <div className="flex items-center gap-3 md:gap-4">
                  {isCloudMode ? <Globe className="h-5 md:h-6 w-5 md:w-6 text-primary" /> : <Cpu className="h-5 md:h-6 w-5 md:w-6 text-primary" />}
                  <CardTitle className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                    {isCloudMode ? `${(userProfile?.preferredCloudProvider || 'Cloud').toUpperCase()} Intelligence` : 'Local Neural Solution'}
                  </CardTitle>
                </div>
                {answer && (
                  <Button onClick={handleDownload} variant="outline" size="sm" className="h-9 md:h-10 px-3 md:px-4 rounded-xl border-2 font-bold uppercase text-[9px] md:text-[10px] tracking-widest bg-background">
                    <Download className="mr-2 h-3 md:h-4 w-3 md:w-4" /> Save
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-8 md:p-12 relative">
                {isGenerating ? (
                  <div className="space-y-8">
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Brain className="h-12 md:h-16 w-12 md:w-16 text-primary animate-bounce relative z-10" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-primary">Thinking...</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4 rounded-full" />
                      <Skeleton className="h-6 w-full rounded-full" />
                      <Skeleton className="h-6 w-5/6 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xl md:text-2xl font-bold leading-relaxed whitespace-pre-wrap tracking-tight text-foreground/90">
                      {answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="py-16 md:py-24 border-4 border-dashed rounded-[3rem] md:rounded-[3.5rem] flex flex-col items-center justify-center text-center opacity-20 px-8 md:px-12 group transition-all hover:opacity-30">
               <Sparkles className="h-10 md:h-12 w-10 md:w-12 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Logic Hub Standby</h3>
               <p className="text-base md:text-lg font-bold mt-2 max-w-md">Private local processing or high-speed Cloud AI available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
