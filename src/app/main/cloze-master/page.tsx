
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  Brain, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowDown, 
  FileQuestion,
  Sparkles,
  Trophy
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Blank = {
  index: number;
  word: string;
  userValue: string;
  isCorrect: boolean | null;
};

export default function ClozeMasterPage() {
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [blanks, setBlanks] = useState<Blank[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState(5); // Hide 1 in every 5 words

  const generateQuiz = () => {
    if (text.trim().length < 50) return;

    const words = text.trim().split(/\s+/);
    const newBlanks: Blank[] = [];
    const processedTokens = words.map((word, idx) => {
      // Logic: Hide words that are reasonably long and match the frequency gap
      const isSignificant = word.length > 3;
      if (isSignificant && idx % difficulty === 0) {
        // Clean the word of punctuation for the answer key
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        newBlanks.push({
          index: idx,
          word: cleanWord,
          userValue: "",
          isCorrect: null
        });
        return "____";
      }
      return word;
    });

    setTokens(words);
    setBlanks(newBlanks);
    setIsPlaying(true);
    setScore({ correct: 0, total: newBlanks.length });
  };

  const handleInputChange = (blankIdx: number, val: string) => {
    const updated = [...blanks];
    updated[blankIdx].userValue = val;
    setBlanks(updated);
  };

  const checkAnswers = () => {
    let correctCount = 0;
    const updated = blanks.map(b => {
      const isCorrect = b.userValue.toLowerCase().trim() === b.word.toLowerCase().trim();
      if (isCorrect) correctCount++;
      return { ...b, isCorrect };
    });
    setBlanks(updated);
    setScore({ correct: correctCount, total: blanks.length });
  };

  const reset = () => {
    setIsPlaying(false);
    setBlanks([]);
    setTokens([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Cloze Master</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto">
          Algorithmic memory retrieval. No AI needed—just pure logic to test your recall.
        </p>
      </div>

      {!isPlaying ? (
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Input Source Text</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <Textarea 
              placeholder="Paste your study notes or a paragraph from a book here..." 
              className="min-h-[300px] border-2 rounded-2xl p-6 font-medium text-lg leading-relaxed focus:border-primary shadow-inner transition-all resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gap Frequency:</span>
                <div className="flex gap-2">
                  {[3, 5, 7, 10].map(val => (
                    <Button 
                      key={val} 
                      variant={difficulty === val ? 'default' : 'outline'} 
                      onClick={() => setDifficulty(val)}
                      className="h-10 w-12 rounded-xl font-black text-xs"
                    >
                      1:{val}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={generateQuiz} 
                disabled={text.length < 50}
                className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Zap className="mr-3 h-5 w-5 fill-white/20" /> Generate Algorithmic Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Button variant="outline" onClick={reset} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 border-2 gap-2">
              <RotateCcw className="h-4 w-4" /> New Text
            </Button>
            
            <div className="flex items-center gap-4 bg-background border-4 rounded-2xl px-6 py-3 shadow-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Your Score</p>
                <p className="text-2xl font-black tabular-nums leading-none">{score.correct} / {score.total}</p>
              </div>
            </div>
          </div>

          <Card className="border-4 shadow-2xl rounded-[3rem] bg-background overflow-hidden">
            <CardHeader className="bg-primary/5 border-b-4 border-primary/5 p-10">
              <div className="flex items-center gap-4">
                <Brain className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Recall Phase</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="flex flex-wrap gap-x-2 gap-y-4 leading-relaxed">
                {tokens.map((word, idx) => {
                  const blankIdx = blanks.findIndex(b => b.index === idx);
                  if (blankIdx !== -1) {
                    const blank = blanks[blankIdx];
                    return (
                      <div key={idx} className="inline-flex flex-col items-center group">
                        <Input 
                          value={blank.userValue}
                          onChange={(e) => handleInputChange(blankIdx, e.target.value)}
                          className={cn(
                            "w-32 h-10 border-b-4 border-t-0 border-x-0 rounded-none bg-primary/5 px-2 text-center font-black transition-all",
                            blank.isCorrect === true && "border-emerald-500 bg-emerald-50 text-emerald-700",
                            blank.isCorrect === false && "border-rose-500 bg-rose-50 text-rose-700",
                            blank.isCorrect === null && "border-primary focus-visible:ring-0 focus:bg-primary/10"
                          )}
                          placeholder="???"
                        />
                        {blank.isCorrect === false && (
                          <span className="text-[10px] font-black text-emerald-600 uppercase mt-1 animate-in fade-in slide-in-from-top-1">
                            {blank.word}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return (
                    <span key={idx} className="text-xl font-bold text-foreground/80 py-1">
                      {word}
                    </span>
                  );
                })}
              </div>

              <div className="pt-12 border-t-4 border-dashed mt-12 flex justify-center">
                <Button 
                  onClick={checkAnswers} 
                  className="h-16 px-16 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  Evaluate Logic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isPlaying && (
        <div className="h-[200px] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group hover:opacity-30 transition-all bg-muted/5">
           <Sparkles className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
           <h3 className="text-2xl font-black uppercase tracking-widest">Logic Engine Ready</h3>
           <p className="text-sm font-bold mt-2 uppercase tracking-tighter">Paste text to build an offline memory challenge.</p>
        </div>
      )}
    </div>
  );
}
