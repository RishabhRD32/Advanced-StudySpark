
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Timer, Brain, RefreshCw } from "lucide-react";

const WORDS = [
  'BIOLOGY', 'PHYSICS', 'CALCULUS', 'HISTORY', 'GENETICS', 
  'ALGEBRA', 'CHEMISTRY', 'GEOLOGY', 'ACADEMIC', 'RESEARCH',
  'STUDENT', 'TEACHER', 'LIBRARY', 'COLLEGE', 'DIPLOMA'
];

export function WordScramble() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scramble-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const scramble = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const nextWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setScrambled(scramble(word));
    setUserInput('');
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    nextWord();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isPlaying) return;
    if (userInput.toUpperCase() === currentWord) {
      setScore(s => s + 1);
      nextWord();
    } else {
      setUserInput('');
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
        localStorage.setItem('scramble-high-score', score.toString());
      }
    }
  }, [isPlaying, timeLeft, score, highScore]);

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-cyan-500/5">
      <CardHeader className="bg-cyan-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle className="text-xl font-black">Word Scramble</CardTitle>
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
                <p className="text-sm font-black uppercase text-cyan-600 tracking-widest">Vocabulary Sync Complete</p>
                <p className="text-5xl font-black">{score}</p>
              </div>
            )}
            <Button size="lg" onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 font-black px-10 h-14 rounded-2xl shadow-xl">
              {timeLeft === 30 ? 'DECRYPT WORDS' : 'RESTART DECRYPTION'}
            </Button>
            <p className="text-xs font-bold text-muted-foreground uppercase">Unscramble academic terms fast.</p>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2 text-cyan-600 font-black">
                <Timer className="h-5 w-5 animate-pulse" />
                <span className="text-2xl tabular-nums">{timeLeft}s</span>
              </div>
              <div className="bg-cyan-600 text-white px-4 py-1 rounded-full font-black text-sm">
                SCORE: {score}
              </div>
            </div>

            <div className="text-center py-10 bg-white dark:bg-black/40 rounded-3xl border-4 border-cyan-500/20 shadow-inner">
              <span className="text-4xl font-black tracking-[0.2em] text-cyan-600">
                {scrambled}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="text-center text-2xl h-16 rounded-2xl border-4 font-black focus-visible:ring-cyan-500 uppercase"
                placeholder="TYPE WORD..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={nextWord} className="h-14 w-14 rounded-xl border-2">
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button type="submit" className="flex-1 h-14 text-lg font-black bg-cyan-600 hover:bg-cyan-700 shadow-lg">
                  SUBMIT
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
