
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScanText, Clock, FileText, Type, Zap, BookOpen, GraduationCap, ArrowDown } from "lucide-react";
import { Badge } from '@/components/ui/badge';

export default function ReadingAnalyticsPage() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    sentences: 0,
    syllables: 0,
    readTime: 0,
    speakTime: 0,
    readability: 0
  });

  useEffect(() => {
    const cleanText = text.trim();
    if (!cleanText) {
      setStats({ words: 0, chars: 0, sentences: 0, syllables: 0, readTime: 0, speakTime: 0, readability: 0 });
      return;
    }

    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = cleanText.length;
    const sentences = cleanText.split(/[.!?]+/).filter(Boolean).length || 1;
    
    // Simple syllable estimation
    let syllables = 0;
    words.forEach(w => {
      const match = w.toLowerCase().match(/[aeiouy]{1,2}/g);
      syllables += match ? match.length : 1;
    });

    // Flesch-Kincaid Grade Level
    // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    const gradeLevel = wordCount > 0 
      ? (0.39 * (wordCount / sentences)) + (11.8 * (syllables / wordCount)) - 15.59
      : 0;

    setStats({
      words: wordCount,
      chars: charCount,
      sentences,
      syllables,
      readTime: Math.ceil(wordCount / 200),
      speakTime: Math.ceil(wordCount / 130),
      readability: Math.max(0, parseFloat(gradeLevel.toFixed(1)))
    });
  }, [text]);

  const getReadabilityLabel = (level: number) => {
    if (level <= 6) return "Elementary";
    if (level <= 12) return "High School";
    if (level <= 16) return "Undergraduate";
    return "Graduate / Professional";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <ScanText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Reading Stats</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto">
          Algorithmic text analysis for essays and research papers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden h-full">
            <CardHeader className="bg-primary/5 border-b p-8">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Content Input</CardTitle>
            </CardHeader>
            <CardContent className="p-8 h-full">
              <Textarea 
                placeholder="Paste your essay or study material here..." 
                className="min-h-[400px] border-2 rounded-2xl p-6 font-medium text-lg leading-relaxed focus:border-primary shadow-inner transition-all resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 rounded-[2rem] p-6 text-center space-y-2 bg-background shadow-sm hover:border-primary/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Word Count</p>
              <p className="text-4xl font-black text-primary tabular-nums">{stats.words}</p>
            </Card>
            <Card className="border-2 rounded-[2rem] p-6 text-center space-y-2 bg-background shadow-sm hover:border-primary/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Char Count</p>
              <p className="text-4xl font-black text-primary tabular-nums">{stats.chars}</p>
            </Card>
          </div>

          <Card className="border-4 border-primary shadow-2xl bg-primary text-primary-foreground rounded-[2.5rem] p-8 relative overflow-hidden group">
            <Zap className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 opacity-60" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Reading Complexity</p>
              </div>
              <div className="space-y-1">
                <p className="text-6xl font-black tracking-tighter">Level {stats.readability}</p>
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 italic">{getReadabilityLabel(stats.readability)}</p>
              </div>
              <div className="pt-6 border-t border-white/20">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                  BASED ON THE FLESCH-KINCAID ALGORITHM. HIGHER SCORES INDICATE MORE COMPLEX VOCABULARY AND SENTENCE STRUCTURE.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-2 shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-4 border-b pb-4">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Timing Estimations</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold uppercase tracking-tight">Silent Reading</span>
                </div>
                <Badge variant="outline" className="font-black text-lg h-10 px-4 rounded-xl border-2 tabular-nums">{stats.readTime} min</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold uppercase tracking-tight">Vocal Speaking</span>
                </div>
                <Badge variant="outline" className="font-black text-lg h-10 px-4 rounded-xl border-2 tabular-nums">{stats.speakTime} min</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
