
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Play, Trophy, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function MemoryMaster() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('memory-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startNewGame = () => {
    setScore(0);
    setStatus('playing');
    const firstMove = Math.floor(Math.random() * 4);
    setSequence([firstMove]);
    showSequence([firstMove]);
  };

  const showSequence = async (seq: number[]) => {
    setIsShowing(true);
    setUserSequence([]);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveIndex(seq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveIndex(null);
    }
    setIsShowing(false);
  };

  const handleTileClick = (index: number) => {
    if (isShowing || status !== 'playing') return;
    
    const newUserSeq = [...userSequence, index];
    setUserSequence(newUserSeq);

    if (index !== sequence[newUserSeq.length - 1]) {
      setStatus('gameover');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('memory-high-score', score.toString());
      }
      return;
    }

    if (newUserSeq.length === sequence.length) {
      setScore(s => s + 1);
      const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(nextSeq);
      setTimeout(() => showSequence(nextSeq), 800);
    }
  };

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-amber-500/5">
      <CardHeader className="bg-amber-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Neuro Recall</CardTitle>
          </div>
          <div className="flex items-center gap-2 font-black text-xs">
            <Trophy className="h-4 w-4" />
            <span>Record: {highScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center justify-center flex-1">
        {status === 'idle' ? (
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border-4 border-amber-500">
              <Brain className="h-10 w-10 text-amber-500" />
            </div>
            <Button size="lg" onClick={startNewGame} className="bg-amber-600 hover:bg-amber-700 font-black px-10 h-14 rounded-2xl shadow-xl">
              INITIATE NEURAL LINK
            </Button>
          </div>
        ) : status === 'gameover' ? (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-destructive uppercase tracking-[0.3em]">Neural Link Severed</p>
              <p className="text-5xl font-black">{score}</p>
              <p className="text-xs font-bold text-muted-foreground">Sequences Processed</p>
            </div>
            <Button variant="outline" size="lg" onClick={startNewGame} className="font-black px-10 border-2 h-14 rounded-2xl hover:bg-amber-50">
              RETRY CONNECTION
            </Button>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-[240px]">
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Rank</p>
              <p className="text-3xl font-black text-amber-600">{score}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  onClick={() => handleTileClick(i)}
                  className={cn(
                    "h-24 w-24 rounded-2xl border-4 transition-all duration-200 cursor-pointer shadow-sm",
                    i === 0 && "border-blue-500 bg-blue-500/10",
                    i === 1 && "border-red-500 bg-red-500/10",
                    i === 2 && "border-yellow-500 bg-yellow-500/10",
                    i === 3 && "border-green-500 bg-green-500/10",
                    activeIndex === i && "scale-110 brightness-150 shadow-lg ring-4 ring-white",
                    isShowing ? "cursor-default" : "hover:brightness-110 active:scale-95"
                  )}
                />
              ))}
            </div>
            <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">
              {isShowing ? "Observing Pattern..." : "Reproduce Input Now"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
