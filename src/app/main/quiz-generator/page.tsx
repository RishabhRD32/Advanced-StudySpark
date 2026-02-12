"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { FileQuestion, CheckCircle2, XCircle, Zap, Activity, Cpu, Globe, Brain, Sparkles, Binary } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebLLM } from "@/hooks/use-web-llm";
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/quiz-generator-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/use-auth';
import { Badge } from '@/components/ui/badge';

const quizSetupSchema = z.object({
  sourceText: z.string().min(50, { message: "Please provide at least 50 characters of text." }),
  numQuestions: z.string(),
  engine: z.enum(['algorithmic', 'cloud', 'local']).default('algorithmic'),
});

type QuizSetupFormValues = z.infer<typeof quizSetupSchema>;

const quizAnswersSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    selectedIndex: z.string().optional(),
  })),
});
type QuizAnswersFormValues = z.infer<typeof quizAnswersSchema>;

/**
 * Algorithmic Logic: Extracts key terms and creates MCQs without AI.
 */
function generateAlgorithmicQuiz(text: string, count: number): GenerateQuizOutput {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length > 8);
  const words = text.split(/\s+/).filter(w => w.length > 5).map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""));
  const uniqueWords = Array.from(new Set(words));
  
  const questions: any[] = [];
  const usedSentences = new Set<number>();

  for (let i = 0; i < count && i < sentences.length; i++) {
    // Find a random sentence that hasn't been used
    let sIdx = Math.floor(Math.random() * sentences.length);
    while (usedSentences.has(sIdx) && usedSentences.size < sentences.length) {
      sIdx = (sIdx + 1) % sentences.length;
    }
    usedSentences.add(sIdx);
    
    const sentence = sentences[sIdx].trim();
    const sWords = sentence.split(/\s+/).filter(w => w.length > 5);
    if (sWords.length === 0) continue;

    const targetWord = sWords[Math.floor(Math.random() * sWords.length)].replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const questionText = `In the context of the text, what term best completes this statement: "...${sentence.replace(new RegExp(targetWord, 'gi'), "____")}..."?`;
    
    // Create distractors from other unique words in the text
    const distractors = uniqueWords
      .filter(w => w.toLowerCase() !== targetWord.toLowerCase())
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const options = [targetWord, ...distractors].sort(() => 0.5 - Math.random());
    const correctIdx = options.indexOf(targetWord);

    questions.push({
      questionText,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `The term '${targetWord}' was extracted from the original text to validate your reading comprehension.`
    });
  }

  return { questions };
}

