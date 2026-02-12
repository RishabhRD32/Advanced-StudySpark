"use client";

import React, { useState } from 'react';
import { useClassTimetable } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Coffee, ShieldCheck, Zap, Calendar, BookOpen, MapPin, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimetableEntry } from "@/lib/types";

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClassScheduleView({ ccCode }: { ccCode?: string }) {
    const { entries, timeSlots, loading } = useClassTimetable(ccCode);
    const [activeTab, setActiveTab] = useState("lecture");

    const lectures = entries.filter(e => e.type === 'lecture');
    const writtenExams = entries.filter(e => e.type === 'written_exam')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const practicalExams = entries.filter(e => e.type === 'practical_exam')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    const findLecture = (day: string, timeSlot: { start: string, end: string }) => {
        return lectures.find(e => e.day === day && e.startTime === timeSlot.start);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    if (loading) return (
        <div className="space-y-10">
            <Skeleton className="h-24 w-full max-w-2xl mx-auto rounded-[3rem]" />
            <Skeleton className="h-[500px] w-full rounded-[3.5rem]" />
        </div>
    );

    if (entries.length === 0) {
        return (
            <Card className="border-4 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center text-center opacity-30 bg-muted/5">
                <ShieldCheck className="h-16 w-16 mb-6" />
                <h3 className="text-3xl font-black uppercase tracking-tighter">No Shared Schedule</h3>
                <p className="font-bold text-lg mt-2 max-w-sm">Your teacher hasn't shared any entries for code: <span className="text-primary uppercase">{ccCode}</span></p>
            </Card>
        );
    }

    const ExamList = ({ items, emptyMessage }: { items: TimetableEntry[], emptyMessage: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length > 0 ? items.map((exam) => (
                <Card key={exam.id} className="border-2 shadow-lg overflow-hidden bg-background group hover:border-primary/30 transition-all rounded-[2.5rem]">
                    <CardHeader className={cn(
                        "border-b p-8",
                        exam.type === 'written_exam' ? "bg-amber-500/5" : "bg-emerald-500/5"
                    )}>
                        <div className="flex justify-between items-start mb-4">
                            <Badge className={cn(
                                "font-black uppercase text-[9px] tracking-widest border-2",
                                exam.type === 'written_exam' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}>
                                {exam.type === 'written_exam' ? 'Theory' : 'Practical'}
                            </Badge>
                            <Zap className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                            {exam.subject}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex flex-col items-center justify-center border-2 border-transparent group-hover:border-primary/10 transition-all">
                                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none">{exam.date ? format(parseISO(exam.date), 'MMM') : '??'}</span>
                                <span className="text-xl font-black text-primary leading-none mt-1">{exam.date ? format(parseISO(exam.date), 'dd') : '--'}</span>
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">{exam.date ? format(parseISO(exam.date), 'EEEE') : 'Unknown Day'}</p>
                                <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs mt-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(exam.startTime)} — {formatTime(exam.endTime)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t-2 border-dashed border-muted/20">
                            <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                                <MapPin className="h-3 w-3" />
                                {exam.details || 'Campus Hall'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )) : (
                <div className="col-span-full h-64 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center opacity-20">
                    <Search className="h-10 w-10 mb-4" />
                    <p className="font-black uppercase tracking-widest">{emptyMessage}</p>
                </div>
            )}
        </div>
    );

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
            <div className="flex justify-center">
                <TabsList className="w-full max-w-2xl h-20 bg-background/90 border-4 border-primary/10 shadow-2xl rounded-[2.5rem] p-2 backdrop-blur-xl">
                    <TabsTrigger value="lecture" className="flex-1 rounded-[2rem] gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Clock className="h-4 w-4" /> <span className="font-black uppercase text-xs tracking-widest">Lectures</span>
                    </TabsTrigger>
                    <TabsTrigger value="written" className="flex-1 rounded-[2rem] gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                        <BookOpen className="h-4 w-4" /> <span className="font-black uppercase text-xs tracking-widest">Theory</span>
                    </TabsTrigger>
                    <TabsTrigger value="practical" className="flex-1 rounded-[2rem] gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                        <Zap className="h-4 w-4" /> <span className="font-black uppercase text-xs tracking-widest">Practical</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="lecture">
                <Card className="border-4 shadow-2xl overflow-hidden rounded-[3.5rem] bg-card/40 backdrop-blur-3xl">
                    <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-10 px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20">
                              <Clock className="h-7 w-7 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary">Class Lectures</CardTitle>
                                <CardDescription className="font-bold text-muted-foreground text-base mt-1 italic">Weekly reference grid for Code: {ccCode}</CardDescription>
                            </div>
                        </div>
                        <div className="bg-primary px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest text-white shadow-xl animate-pulse">
                            LIVE GRID
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto scrollbar-hide">
                            <Table className="min-w-[1200px]">
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-[180px] font-black uppercase text-[12px] tracking-[0.4em] py-10 pl-12 border-r-4 border-primary/5">Time</TableHead>
                                        {daysOfWeek.map(day => (
                                            <TableHead key={day} className="font-black uppercase text-[12px] tracking-[0.4em] text-center border-r-4 border-primary/5 last:border-none">{day}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timeSlots.map(slot => (
                                        <TableRow key={`${slot.start}-${slot.end}`} className="h-32 border-none group transition-all">
                                            <TableCell className="font-black text-[13px] tracking-tighter py-8 border-r-4 border-primary/5 bg-muted/5 pl-12 group-hover:text-primary transition-colors">
                                                {formatTime(slot.start)} — {formatTime(slot.end)}
                                            </TableCell>
                                            {daysOfWeek.map(day => {
                                                const entry = findLecture(day, slot);
                                                return (
                                                    <TableCell key={day} className="p-3 align-middle border-r-4 border-primary/5 last:border-none">
                                                        {entry ? (
                                                            <div className={cn(
                                                                "h-full min-h-[100px] border-4 rounded-[2rem] p-5 shadow-inner transition-all duration-500",
                                                                entry.isBreak 
                                                                    ? "bg-muted/30 border-dashed border-muted-foreground/20" 
                                                                    : "bg-primary/5 border-primary/10"
                                                            )}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {entry.isBreak && <Coffee className="h-4 w-4 text-muted-foreground/60" />}
                                                                    <p className={cn(
                                                                        "font-black text-lg leading-tight tracking-tight",
                                                                        entry.isBreak ? "text-muted-foreground" : "text-primary"
                                                                    )}>{entry.subject}</p>
                                                                </div>
                                                                <p className="text-[11px] font-black text-muted-foreground uppercase opacity-50 truncate tracking-widest">{entry.details}</p>
                                                            </div>
                                                        ) : <div className="h-full w-full bg-muted/5 rounded-[2rem] opacity-20" />}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="written">
                <ExamList items={writtenExams} emptyMessage="No theory exams shared." />
            </TabsContent>

            <TabsContent value="practical">
                <ExamList items={practicalExams} emptyMessage="No practical lab tests shared." />
            </TabsContent>
        </Tabs>
    );
}