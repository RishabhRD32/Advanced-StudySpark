"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useTimetable } from "@/hooks/use-firestore";
import { parseISO, isSameDay, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck2, MapPin, Sparkles, BookOpen, Clock, ChevronRight } from 'lucide-react';

export function DashboardCalendar() {
    const { entries: writtenExams, loading: writtenLoading } = useTimetable('written_exam');
    const { entries: practicalExams, loading: practicalLoading } = useTimetable('practical_exam');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const allExams = useMemo(() => [...writtenExams, ...practicalExams], [writtenExams, practicalExams]);
    const examDates = useMemo(() => allExams.map(exam => exam.date ? parseISO(exam.date) : new Date()), [allExams]);

    const examsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return allExams
            .filter(exam => exam.date && isSameDay(parseISO(exam.date), selectedDate))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [allExams, selectedDate]);
    
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    if (writtenLoading || practicalLoading) return (
      <Card className="border-2 shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-12"><Skeleton className="h-[400px] w-full rounded-[2rem]" /></CardContent>
      </Card>
    );

    return (
        <Card className="border-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] h-full flex flex-col bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="bg-primary/5 border-b py-6 px-10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <CalendarCheck2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Academic Calendar</CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Exams & Evaluations</p>
                  </div>
                </div>
                <div className="hidden sm:flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Written</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Practical</span>
                  </div>
                </div>
            </CardHeader>
            
            <CardContent className="flex flex-col lg:flex-row gap-0 p-0 flex-1">
                {/* CALENDAR PANE */}
                <div className="w-full lg:w-[45%] p-10 border-b lg:border-b-0 lg:border-r-2 border-primary/5 flex flex-col items-center justify-center bg-muted/[0.02]">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-[2rem] border-none shadow-none bg-transparent w-full"
                        modifiers={{ exams: examDates }}
                        modifiersClassNames={{ 
                          exams: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:bg-primary after:rounded-full after:shadow-[0_0_5px_hsl(var(--primary))] font-black' 
                        }}
                    />
                    <div className="mt-8 pt-8 border-t border-dashed w-full text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Select a date to view agenda</p>
                    </div>
                </div>

                {/* DETAILS PANE */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                     <div className="p-8 border-b-2 border-primary/5 bg-primary/[0.01]">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-3xl tracking-tighter text-foreground">
                            {selectedDate ? format(selectedDate, 'MMMM dd') : 'Schedule'}
                          </h4>
                          <Badge variant="outline" className="border-2 font-black uppercase text-[10px] px-4 py-1 rounded-full">
                            {selectedDate ? format(selectedDate, 'eeee') : ''}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{examsOnSelectedDate.length} ASSESSMENT(S) FOUND</p>
                     </div>

                    <div className="p-8 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                      {examsOnSelectedDate.length > 0 ? (
                          examsOnSelectedDate.map(exam => (
                              <div key={exam.id} className="p-6 rounded-[2rem] border-2 border-primary/5 bg-background shadow-sm group/item hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="space-y-1">
                                        <Badge variant={exam.type === 'written_exam' ? 'default' : 'secondary'} className={cn(
                                          "font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-lg border-2",
                                          exam.type === 'written_exam' ? "bg-primary border-primary/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        )}>
                                            {exam.type === 'written_exam' ? 'Written Theory' : 'Practical Lab'}
                                        </Badge>
                                        <p className="font-black text-2xl text-foreground leading-tight group-hover/item:text-primary transition-colors">{exam.subject}</p>
                                      </div>
                                      <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-transparent group-hover/item:border-primary/10 transition-all">
                                        <Clock className="h-4 w-4 text-primary opacity-40" />
                                        <div>
                                          <p className="text-[8px] font-black uppercase text-muted-foreground opacity-60">Session Time</p>
                                          <p className="text-xs font-black tabular-nums">{formatTime(exam.startTime)} — {formatTime(exam.endTime)}</p>
                                        </div>
                                      </div>
                                      
                                      {exam.details && (
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-transparent group-hover/item:border-primary/10 transition-all">
                                            <MapPin className="h-4 w-4 text-primary opacity-40" />
                                            <div>
                                              <p className="text-[8px] font-black uppercase text-muted-foreground opacity-60">Location</p>
                                              <p className="text-xs font-bold truncate max-w-[100px]">{exam.details}</p>
                                            </div>
                                        </div>
                                      )}
                                  </div>
                              </div>
                          ))
                      ) : (
                           <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16 opacity-30 border-4 border-dashed rounded-[3rem] border-primary/5">
                              <CalendarCheck2 className="h-16 w-16 mb-6 stroke-[1.5] text-primary/40"/>
                              <div className="space-y-1">
                                <p className="font-black text-xl uppercase tracking-tighter text-foreground">Open Window</p>
                                <p className="font-bold text-sm">No scheduled evaluations for this date.</p>
                              </div>
                          </div>
                      )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
