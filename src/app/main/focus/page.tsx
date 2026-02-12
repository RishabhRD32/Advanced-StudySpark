
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Music, 
  Volume2, 
  VolumeX, 
  Target, 
  Trophy, 
  Maximize2, 
  Minimize2,
  CloudRain,
  Waves,
  Wind,
  CheckCircle2,
  Zap,
  Coffee
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const quotes = [
  "Deep work is the superpower of the 21st century.",
  "Focus is a matter of deciding what things you're not going to do.",
  "Don't stop until you're proud.",
  "Small progress is still progress.",
  "Your focus determines your reality."
];

const ambientSounds = [
  { id: 'rain', name: 'Soft Rain', icon: <CloudRain className="h-4 w-4" />, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder URLs
  { id: 'waves', name: 'Ocean Waves', icon: <Waves className="h-4 w-4" />, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'white-noise', name: 'White Noise', icon: <Wind className="h-4 w-4" />, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function FocusStudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isZenMode, setIsZenMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [todos, setTodos] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Todos
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "todos"), where("userId", "==", user.uid), where("completed", "==", false));
    const unsub = onSnapshot(q, (s) => {
      setTodos(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  // Quote Rotation
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 30000);
    return () => clearInterval(quoteInterval);
  }, []);

  const handleSessionComplete = async () => {
    setIsActive(false);
    const completedMinutes = Math.floor(totalTime / 60);
    
    if (mode === 'work' && user) {
      // Log to Firestore
      try {
        const statsRef = doc(db, 'userStats', user.uid);
        const statsSnap = await getDoc(statsRef);
        
        const sessionData = {
          date: Timestamp.now(),
          duration: completedMinutes / 60, // in hours
          task: selectedTask || 'General Study'
        };

        if (statsSnap.exists()) {
          await updateDoc(statsRef, {
            studySessions: arrayUnion(sessionData),
            lastStudiedDate: serverTimestamp()
          });
        } else {
          await setDoc(statsRef, {
            userId: user.uid,
            studyStreak: 1,
            lastStudiedDate: serverTimestamp(),
            studySessions: [sessionData]
          });
        }
        
        toast({
          title: "Session Logged!",
          description: `You focused for ${completedMinutes} minutes. Great work!`,
        });
      } catch (e) {
        console.error("Error logging session:", e);
      }
    }

    setMode(mode === 'work' ? 'break' : 'work');
    const nextTime = mode === 'work' ? 5 * 60 : 25 * 60;
    setTimeLeft(nextTime);
    setTotalTime(nextTime);
    
    // Play completion sound
    const notification = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    notification.play().catch(() => {});
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (minutes: number, newMode: 'work' | 'break' = 'work') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
  };

  const toggleSound = (url: string) => {
    if (audioSource === url) {
      setAudioSource(null);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setAudioSource(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    }
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className={cn(
      "max-w-6xl mx-auto space-y-10 pb-20 transition-all duration-700",
      isZenMode && "fixed inset-0 z-[100] bg-background pt-20 px-8 max-w-none"
    )}>
      {/* HEADER */}
      {!isZenMode && (
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Focus Studio</h1>
          <p className="text-xl text-muted-foreground font-bold opacity-80">
            A silent, optimized workspace for your brain.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TIMER MAIN CARD */}
        <Card className={cn(
          "lg:col-span-2 border-4 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl rounded-[3rem] transition-all",
          isZenMode && "lg:col-span-3 border-none shadow-none bg-transparent"
        )}>
          <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-6 flex flex-row items-center justify-between px-10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary">
                {mode === 'work' ? 'Intensity Phase' : 'Recharge Phase'}
              </CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsZenMode(!isZenMode)}
              className="rounded-2xl hover:bg-primary/10"
            >
              {isZenMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </CardHeader>
          <CardContent className="p-12 flex flex-col items-center gap-12">
            
            {/* TIMER CIRCLE */}
            <div className="relative h-80 w-80 md:h-[450px] md:w-[450px] flex items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90">
                <circle 
                  cx="50%" cy="50%" r="46%" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  className="text-muted/10" 
                />
                <circle 
                  cx="50%" cy="50%" r="46%" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  className="text-primary transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                  strokeDasharray="289%" 
                  strokeDashoffset={`${289 - (2.89 * progress)}%`} 
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="text-center z-10 space-y-2 animate-in fade-in duration-1000">
                <div className="text-[100px] md:text-[140px] font-black tabular-nums tracking-tighter leading-none text-foreground drop-shadow-2xl">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                {selectedTask && (
                  <div className="flex items-center justify-center gap-2 text-primary font-black uppercase text-xs tracking-widest bg-primary/10 py-2 px-4 rounded-full">
                    <Target className="h-3 w-3" /> Focusing on: {selectedTask}
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center gap-8">
              <Button 
                onClick={toggleTimer} 
                className="h-24 w-24 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-95 transition-all"
              >
                {isActive ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-2" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => resetTimer(totalTime / 60, mode)} 
                className="h-16 w-16 rounded-2xl border-4 hover:bg-primary/5 transition-all"
              >
                <RotateCcw className="h-6 w-6 text-primary" />
              </Button>
            </div>

            {/* PRESETS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              <Button variant="secondary" onClick={() => resetTimer(25)} className="font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest border-2 border-transparent hover:border-primary/20">Short Focus</Button>
              <Button variant="secondary" onClick={() => resetTimer(50)} className="font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest border-2 border-transparent hover:border-primary/20">Deep Focus</Button>
              <Button variant="secondary" onClick={() => resetTimer(5, 'break')} className="font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest border-2 border-transparent hover:border-primary/20">Short Break</Button>
              <Button variant="secondary" onClick={() => resetTimer(15, 'break')} className="font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest border-2 border-transparent hover:border-primary/20">Long Break</Button>
            </div>
          </CardContent>
        </Card>

        {/* SIDEBAR TOOLS */}
        {!isZenMode && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
            {/* TASK SELECTOR */}
            <Card className="border-2 shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardHeader className="bg-primary/5 border-b p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">Active Objective</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Select onValueChange={setSelectedTask} value={selectedTask}>
                  <SelectTrigger className="h-14 border-2 font-bold rounded-2xl bg-background">
                    <SelectValue placeholder="Select from your list..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4">
                    {todos.map(todo => (
                      <SelectItem key={todo.id} value={todo.text} className="font-bold py-3">{todo.text}</SelectItem>
                    ))}
                    {todos.length === 0 && <SelectItem value="General" disabled>No active tasks</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase text-center">Your choice will be logged upon completion.</p>
              </CardContent>
            </Card>

            {/* SOUNDS */}
            <Card className="border-2 shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardHeader className="bg-primary/5 border-b p-6">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">Audio Environment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {ambientSounds.map(sound => (
                    <Button 
                      key={sound.id}
                      variant={audioSource === sound.url ? 'default' : 'ghost'}
                      onClick={() => toggleSound(sound.url)}
                      className="justify-start gap-4 h-14 rounded-2xl font-bold transition-all"
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center border-2 transition-all",
                        audioSource === sound.url ? "bg-white/20 border-white" : "bg-primary/5 border-primary/10 text-primary"
                      )}>
                        {sound.icon}
                      </div>
                      {sound.name}
                    </Button>
                  ))}
                </div>
                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Volume Control</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-5 w-5 text-destructive" /> : <Volume2 className="h-5 w-5 text-primary" />}
                  </Button>
                </div>
                <audio ref={audioRef} loop muted={isMuted} />
              </CardContent>
            </Card>

            {/* MOTIVATION */}
            <Card className="border-4 border-dashed border-primary/10 bg-primary/5 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
              <Zap className="h-12 w-12 text-primary opacity-10 absolute -top-2 -left-2 rotate-12 group-hover:scale-150 transition-transform" />
              <p className="text-xl font-black italic tracking-tight leading-relaxed mb-4">
                "{currentQuote}"
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                <span className="h-px w-8 bg-primary/20" />
                Dose of Clarity
                <span className="h-px w-8 bg-primary/20" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ZEN MODE QUOTE OVERLAY */}
      {isZenMode && (
        <div className="fixed bottom-20 left-0 w-full text-center px-10 animate-in slide-in-from-bottom-10 duration-1000">
           <p className="text-3xl font-bold text-muted-foreground/40 italic max-w-4xl mx-auto">
             "{currentQuote}"
           </p>
        </div>
      )}
    </div>
  );
}
