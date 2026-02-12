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
import { 
  BookMarked, 
  Languages, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  Volume2, 
  Quote, 
  Search, 
  Database, 
  Globe, 
  History, 
  Cpu, 
  Activity,
  ArrowDown
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useWebLLM } from '@/hooks/use-web-llm';
import { useAuth } from '@/lib/auth/use-auth';
import { lookupWord, type DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { cn } from '@/lib/utils';

const dictionarySchema = z.object({
  word: z.string().min(1, "Please enter a word or phrase."),
  targetLanguage: z.string().min(1, "Pick a language."),
});

const languages = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese", "Arabic", "Russian", "Portuguese", "Korean", "Italian", "Bengali"
];

export default function AIDictionaryPage() {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DictionaryOutput | null>(null);
  const [source, setSource] = useState<'cache' | 'api' | 'cloud' | 'local' | null>(null);
  const [mode, setMode] = useState<'hybrid' | 'cloud' | 'local'>('hybrid');
  
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof dictionarySchema>>({
    resolver: zodResolver(dictionarySchema),
    defaultValues: { word: "", targetLanguage: "English" },
  });

  async function onSubmit(values: z.infer<typeof dictionarySchema>) {
    setIsLoading(true);
    setResult(null);
    setSource(null);
    const wordKey = values.word.toLowerCase().trim();
    const cacheKey = `ss_dict_${wordKey}_${values.targetLanguage.toLowerCase()}`;
    
    // 1. Check Local Hybrid Cache (Works in all modes)
    const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    if (cachedData) {
      setResult(JSON.parse(cachedData));
      setSource('cache');
      setIsLoading(false);
      toast({ title: "Memory Link", description: "Found in your local hybrid vault." });
      return;
    }

    // 2. Intelligence Routing
    if (mode === 'hybrid' && values.targetLanguage === 'English') {
      // Try Web API first for English terms
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordKey}`);
        if (response.ok) {
          const data = await response.json();
          const entry = data[0];
          const formatted: DictionaryOutput = {
            originalWord: entry.word,
            translation: "English Definition",
            pronunciation: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text,
            definition: entry.meanings[0]?.definitions[0]?.definition || "No definition found.",
            partOfSpeech: entry.meanings[0]?.partOfSpeech || "N/A",
            examples: entry.meanings[0]?.definitions.filter((d: any) => d.example).map((d: any) => d.example).slice(0, 3) || [],
            synonyms: entry.meanings[0]?.synonyms?.slice(0, 5) || [],
            antonyms: entry.meanings[0]?.antonyms?.slice(0, 5) || [],
            wordForms: []
          };
          setResult(formatted);
          setSource('api');
          localStorage.setItem(cacheKey, JSON.stringify(formatted));
          setIsLoading(false);
          toast({ title: "API Link Active", description: "Fetched from global lexicon." });
          return;
        }
      } catch (e) { /* Fall through to AI */ }
    }

    // 3. AI Generation (Cloud or Local)
    if (mode === 'local') {
      try {
        const promptText = `Define "${values.word}" in ${values.targetLanguage}. Provide details in JSON-like format: definition, part of speech, pronunciation, 3 examples, synonyms, and antonyms.`;
        const response = await generate(promptText, "You are a master lexicographer.");
        if (response) {
          // Simple parsing for local model output
          const formatted: DictionaryOutput = {
            originalWord: values.word,
            translation: values.targetLanguage,
            definition: response.substring(0, 300),
            partOfSpeech: "AI Entry",
            examples: ["Source: Local Hardware"],
            synonyms: [],
            antonyms: [],
            wordForms: []
          };
          setResult(formatted);
          setSource('local');
          localStorage.setItem(cacheKey, JSON.stringify(formatted));
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Hardware Error", description: "Local neural engine failed." });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cloud AI (Default or if Hybrid API fails)
      try {
        const res = await lookupWord({
          word: values.word,
          targetLanguage: values.targetLanguage,
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setResult(res);
        setSource('cloud');
        localStorage.setItem(cacheKey, JSON.stringify(res));
        toast({ title: "Neural Link Active", description: `Logic processed via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'Cloud'}.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Logic Failure", 
          description: error.message || "Cloud hub is unreachable." 
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  const playAudio = () => {
    const word = result?.originalWord;
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
  };

  const isActuallyLoading = isLoading || (offlineLoading && !isReady);

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <BookMarked className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Linguistic Engine</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto">
          Quad-Source Dictionary: Cache, API, Local AI, and Cloud Hub.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Inquiry Configuration</CardTitle>
            <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border-2">
              <button 
                onClick={() => setMode('local')}
                className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all", mode === 'local' ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}
              >
                Local AI
              </button>
              <button 
                onClick={() => setMode('hybrid')}
                className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all", mode === 'hybrid' ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}
              >
                Hybrid
              </button>
              <button 
                onClick={() => setMode('cloud')}
                className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all", mode === 'cloud' ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted")}
              >
                Cloud
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="word" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Term or Concept</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                            <Input placeholder="Try 'Isotope', 'Osmosis', or 'Renaissance'..." className="h-14 pl-12 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="targetLanguage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Context</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Context" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang} className="font-bold py-3">{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
                <Button type="submit" disabled={isActuallyLoading} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                  {isLoading ? <><Zap className="mr-3 h-6 w-6 animate-bolt fill-primary/20" /> Matrix Processing...</> : <><Search className="mr-3 h-5 w-5" /> Analyze Term</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {offlineLoading && !isReady && mode === 'local' && (
          <Card className="border-2 border-primary/20 bg-primary/5 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                  <Cpu className="h-4 w-4 animate-spin" /> Preparing Neural Engine...
                </div>
                <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
              </div>
              <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex justify-center gap-4">
                {source === 'cache' && <Badge className="bg-emerald-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full shadow-lg border-4 border-white dark:border-black"><History className="h-4 w-4" /> Hybrid Vault</Badge>}
                {source === 'api' && <Badge className="bg-blue-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full shadow-lg border-4 border-white dark:border-black"><Globe className="h-4 w-4" /> API Channel</Badge>}
                {source === 'cloud' && <Badge className="bg-purple-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full shadow-lg border-4 border-white dark:border-black"><Zap className="h-4 w-4" /> Cloud Neural Link</Badge>}
                {source === 'local' && <Badge className="bg-amber-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full shadow-lg border-4 border-white dark:border-black"><Cpu className="h-4 w-4" /> Hardware Inference</Badge>}
              </div>

              <Card className="border-4 shadow-2xl rounded-[3rem] bg-background overflow-hidden">
                <CardHeader className="bg-primary/5 border-b p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="font-black uppercase tracking-widest border-2 bg-primary/10 text-primary">{result.partOfSpeech}</Badge>
                      {result.pronunciation && (
                        <button onClick={playAudio} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-mono text-sm border-l pl-3 group">
                          <Volume2 className="h-4 w-4 group-hover:scale-110" /> {result.pronunciation}
                        </button>
                      )}
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter leading-none">{result.originalWord}</h2>
                    <p className="text-2xl font-bold text-primary italic uppercase tracking-widest">→ {result.translation}</p>
                  </div>
                  <div className="text-right hidden md:block opacity-20">
                    <BookMarked className="h-24 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b pb-2">Lexicon Entry</p>
                    <p className="text-2xl font-bold leading-relaxed text-foreground/90">{result.definition}</p>
                  </div>

                  {result.examples?.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                          <Sparkles className="h-4 w-4" /> Contextual Analysis
                        </div>
                        <div className="space-y-4">
                          {result.examples.map((example, i) => (
                            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-muted/20 border-2 border-transparent hover:border-primary/10 transition-all shadow-sm">
                              <Quote className="h-4 w-4 text-primary shrink-0 opacity-40" />
                              <p className="text-sm font-bold leading-relaxed">{example}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-10">
                        {result.synonyms?.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/60">
                              <ChevronRight className="h-4 w-4" /> Synonyms
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.synonyms.map((s, i) => (
                                <Badge key={i} variant="secondary" className="px-4 py-1.5 rounded-xl font-black uppercase text-[10px] border-2 border-emerald-500/10 text-emerald-600 bg-emerald-500/5">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.antonyms?.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600/60">
                              <ChevronRight className="h-4 w-4" /> Antonyms
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.antonyms.map((a, i) => (
                                <Badge key={i} variant="secondary" className="px-4 py-1.5 rounded-xl font-black uppercase text-[10px] border-2 border-rose-500/10 text-rose-600 bg-rose-500/5">{a}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : isLoading ? (
            <div className="h-[400px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-30 gap-6 bg-primary/[0.02]">
               <Activity className="h-16 w-16 animate-spin text-primary" />
               <h3 className="text-3xl font-black uppercase tracking-widest italic">Matrix Inquiry Active</h3>
               <p className="text-xl font-bold max-w-md">Synchronizing local vault, public archives, and neural links...</p>
            </div>
          ) : (
            <div className="h-[300px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group transition-all hover:opacity-30">
               <div className="h-24 w-24 rounded-[2rem] bg-muted flex items-center justify-center mb-6 border-4 border-muted-foreground/20 group-hover:scale-110 transition-transform">
                 <Languages className="h-12 w-12" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-widest">Linguistic Standby</h3>
               <p className="text-lg font-bold mt-2">Hybrid mode active. All sources prioritized for accuracy.</p>
               <ArrowDown className="h-6 w-6 mt-8 animate-bounce text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
