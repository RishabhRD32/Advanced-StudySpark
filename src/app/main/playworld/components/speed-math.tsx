
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Timer, Calculator, Zap, RotateCcw } from "lucide-react";

export function SpeedMath() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [userValue, setUserValue] = useState('');
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('speed-math-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateProblem = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '*') {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
    } else {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
    }
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    setProblem({ a, b, op, ans });
    setUserValue('');
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    generateProblem();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isPlaying) return;
    if (parseInt(userValue) === problem.ans) {
      setScore(s => s + 1);
      generateProblem();
    } else {
      setUserValue('');
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('speed-math-high-score', score.toString());
      }
    }
  }, [isPlaying, timeLeft, score, highScore]);

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-blue-500/5">
      <CardHeader className="bg-blue-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <CardTitle className="text-xl font-black">Speed Math</CardTitle>
          </div>
          <div className="flex items-center gap-2 font-black">
            <Trophy className="h-4 w-4" />
            <span>Best: {highScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center justify-center flex-1">
        {!isPlaying ? (
          <div className="text-center space-y-6">
            {timeLeft === 0 && (
              <div className="space-y-2 mb-4 animate-in zoom-in duration-300">
                <p className="text-sm font-black uppercase text-blue-600 tracking-widest">Training Complete</p>
                <p className="text-5xl font-black">{score}</p>
                <p className="text-xs font-bold text-muted-foreground">Strategic Points Earned</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-4">
              <Button size="lg" onClick={startGame} className="bg-blue-600 hover:bg-blue-700 font-black px-10 h-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                {timeLeft === 30 ? 'INITIATE CHALLENGE' : 'RESTART SYSTEM'}
              </Button>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">30 Seconds. Rapid Arithmetic.</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2 text-blue-600 font-black">
                <Timer className="h-5 w-5 animate-pulse" />
                <span className="text-2xl tabular-nums">{timeLeft}s</span>
              </div>
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full font-black text-sm">
                SCORE: {score}
              </div>
            </div>
            
            <div className="text-center py-10 bg-white dark:bg-black/40 rounded-3xl border-4 border-blue-500/20 shadow-inner">
              <span className="text-6xl font-black tracking-tighter tabular-nums">
                {problem.a} {problem.op === '*' ? '×' : problem.op} {problem.b}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                ref={inputRef}
                type="number"
                value={userValue}
                onChange={(e) => setUserValue(e.target.value)}
                className="text-center text-4xl h-20 rounded-2xl border-4 font-black focus-visible:ring-blue-500"
                placeholder="?"
                autoFocus
              />
              <Button type="submit" className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-lg">
                SUBMIT ANSWER
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
