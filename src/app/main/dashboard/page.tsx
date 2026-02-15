
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  Flame, 
  Target, 
  Zap,
  Activity,
  ListTodo,
  Clock,
  Calendar as CalendarIcon,
  Megaphone,
  ChevronRight,
  Timer,
  Sparkles,
  Calculator,
  ArrowUpRight,
  Lock,
  BarChart3,
  PieChart,
  Trophy,
  BrainCircuit,
  ScrollText,
  Search as SearchIcon
} from "lucide-react";
import Link from "next/link";
import { useDashboardStats, useAssignments, useAnnouncements } from "@/hooks/use-firestore";
import { parseISO, format } from 'date-fns';
import { DashboardTimetable } from "./components/dashboard-timetable";
import { ScientificCalculator } from "./components/scientific-calculator";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { announcements, loading: annLoading } = useAnnouncements(userProfile?.ccCode);
  const [todos, setTodos] = useState<any[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "todos"), 
      where("userId", "==", user.uid), 
      where("completed", "==", false), 
      limit(5)
    );
    const unsub = onSnapshot(q, (s) => {
      setTodos(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, async (serverError) => {
      if (!user) return;
      const permissionError = new FirestorePermissionError({
        path: 'todos',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    return () => unsub();
  }, [user]);

  const upcomingAssignments = assignments
    .filter(a => a.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const isStudent = userProfile?.profession === 'student';

  if (!isMounted) return null;

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20 px-2 md:px-4 animate-slide-up-fade">
      {/* HEADER SECTION */}
      <div className="pb-8 border-b-2 border-primary/5 space-y-4">
        {/* Status indicator moved above */}
        <div className="flex items-center gap-2 px-1">
          <div className="relative h-2 w-2">
            <span className="absolute inset-0 bg-primary/40 blur-sm rounded-full animate-ping" />
            <span className="relative block h-full w-full rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">System Online</span>
        </div>

        {/* Main Identity & Time Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col items-baseline">
            <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl md:text-5xl font-black tracking-tighter text-muted-foreground/40">Welcome,</span>
              <span className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-transparent bg-clip-text italic pr-4 pb-1">
                {userProfile?.firstName || 'Scholar'}
              </span>
            </h1>
          </div>

          {time && (
            <div className="flex items-center gap-4 bg-background/50 backdrop-blur-xl px-6 md:px-8 py-3 md:py-4 rounded-full border-2 border-primary/5 shadow-inner group hover:border-primary/20 transition-all shrink-0">
              <div className="text-xl md:text-3xl font-black tabular-nums tracking-tight text-primary leading-none">
                {format(time, 'hh:mm a')}
              </div>
              <div className="h-6 md:h-8 w-0.5 bg-primary/10" />
              <div className="flex flex-col justify-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground leading-none">
                  {format(time, 'eeee, dd MMM')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS HUB */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {[
            { href: "/main/ai-tutor", icon: <BrainCircuit className="h-4 w-4" />, label: "Ask AI" },
            { href: "/main/ai-summarizer", icon: <ScrollText className="h-4 w-4" />, label: "Summarize" },
            { href: "/main/ai-researcher", icon: <SearchIcon className="h-4 w-4" />, label: "Research" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" className="h-10 px-5 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest gap-2 bg-background hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm">
                {action.icon}
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl transition-all duration-500 overflow-hidden relative rounded-[2.5rem] h-48 md:h-52 group cursor-default">
          <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12"><BookOpen className="h-24 md:h-32 w-24 md:w-32" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">My Subjects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-28 md:h-32">
            {statsLoading ? <Skeleton className="h-16 w-20 bg-white/20" /> : <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter">{stats.subjectsCompleted}</div>}
          </CardContent>
        </Card>
        
        <Card className="glass-card h-48 md:h-52 group border-2 border-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">My Score</CardTitle>
            <Target className="h-5 w-5 text-primary absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-all duration-500" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-28 md:h-32">
            {statsLoading ? <Skeleton className="h-16 w-24" /> : <div className="text-6xl md:text-8xl font-black text-primary tabular-nums tracking-tighter leading-none">{stats.averageScore}<span className="text-2xl md:text-3xl opacity-40 ml-1">%</span></div>}
          </CardContent>
        </Card>
        
        <Card className="glass-card h-48 md:h-52 group border-orange-500/5 hover:border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Day Streak</CardTitle>
            <Flame className="h-6 w-6 text-orange-500 absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-all" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-28 md:h-32">
            {statsLoading ? <Skeleton className="h-16 w-20" /> : <div className="text-6xl md:text-8xl font-black text-orange-500 tabular-nums tracking-tighter">{stats.studyStreak}</div>}
            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mt-2">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="glass-card h-48 md:h-52 flex flex-col justify-between p-6 md:p-8 border-emerald-500/5 hover:border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex justify-between items-start">
            <div className="h-12 md:h-14 w-12 md:w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
              <Timer className="h-6 md:h-7 w-6 md:w-7 text-emerald-500" />
            </div>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 font-black uppercase text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1">Timer</Badge>
          </div>
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600/60">Work Space</h3>
            <Button asChild className="w-full rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] h-10 md:h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
              <Link href="/main/focus" className="flex items-center justify-center gap-2">Focus Now <ArrowUpRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* PRIMARY WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2 md:px-4">
             <div className="flex items-center gap-4">
               <div className="h-10 md:h-12 w-10 md:w-12 bg-primary/5 rounded-xl md:rounded-[1.25rem] flex items-center justify-center border-2 border-primary/10 shadow-inner">
                 <CalendarIcon className="h-4 md:h-5 w-4 md:w-5 text-primary" />
               </div>
               <div>
                 <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter">Class Schedule</h2>
                 <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Your week at a glance</p>
               </div>
             </div>
             <Button asChild variant="ghost" className="rounded-xl h-9 md:h-10 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-primary/5 gap-2">
               <Link href="/main/timetable">See More <ChevronRight className="h-3 w-3" /></Link>
             </Button>
          </div>
          <div className="w-full overflow-hidden">
            {userProfile?.accessTimetable !== false ? (
              <DashboardTimetable />
            ) : (
              <div className="h-[300px] border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-20 bg-muted/5">
                <Lock className="h-12 w-12 mb-4" />
                <p className="font-black uppercase tracking-widest px-4 text-sm md:text-base">Schedule Access Disabled</p>
                <p className="text-xs font-bold text-muted-foreground px-4">Enable in Settings to see your grid.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-8 lg:space-y-0">
          <div className="flex lg:hidden items-center gap-4 px-2 mb-2">
             <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center border-2 border-primary/10">
               <Calculator className="h-4 w-4 text-primary" />
             </div>
             <div>
               <h2 className="text-lg font-black uppercase tracking-tighter">Lab Core</h2>
             </div>
          </div>
          <div className="animate-in slide-in-from-right-8 duration-700 flex-1">
            <ScientificCalculator />
          </div>
        </div>
      </div>

      {/* DEEP ANALYTICS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="glass-card col-span-1 border-2 border-primary/5">
          <CardHeader className="py-6 md:py-8 px-6 md:px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <PieChart className="h-5 md:h-6 w-5 md:w-6 text-primary" />
              <div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Task Velocity</CardTitle>
                <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-50">Assignment Completion</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-10 flex flex-col items-center">
            {statsLoading ? <Skeleton className="h-[180px] md:h-[200px] w-[180px] md:w-[200px] rounded-full" /> : (
              <div className="h-[180px] md:h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.assignmentStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.assignmentStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: '4px solid hsl(var(--primary)/0.1)', background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(10px)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_hsla(var(--primary),0.5)]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-muted shadow-inner" />
                <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card col-span-1 lg:col-span-2 border-2 border-primary/5">
          <CardHeader className="py-6 md:py-8 px-6 md:px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-5 md:h-6 w-5 md:w-6 text-primary" />
              <div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Academic Mastery</CardTitle>
                <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-50">Score by Subject</p>
              </div>
            </div>
            <Trophy className="h-4 md:h-5 w-4 md:w-5 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="pt-8 md:pt-10 px-4 md:px-8 pb-8">
            {statsLoading ? <Skeleton className="h-[200px] md:h-[250px] w-full rounded-2xl" /> : stats.subjectPerformance.length > 0 ? (
              <div className="h-[200px] md:h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.subjectPerformance} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', textTransform: 'uppercase'}}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsla(var(--primary), 0.05)', radius: 12}}
                      contentStyle={{borderRadius: '24px', border: '4px solid hsl(var(--primary)/0.1)', background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(10px)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 20, 20, 0]} 
                      barSize={24}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] md:h-[250px] flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Sparkles className="h-8 md:h-12 w-8 md:w-12" />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest px-4">Complete assignments to unlock mastery data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECONDARY WORKSPACE */}
      <div className={cn("grid grid-cols-1 gap-8", isStudent ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
        {isStudent && (
          <Card className="glass-card overflow-hidden border-2 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-primary/5 py-6 md:py-8 px-6 md:px-10 bg-primary/[0.02]">
              <div className="flex items-center gap-4">
                <Target className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                <div>
                  <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Current Targets</CardTitle>
                  <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-50">Academic goals</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="h-8 md:h-9 px-4 md:px-5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-xl border-2 hover:bg-primary/5">
                <Link href="/main/subjects">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {assignmentsLoading ? (
                <div className="p-10 space-y-4"><Skeleton className="h-16 w-full rounded-2xl" /><Skeleton className="h-16 w-full rounded-2xl" /></div>
              ) : (
                <Table className="min-w-[400px]">
                  <TableBody>
                    {upcomingAssignments.length > 0 ? (
                      upcomingAssignments.map((a) => (
                        <TableRow key={a.id} className="hover:bg-primary/[0.03] border-none group transition-all h-20 md:h-24">
                          <TableCell className="pl-6 md:pl-10 py-4 md:py-6">
                            <div className="space-y-1">
                              <p className="font-black text-lg md:text-xl tracking-tight leading-tight group-hover:text-primary transition-colors truncate max-w-[200px] md:max-w-none">{a.title}</p>
                              <p className="text-[8px] md:text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest">{a.subjectTitle}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4 md:py-6 pr-6 md:pr-10">
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="secondary" className="font-black text-[8px] md:text-[9px] px-2 md:px-3 py-1 rounded-lg uppercase tabular-nums border-2 border-primary/10 shadow-sm">
                                {format(parseISO(a.dueDate), 'MMM dd')}
                              </Badge>
                              <span className="text-[7px] md:text-[8px] font-bold uppercase text-muted-foreground/40">Due Date</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={2} className="text-center py-20 text-muted-foreground font-black uppercase opacity-10 text-3xl md:text-4xl tracking-tighter italic">No pending tasks.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={cn(
          "glass-card border-emerald-500/10 bg-emerald-500/[0.01]",
          !isStudent && "border-dashed"
        )}>
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-emerald-500/5 py-6 md:py-8 px-6 md:px-10">
            <div className="flex items-center gap-4">
              <Megaphone className="h-6 w-6 text-emerald-500" />
              <div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                  {isStudent ? 'Campus Feed' : 'Announcement Hub'}
                </CardTitle>
                <p className="text-[8px] md:text-[9px] font-bold text-emerald-600/40 uppercase">
                  {isStudent ? 'Class notifications' : 'Manage broadcast updates'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {!isStudent && (
                <Button asChild variant="outline" size="sm" className="h-8 md:h-9 px-3 md:px-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10">
                  <Link href="/main/announcements">Post New</Link>
                </Button>
              )}
              <Link href="/main/announcements" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-4">
            {(isStudent && userProfile?.accessAnnouncements === false) ? (
              <div className="py-12 text-center opacity-20 flex flex-col items-center">
                <Lock className="h-10 w-10 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Feed Blocked</p>
              </div>
            ) : annLoading ? (
              <Skeleton className="h-24 w-full rounded-[2rem]" />
            ) : announcements.length > 0 ? (
              announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-500/[0.03] border-4 border-emerald-500/5 hover:border-emerald-500/20 transition-all group shadow-sm">
                  <p className="font-black text-base md:text-lg tracking-tighter leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{ann.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{ann.teacherName}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-20">
                <Megaphone className="h-10 w-10 mx-auto mb-3 stroke-1" />
                <p className="text-[10px] font-black uppercase tracking-widest">Feed is quiet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LOWER ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-2 border-primary/5 overflow-hidden">
          <CardHeader className="py-6 md:py-8 px-6 md:px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="h-5 md:h-6 w-5 md:w-6 text-primary" />
              <div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Study Intensity</CardTitle>
                <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-50">Hours focused</p>
              </div>
            </div>
            <Badge variant="outline" className="font-black text-[8px] md:text-[9px] uppercase tracking-widest border-2">Weekly Trend</Badge>
          </CardHeader>
          <CardContent className="pt-10 md:pt-12 px-2 md:px-8 pb-8">
            {statsLoading ? <Skeleton className="h-[300px] md:h-[350px] w-full rounded-[2.5rem]" /> : (
              <div className="h-[300px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudyPulse" x1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', textTransform: 'uppercase'}} 
                      dy={15}
                      minTickGap={5}
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: '4px solid hsl(var(--primary)/0.1)', background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(10px)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={5} 
                      fillOpacity={1} 
                      fill="url(#colorStudyPulse)" 
                      animationDuration={2000} 
                      strokeLinecap="round" 
                      connectNulls={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-2 border-primary/5 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-primary/5 py-6 md:py-8 px-6 md:px-10">
            <div className="flex items-center gap-4">
              <ListTodo className="h-5 md:h-6 w-5 md:w-6 text-primary" />
              <div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Quick Tasks</CardTitle>
                <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-50">Daily check-list</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="h-8 md:h-9 px-4 md:px-5 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-xl border-2">
              <Link href="/main/todo">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {todos.length > 0 ? todos.map((t) => (
                  <TableRow key={t.id} className="hover:bg-primary/[0.03] border-none h-20 md:h-24 transition-all group">
                    <TableCell className="pl-6 md:pl-10 py-4 md:py-6 flex items-center gap-4 md:gap-6">
                      <div className="h-7 md:h-8 w-7 md:w-8 rounded-lg md:rounded-xl border-4 border-primary/10 shadow-inner group-hover:border-primary transition-all flex items-center justify-center shrink-0">
                        <div className="h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-primary/20" />
                      </div>
                      <span className="text-xl md:text-2xl font-black tracking-tight truncate max-w-[200px] md:max-w-none">{t.text}</span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell className="text-center py-24 md:py-32">
                      <div className="opacity-10 space-y-4">
                        <Sparkles className="h-12 md:h-16 w-12 md:w-16 mx-auto" />
                        <p className="font-black uppercase opacity-10 text-2xl md:text-4xl tracking-tighter italic">List is empty.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
