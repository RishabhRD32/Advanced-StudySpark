"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Layers, RotateCw, ChevronLeft, ChevronRight, Zap, Activity, Cpu, Globe, Brain } from "lucide-react";
import { cn } from '@/lib/utils';
import { generateFlashcards } from '@/ai/flows/flashcard-generator-flow';
import { useToast } from '@/hooks/use-toast';
import { useWebLLM } from '@/hooks/use-web-llm';
import { useAuth } from '@/lib/auth/use-auth';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';

const flashcardSchema = z.object({
  text: z.string().min(20, "Paste at least 20 characters of source text."),
  count: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 1, "Minimum 1 card."),
});

type Flashcard = {
  front: string;
  back: string;
};

export default function FlashcardsPage() {
  const { userProfile } = useAuth();
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof flashcardSchema>>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: { text: "", count: "5" },
  });

  async function onSubmit(values: z.infer<typeof flashcardSchema>) {
    setCards(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsGenerating(true);
    
    if (isCloudMode) {
      setIsCloudLoading(true);
      try {
        const res = await generateFlashcards({
          text: values.text,
          count: Number(values.count),
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        
        if (res.cards && res.cards.length > 0) {
          setCards(res.cards);
          toast({ title: "Cards Generated", description: `Cloud Hub (${userProfile?.preferredCloudProvider?.toUpperCase() || 'AI'}) has formulated your deck.` });
        } else {
          throw new Error("Cloud returned an empty deck. Try again or switch to Offline Mode.");
        }
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Error", 
          description: error.message || "Cloud hub is currently congested. Switch to Offline Mode." 
        });
      } finally {
        setIsCloudLoading(false);
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Create ${values.count} flashcards from this text. Provide a list of questions and answers. Format: Front: [Question] Back: [Answer].\n\nText: ${values.text}`,
          "You are an expert study assistant."
        );
        if (response) {
          // Rudimentary local parsing for prototype
          setCards([{ front: "Local Recall Point", back: response.substring(0, 500) }]);
          toast({ title: "Local Deck Ready", description: "Inference completed on your hardware." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Hardware Error", description: "Local model failed. Ensure WebGPU is active." });
      } finally {
        setIsGenerating(false);
      }
    }
  }

  const nextCard = () => {
    if (!cards) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 100);
  };

  const prevCard = () => {
    if (!cards) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 100);
  };

  const isLoading = isCloudLoading || (offlineLoading && !isReady) || isGenerating;

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Layers className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Flashcard Maker</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Transform notes into active recall sets via Cloud or Local hardware.
        </p>
      </div>

      <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Deck Configuration</CardTitle>
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source Material</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste text here. Example: 'Photosynthesis is the process where plants use sunlight...'" className="min-h-[150px] font-bold border-2 rounded-2xl bg-background shadow-inner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="count" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Count</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-14 font-black border-2 rounded-2xl bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                    {isGenerating ? (
                      <><Activity className="mr-2 animate-pulse" /> {isCloudMode ? 'Syncing Cloud Hub...' : 'Neural Engine...'}</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" /> Generate Deck</>
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
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                <Cpu className="h-4 w-4 animate-spin" /> Preparing Neural engine...
              </div>
              <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Initializing'}</span>
            </div>
            <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
          </div>
        </Card>
      )}

      {(isGenerating || cards) && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col items-center gap-10">
            {isGenerating ? (
              <div className="w-full max-w-md h-[300px] flex flex-col items-center justify-center p-10 border-4 border-dashed rounded-[3rem] opacity-30 gap-6">
                <Brain className="h-12 w-12 animate-bounce text-primary" />
                <p className="font-black uppercase tracking-widest">Synthesizing Logic</p>
              </div>
            ) : cards && (
              <div 
                className="relative w-full max-w-md h-[300px] cursor-pointer group"
                style={{ perspective: '1000px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={cn(
                    "w-full h-full relative transition-transform duration-500 transform-gpu",
                    isFlipped && "rotate-y-180"
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Card className="absolute w-full h-full border-4 border-primary/20 bg-background flex flex-col items-center justify-center p-10 text-center rounded-[3rem] shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6">Inquiry {currentIndex + 1}</p>
                     <h3 className="text-2xl font-black leading-tight tracking-tight">{cards[currentIndex]?.front}</h3>
                     <div className="mt-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                       <RotateCw className="h-3 w-3" /> Flip for verification
                     </div>
                  </Card>

                  <Card className="absolute w-full h-full border-4 border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/20 flex flex-col items-center justify-center p-10 text-center rounded-[3rem] shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-6">Logical Result</p>
                     <p className="text-xl font-bold leading-relaxed">{cards[currentIndex]?.back}</p>
                  </Card>
                </div>
              </div>
            )}

            {cards && (
              <div className="flex items-center gap-8">
                <Button variant="outline" size="icon" onClick={prevCard} className="h-16 w-16 rounded-full border-4 hover:bg-primary/5 transition-all"><ChevronLeft className="h-6 w-6" /></Button>
                <div className="bg-background border-2 px-6 py-2 rounded-full font-black text-sm tabular-nums shadow-sm">
                  {currentIndex + 1} / {cards.length}
                </div>
                <Button variant="outline" size="icon" onClick={nextCard} className="h-16 w-16 rounded-full border-4 hover:bg-primary/5 transition-all"><ChevronRight className="h-6 w-6" /></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
