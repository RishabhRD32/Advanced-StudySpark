
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Zap, Trophy, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReactionBlitz() {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('reaction-high-score');
    if (saved) setBestTime(parseInt(saved));
  }, []);

  const startTest = () => {
    setStatus('waiting');
    const delay = Math.floor(Math.random() * 3000) + 2000;
    timerRef.current = setTimeout(() => {
      setStatus('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (status === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus('result');
      setResult(-1); // Too early
    } else if (status === 'ready') {
      const ms = Date.now() - startTime;
      setResult(ms);
      setStatus('result');
      if (ms < bestTime || bestTime === 0) {
        setBestTime(ms);
        localStorage.setItem('reaction-high-score', ms.toString());
      }
    }
  };

  const getRank = (time: number) => {
    if (time === -1) return { label: "TOO EARLY!", color: "text-destructive" };
    if (time < 200) return { label: "SUPERSONIC", color: "text-emerald-500" };
    if (time < 250) return { label: "PRO REFLEXES", color: "text-blue-500" };
    if (time < 350) return { label: "STEADY", color: "text-amber-500" };
    return { label: "IDLE", color: "text-muted-foreground" };
  };

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-emerald-500/5">
      <CardHeader className="bg-emerald-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Reaction Blitz</CardTitle>
          </div>
          <div className="flex items-center gap-2 font-black">
            <Trophy className="h-4 w-4" />
            <span>Best: {bestTime ? `${bestTime}ms` : '---'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div 
          onClick={status === 'waiting' || status === 'ready' ? handleClick : undefined}
          className={cn(
            "w-full h-full min-h-[350px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden",
            status === 'waiting' && "bg-amber-500 text-white",
            status === 'ready' && "bg-emerald-500 text-white animate-pulse",
            status === 'idle' || status === 'result' ? "bg-transparent" : ""
          )}
        >
          {status === 'idle' && (
            <div className="text-center p-8 space-y-6">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-4 border-emerald-500">
                <MousePointer2 className="h-10 w-10 text-emerald-500" />
              </div>
              <Button size="lg" onClick={startTest} className="bg-emerald-600 hover:bg-emerald-700 font-black px-10 rounded-2xl h-14 shadow-xl">
                START REFLEX TEST
              </Button>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Wait for green. Click fast.</p>
            </div>
          )}

          {status === 'waiting' && (
            <div className="text-center animate-in zoom-in duration-300">
              <Timer className="h-16 w-16 mx-auto mb-4 animate-spin duration-[2000ms]" />
              <h2 className="text-4xl font-black tracking-tighter">STAND BY...</h2>
            </div>
          )}

          {status === 'ready' && (
            <div className="text-center animate-in scale-110 duration-100">
              <Zap className="h-20 w-20 mx-auto mb-4 fill-white" />
              <h2 className="text-6xl font-black tracking-tighter">CLICK NOW!</h2>
            </div>
          )}

          {status === 'result' && (
            <div className="text-center p-8 space-y-6">
              <div className="space-y-2">
                <p className={cn("text-xs font-black uppercase tracking-[0.3em]", getRank(result).color)}>Performance Rank</p>
                <h2 className={cn("text-5xl font-black tracking-tighter", getRank(result).color)}>
                  {getRank(result).label}
                </h2>
                {result !== -1 && <p className="text-6xl font-black tabular-nums">{result}ms</p>}
              </div>
              <Button size="lg" onClick={startTest} variant="outline" className="font-black px-10 rounded-2xl border-2 h-14 shadow-md transition-all hover:scale-105 active:scale-95">
                RETRY SYSTEM
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