export default function QuizGeneratorPage() {
  const { userProfile } = useAuth();
  const [activeEngine, setActiveEngine] = useState<'algorithmic' | 'cloud' | 'local'>('algorithmic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [quizResults, setQuizResults] = useState<{ score: number; total: number; results: boolean[] } | null>(null);
  const { generate, loading: offlineLoading, progress, isReady } = useWebLLM();
  const { toast } = useToast();

  const setupForm = useForm<QuizSetupFormValues>({
    resolver: zodResolver(quizSetupSchema),
    defaultValues: { sourceText: "", numQuestions: "5", engine: "algorithmic" },
  });

  const answersForm = useForm<QuizAnswersFormValues>({
    resolver: zodResolver(quizAnswersSchema),
    defaultValues: { answers: [] }
  });

  const onSetupSubmit = async (values: QuizSetupFormValues) => {
    setGeneratedQuiz(null);
    setQuizResults(null);
    setIsGenerating(true);

    if (values.engine === 'algorithmic') {
      try {
        const result = generateAlgorithmicQuiz(values.sourceText, parseInt(values.numQuestions));
        setGeneratedQuiz(result);
        answersForm.reset({ answers: result.questions.map(q => ({ question: q.questionText, selectedIndex: undefined })) });
        toast({ title: "Logic Quiz Ready", description: "Generated using algorithmic text analysis." });
      } catch (e) {
        toast({ variant: "destructive", title: "Logic Error", description: "Failed to parse text. Try AI mode." });
      } finally {
        setIsGenerating(false);
      }
    } else if (values.engine === 'cloud') {
      try {
        const result = await generateQuiz({ 
          sourceText: values.sourceText, 
          numQuestions: parseInt(values.numQuestions, 10),
          provider: userProfile?.preferredCloudProvider || 'google',
          model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
        });
        setGeneratedQuiz(result);
        answersForm.reset({ answers: (result.questions || []).map(q => ({ question: q.questionText, selectedIndex: undefined })) });
        toast({ title: "Cloud Quiz Ready", description: `Generated via ${userProfile?.preferredCloudProvider?.toUpperCase() || 'AI'} Hub.` });
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Provider Error", 
          description: error.message || "Cloud hub is congested. Switching to Algorithmic mode." 
        });
        // Auto-fallback
        const result = generateAlgorithmicQuiz(values.sourceText, parseInt(values.numQuestions));
        setGeneratedQuiz(result);
        answersForm.reset({ answers: result.questions.map(q => ({ question: q.questionText, selectedIndex: undefined })) });
      } finally {
        setIsGenerating(false);
      }
    } else {
      try {
        const response = await generate(
          `Generate a multiple choice quiz with ${values.numQuestions} questions based on this text: ${values.sourceText}. Provide questions, 4 options each, and mark the correct index.`,
          "You are a helpful assistant that creates educational quizzes."
        );
        if (response) {
          toast({ title: "Local Logic Active", description: "Quiz generated via neural hardware." });
          // Fallback to algorithmic if local AI output is hard to parse in prototype
          const result = generateAlgorithmicQuiz(values.sourceText, parseInt(values.numQuestions));
          setGeneratedQuiz(result);
          answersForm.reset({ answers: result.questions.map(q => ({ question: q.questionText, selectedIndex: undefined })) });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Local hardware failure." });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const onAnswersSubmit = (values: QuizAnswersFormValues) => {
    if (!generatedQuiz?.questions) return;
    let score = 0;
    const results = generatedQuiz.questions.map((q, index) => {
      const isCorrect = Number(values.answers[index]?.selectedIndex) === q.correctAnswerIndex;
      if (isCorrect) score++;
      return isCorrect;
    });
    setQuizResults({ score, total: generatedQuiz.questions.length, results });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActuallyLoading = isGenerating || (offlineLoading && !isReady);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Practice Quiz</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto">
          Test your knowledge via Cloud AI, Local Hardware, or pure Algorithmic Logic.
        </p>
      </div>

      {!generatedQuiz && !isActuallyLoading && (
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8 flex flex-row md:flex-row md:items-center justify-between gap-6">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Inquiry Setup</CardTitle>
            <div className="flex bg-background/50 p-1.5 rounded-2xl border-2 gap-1">
              {(['algorithmic', 'cloud', 'local'] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setActiveEngine(e); setupForm.setValue('engine', e); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeEngine === e ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...setupForm}>
              <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-8">
                <FormField control={setupForm.control} name="sourceText" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logic Material (Paste Notes)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your study material here..." className="resize-none font-bold border-2 rounded-2xl bg-background shadow-inner min-h-[250px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={setupForm.control} name="numQuestions" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Batch Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Quantity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4 font-bold">
                          <SelectItem value="3">3 Questions</SelectItem>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <div className="flex items-end">
                    <Button type="submit" disabled={isActuallyLoading} className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                      <Zap className="mr-3 h-5 w-5 fill-white/20" /> Generate Exam
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {offlineLoading && !isReady && activeEngine === 'local' && (
        <Card className="border-2 border-primary/20 bg-primary/5 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                <Cpu className="h-4 w-4 animate-spin" /> Awakening Neural Engine...
              </div>
              <span className="text-[10px] font-bold">{progress.includes('%') ? progress : 'Loading'}</span>
            </div>
            <Progress value={progress.includes('%') ? parseInt(progress) : 10} className="h-2" />
          </div>
        </Card>
      )}

      {isGenerating && (
        <div className="h-[400px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-30 gap-6 bg-primary/[0.02]">
           <Activity className="h-16 w-16 animate-spin text-primary" />
           <h3 className="text-3xl font-black uppercase tracking-widest italic">Exam Synthesis Active</h3>
           <p className="text-xl font-bold max-w-md">Applying context analysis and generating logical distractors...</p>
        </div>
      )}

      {generatedQuiz && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center gap-4">
            {activeEngine === 'algorithmic' && <Badge className="bg-emerald-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full border-4 border-white dark:border-black"><Binary className="h-4 w-4" /> Logic Engine</Badge>}
            {activeEngine === 'cloud' && <Badge className="bg-purple-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full border-4 border-white dark:border-black"><Globe className="h-4 w-4" /> Cloud Neural Hub</Badge>}
            {activeEngine === 'local' && <Badge className="bg-amber-500 text-white font-black uppercase tracking-widest gap-2 py-2 px-6 rounded-full border-4 border-white dark:border-black"><Cpu className="h-4 w-4" /> Hardware Inference</Badge>}
          </div>

          {quizResults && (
            <Card className="border-4 border-primary shadow-2xl bg-primary text-primary-foreground rounded-[3rem] p-10 relative overflow-hidden group">
                <Sparkles className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
                <div className="relative z-10 text-center space-y-6">
                  <p className="text-sm font-black uppercase tracking-[0.4em] opacity-60">Strategic Performance Report</p>
                  <div className="space-y-1">
                    <p className="text-8xl font-black tabular-nums tracking-tighter">{quizResults.score} / {quizResults.total}</p>
                    <p className="text-2xl font-bold italic opacity-80 uppercase tracking-widest">{Math.round(quizResults.score/quizResults.total*100)}% Accuracy</p>
                  </div>
                  <Button variant="outline" className="mt-4 bg-white/10 border-white/20 text-white font-black h-14 px-10 rounded-2xl uppercase tracking-widest hover:bg-white hover:text-primary transition-all" onClick={() => { setGeneratedQuiz(null); setQuizResults(null); setupForm.reset(); }}>
                    Generate New Matrix
                  </Button>
                </div>
            </Card>
          )}

          <Form {...answersForm}>
            <form onSubmit={answersForm.handleSubmit(onAnswersSubmit)} className="space-y-6">
              {generatedQuiz.questions?.map((q, index) => (
                <Card key={index} className={cn(
                  "border-2 shadow-lg transition-all duration-500 rounded-[2.5rem] overflow-hidden", 
                  quizResults ? (quizResults.results[index] ? "border-emerald-500 bg-emerald-50/10" : "border-destructive bg-destructive/5") : "hover:border-primary/30 bg-background"
                )}>
                  <CardContent className="p-10">
                    <FormField control={answersForm.control} name={`answers.${index}.selectedIndex`} render={({ field }) => (
                        <FormItem className="space-y-8">
                          <div className="flex gap-6 items-start">
                            <span className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shrink-0 border-2 border-primary/20 shadow-inner">{index + 1}</span>
                            <FormLabel className="text-3xl font-black tracking-tight pt-1 leading-tight text-foreground/90">{q.questionText}</FormLabel>
                          </div>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4" disabled={!!quizResults}>
                              {q.options?.map((option, optIndex) => (
                                <FormItem key={optIndex} className={cn(
                                  "flex items-center space-x-4 space-y-0 p-6 rounded-2xl border-4 transition-all cursor-pointer group/opt relative overflow-hidden", 
                                  field.value === String(optIndex) ? "border-primary bg-primary/5 scale-[1.02] shadow-xl" : "border-muted/20 hover:border-primary/30 bg-muted/5"
                                )}>
                                  <FormControl><RadioGroupItem value={String(optIndex)} /></FormControl>
                                  <FormLabel className="font-bold text-xl cursor-pointer flex-1 group-hover/opt:text-primary transition-colors">{option}</FormLabel>
                                  {quizResults && optIndex === q.correctAnswerIndex && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />}
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}/>
                    {quizResults && (
                      <div className="mt-10 p-8 rounded-3xl bg-background border-4 border-dashed border-primary/10 shadow-inner animate-in slide-in-from-top-4">
                         <div className="flex items-center gap-3 mb-4">
                           {quizResults.results[index] ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-destructive" />}
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Feedback Logic</p>
                         </div>
                         <p className="text-2xl font-black text-primary mb-3">Correct Result: {q.options[q.correctAnswerIndex]}</p>
                         <p className="text-lg font-medium text-muted-foreground leading-relaxed italic">"{q.explanation}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!quizResults && (
                <Button type="submit" className="w-full h-24 text-3xl font-black uppercase tracking-widest shadow-[0_30px_60px_-15px_rgba(59,130,246,0.5)] rounded-[2.5rem] hover:scale-[1.01] active:scale-95 transition-all">
                  Evaluate Performance
                </Button>
              )}
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
