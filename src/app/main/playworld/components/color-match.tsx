
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, Zap, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: 'RED', class: 'text-red-500', bg: 'bg-red-500' },
  { name: 'BLUE', class: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'GREEN', class: 'text-green-500', bg: 'bg-green-500' },
  { name: 'YELLOW', class: 'text-yellow-500', bg: 'bg-yellow-500' },
];

export function ColorMatch() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [highScore, setHighScore] = useState(0);
  const [currentTask, setCurrentTask] = useState({ word: 0, color: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('color-match-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateTask = () => {
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    // 50% chance of matching
    const shouldMatch = Math.random() > 0.5;
    const colorIdx = shouldMatch ? wordIdx : Math.floor(Math.random() * COLORS.length);
    setCurrentTask({ word: wordIdx, color: colorIdx });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setIsPlaying(true);
    generateTask();
  };

  const handleAnswer = (match: boolean) => {
    const isCorrect = (currentTask.word === currentTask.color) === match;
    if (isCorrect) {
      setScore(s => s + 1);
      generateTask();
    } else {
      // Small time penalty or just shake
      generateTask();
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
        localStorage.setItem('color-match-high-score', score.toString());
      }
    }
  }, [isPlaying, timeLeft, score, highScore]);

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-rose-500/5">
      <CardHeader className="bg-rose-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle className="text-xl font-black">Color Match</CardTitle>
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
              <div className="space-y-2 mb-4">
                <p className="text-sm font-black uppercase text-rose-600 tracking-widest">Logic Analysis Over</p>
                <p className="text-5xl font-black">{score}</p>
              </div>
            )}
            <Button size="lg" onClick={startGame} className="bg-rose-600 hover:bg-rose-700 font-black px-10 h-14 rounded-2xl shadow-xl">
              {timeLeft === 20 ? 'START STROOP TEST' : 'RETRY TEST'}
            </Button>
            <p className="text-xs font-bold text-muted-foreground uppercase">Does the word match its color? Quick!</p>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2 text-rose-600 font-black">
                <Timer className="h-5 w-5 animate-pulse" />
                <span className="text-2xl tabular-nums">{timeLeft}s</span>
              </div>
              <div className="bg-rose-600 text-white px-4 py-1 rounded-full font-black text-sm">
                SCORE: {score}
              </div>
            </div>

            <div className="text-center py-12 bg-white dark:bg-black/40 rounded-[2.5rem] border-4 border-rose-500/20 shadow-inner">
              <span className={cn("text-6xl font-black tracking-tighter", COLORS[currentTask.color].class)}>
                {COLORS[currentTask.word].name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline" 
                className="h-20 rounded-2xl border-4 border-rose-500/20 text-rose-600 font-black text-lg hover:bg-rose-50"
              >
                <X className="mr-2 h-6 w-6" /> NO
              </Button>
              <Button 
                onClick={() => handleAnswer(true)} 
                className="h-20 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black text-lg shadow-xl"
              >
                <Check className="mr-2 h-6 w-6" /> YES
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
