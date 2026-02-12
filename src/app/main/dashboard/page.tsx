
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
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useDashboardStats, useAssignments, useAnnouncements } from "@/hooks/use-firestore";
import { parseISO, format } from 'date-fns';
import { DashboardTimetable } from "./components/dashboard-timetable";
import { ScientificCalculator } from "./components/scientific-calculator";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer as RespContainer } from "recharts";
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
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20 animate-slide-up-fade">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b-2 border-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-3 w-3">
              <span className="absolute inset-0 bg-primary/40 blur-md rounded-full animate-ping" />
              <span className="relative block h-full w-full rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Status: Active</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight text-muted-foreground/60">
              Welcome,
            </h1>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-transparent bg-clip-text italic pr-6 pb-2">
              {userProfile?.firstName || 'Scholar'}
            </h2>
          </div>
          <p className="text-xl text-muted-foreground font-bold opacity-60 tracking-tight">Your studies are looking great today.</p>
        </div>

        {time && (
          <div className="lg:text-right glass-panel px-12 py-10 rounded-[3rem] border-4 border-primary/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.02]">
            <div className="text-6xl font-black tabular-nums tracking-tighter text-primary leading-none drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              {format(time, 'hh:mm:ss a')}
            </div>
            <div className="mt-4 text-3xl font-black uppercase text-foreground tracking-tighter border-t-2 border-primary/5 pt-4">
              {format(time, 'eeee, dd MMMM yyyy')}
            </div>
          </div>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl transition-all duration-500 overflow-hidden relative rounded-[2.5rem] h-52 group cursor-default">
          <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12"><BookOpen className="h-32 w-32" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">My Subjects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {statsLoading ? <Skeleton className="h-16 w-20 bg-white/20" /> : <div className="text-8xl font-black tabular-nums tracking-tighter">{stats.subjectsCompleted}</div>}
          </CardContent>
        </Card>
        
        <Card className="glass-card h-52 group border-2 border-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">My Score</CardTitle>
            <Target className="h-5 w-5 text-primary absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-all duration-500" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {statsLoading ? <Skeleton className="h-16 w-24" /> : <div className="text-8xl font-black text-primary tabular-nums tracking-tighter leading-none">{stats.averageScore}<span className="text-3xl opacity-40 ml-1">%</span></div>}
          </CardContent>
        </Card>
        
        <Card className="glass-card h-52 group border-orange-500/5 hover:border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Day Streak</CardTitle>
            <Flame className="h-6 w-6 text-orange-500 absolute top-8 right-8 opacity-20 group-hover:opacity-100 group-hover:animate-bolt transition-all" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {statsLoading ? <Skeleton className="h-16 w-20" /> : <div className="text-8xl font-black text-orange-500 tabular-nums tracking-tighter">{stats.studyStreak}</div>}
            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mt-2">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="glass-card h-52 flex flex-col justify-between p-8 border-emerald-500/5 hover:border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex justify-between items-start">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
              <Timer className="h-7 w-7 text-emerald-500" />
            </div>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 font-black uppercase text-[9px] tracking-widest px-3 py-1">Timer</Badge>
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600/60">Work Space</h3>
            <Button asChild className="w-full rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] h-12 bg-emerald-600 hover:bg-emerald-700 shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]">
              <Link href="/main/focus">Focus Now <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* PRIMARY WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-primary/5 rounded-[1.25rem] flex items-center justify-center border-2 border-primary/10 shadow-inner">
                 <CalendarIcon className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">Class Schedule</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Your week at a glance</p>
               </div>
             </div>
             <Button asChild variant="ghost" className="rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 gap-2">
               <Link href="/main/timetable">See More <ChevronRight className="h-3 w-3" /></Link>
             </Button>
          </div>
          {userProfile?.accessTimetable !== false ? (
            <DashboardTimetable />
          ) : (
            <div className="h-[300px] border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-20 bg-muted/5">
              <Lock className="h-12 w-12 mb-4" />
              <p className="font-black uppercase tracking-widest">Schedule Access Disabled</p>
              <p className="text-xs font-bold text-muted-foreground">Enable in Settings to see your grid.</p>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 flex flex-col">
          <div className="flex items-center gap-4 px-4 mb-8">
             <div className="h-12 w-12 bg-primary/5 rounded-[1.25rem] flex items-center justify-center border-2 border-primary/10 shadow-inner">
               <Calculator className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h2 className="text-xl font-black uppercase tracking-tighter">Lab Core</h2>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Scientific calculations</p>
             </div>
          </div>
          <div className="animate-in slide-in-from-right-8 duration-700 flex-1">
            <ScientificCalculator />
          </div>
        </div>
      </div>

      {/* DEEP ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card col-span-1 border-2 border-primary/5">
          <CardHeader className="py-8 px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <PieChart className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Task Velocity</CardTitle>
                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Assignment Completion</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-10 flex flex-col items-center">
            {statsLoading ? <Skeleton className="h-[200px] w-full rounded-full" /> : (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.assignmentStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.assignmentStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', background: 'hsl(var(--card))', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-muted" />
                <span className="text-[10px] font-black uppercase text-muted-foreground">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card col-span-1 lg:col-span-2 border-2 border-primary/5">
          <CardHeader className="py-8 px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Academic Mastery</CardTitle>
                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Score by Subject</p>
              </div>
            </div>
            <Trophy className="h-5 w-5 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-8">
            {statsLoading ? <Skeleton className="h-[250px] w-full rounded-2xl" /> : stats.subjectPerformance.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.subjectPerformance} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', textTransform: 'uppercase'}}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '24px', border: 'none', background: 'hsl(var(--card))', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}
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
              <div className="h-[250px] flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Sparkles className="h-12 w-12" />
                <p className="text-xs font-black uppercase tracking-widest">Complete assignments to unlock mastery data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECONDARY WORKSPACE */}
      <div className={cn("grid grid-cols-1 gap-8", isStudent ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
        {isStudent && (
          <Card className="glass-card overflow-hidden border-2 border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-primary/5 py-8 px-10 bg-primary/[0.02]">
              <div className="flex items-center gap-4">
                <Target className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Current Targets</CardTitle>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Academic goals</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="h-9 px-5 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 hover:bg-primary/5">
                <Link href="/main/subjects">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {assignmentsLoading ? (
                <div className="p-10 space-y-4"><Skeleton className="h-16 w-full rounded-2xl" /><Skeleton className="h-16 w-full rounded-2xl" /></div>
              ) : (
                <Table>
                  <TableBody>
                    {upcomingAssignments.length > 0 ? (
                      upcomingAssignments.map((a) => (
                        <TableRow key={a.id} className="hover:bg-primary/[0.03] border-none group transition-all h-24">
                          <TableCell className="pl-10 py-6">
                            <div className="space-y-1">
                              <p className="font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors">{a.title}</p>
                              <p className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest">{a.subjectTitle}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-6 pr-10">
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="secondary" className="font-black text-[9px] px-3 py-1 rounded-lg uppercase tabular-nums border-2 border-primary/10 shadow-sm">
                                {format(parseISO(a.dueDate), 'MMM dd')}
                              </Badge>
                              <span className="text-[8px] font-bold uppercase text-muted-foreground/40">Due Date</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={2} className="text-center py-24 text-muted-foreground font-black uppercase opacity-10 text-4xl tracking-tighter italic">No pending tasks.</TableCell></TableRow>
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
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-emerald-500/5 py-8 px-10">
            <div className="flex items-center gap-4">
              <Megaphone className="h-6 w-6 text-emerald-500" />
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                  {isStudent ? 'Campus Feed' : 'Announcement Hub'}
                </CardTitle>
                <p className="text-[9px] font-bold text-emerald-600/40 uppercase">
                  {isStudent ? 'Class notifications' : 'Manage broadcast updates'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!isStudent && (
                <Button asChild variant="outline" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10">
                  <Link href="/main/announcements">Post New</Link>
                </Button>
              )}
              <Link href="/main/announcements" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {(isStudent && userProfile?.accessAnnouncements === false) ? (
              <div className="py-12 text-center opacity-20 flex flex-col items-center">
                <Lock className="h-10 w-10 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Feed Blocked</p>
              </div>
            ) : annLoading ? (
              <Skeleton className="h-24 w-full rounded-[2rem]" />
            ) : announcements.length > 0 ? (
              announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-6 rounded-[2rem] bg-emerald-500/[0.03] border-4 border-emerald-500/5 hover:border-emerald-500/20 transition-all group shadow-sm">
                  <p className="font-black text-lg tracking-tighter leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{ann.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{ann.teacherName}</p>
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
        <Card className="glass-card border-2 border-primary/5">
          <CardHeader className="py-8 px-10 border-b-2 border-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Study Intensity</CardTitle>
                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Hours focused</p>
              </div>
            </div>
            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-2">Weekly Trend</Badge>
          </CardHeader>
          <CardContent className="pt-12 px-8 pb-8">
            {statsLoading ? <Skeleton className="h-[350px] w-full rounded-[2.5rem]" /> : (
              <div className="h-[350px] w-full">
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
                      tick={{fontSize: 11, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', textTransform: 'uppercase'}} 
                      dy={15}
                      minTickGap={5}
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: '4px solid hsl(var(--primary)/0.1)', background: 'hsl(var(--card))', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}} 
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

        <Card className="glass-card border-2 border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-primary/5 py-8 px-10">
            <div className="flex items-center gap-4">
              <ListTodo className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Quick Tasks</CardTitle>
                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Daily check-list</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="h-9 px-5 text-[9px] font-black uppercase tracking-widest rounded-xl border-2">
              <Link href="/main/todo">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {todos.length > 0 ? todos.map((t) => (
                  <TableRow key={t.id} className="hover:bg-primary/[0.03] border-none h-24 transition-all">
                    <TableCell className="pl-10 py-6 flex items-center gap-6">
                      <div className="h-8 w-8 rounded-xl border-4 border-primary/10 shadow-inner group-hover:border-primary transition-all flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary/20" />
                      </div>
                      <span className="text-2xl font-black tracking-tight">{t.text}</span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell className="text-center py-32">
                      <div className="opacity-10 space-y-4">
                        <Sparkles className="h-16 w-16 mx-auto" />
                        <p className="font-black uppercase opacity-10 text-4xl tracking-tighter italic">List is empty.</p>
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
