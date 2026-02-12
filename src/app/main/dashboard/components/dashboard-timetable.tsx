
"use client";

import { useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TimetableEntry } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Coffee } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function DashboardTimetable() {
    const { entries, timeSlots, loading } = useTimetable('lecture');

    const findEntry = (day: string, timeSlot: { start: string, end: string }) => {
        return entries.find(e => e.day === day && e.startTime === timeSlot.start);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    return (
        <Card className="border-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden rounded-[2.5rem] bg-background/50 backdrop-blur-xl">
            <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-6 px-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Weekly Grid</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <div className="h-2 w-2 rounded-full bg-muted" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? <div className="p-12"><Skeleton className="h-[300px] w-full rounded-[2rem]"/></div> : (
                <div className="overflow-x-auto scrollbar-hide">
                    <Table className="min-w-[900px]">
                        <TableHeader className="bg-muted/10 border-b-4 border-primary/5">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[150px] font-black uppercase text-[11px] tracking-widest pl-10 py-8 border-r-2 border-primary/5">Time</TableHead>
                                {daysOfWeek.map(day => <TableHead key={day} className="font-black uppercase text-[11px] tracking-widest text-center border-r-2 border-primary/5 last:border-none">{day}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {timeSlots.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-24 text-muted-foreground font-black uppercase opacity-10 text-4xl tracking-tighter italic">Grid Unpopulated.</TableCell></TableRow>
                            ) : timeSlots.map(slot => (
                                <TableRow key={`${slot.start}-${slot.end}`} className="h-24 hover:bg-primary/[0.02] border-none transition-all group">
                                    <TableCell className="font-black text-[12px] tracking-tighter py-6 border-r-2 border-primary/5 bg-muted/5 pl-10 group-hover:text-primary transition-colors">
                                      {formatTime(slot.start)}
                                    </TableCell>
                                    {daysOfWeek.map(day => {
                                        const entry = findEntry(day, slot);
                                        return (
                                            <TableCell key={day} className="p-2 align-middle border-r-2 border-primary/5 last:border-none">
                                                {entry ? (
                                                    <div className={cn(
                                                      "h-full min-h-[60px] rounded-2xl p-3 flex flex-col justify-center transition-all duration-500",
                                                      entry.isBreak 
                                                        ? "bg-muted/30 border-2 border-dashed border-muted-foreground/10" 
                                                        : "bg-primary/5 border-2 border-primary/10 shadow-inner group-hover:scale-[1.02] group-hover:bg-primary/10 group-hover:border-primary/20"
                                                    )}>
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                          {entry.isBreak && <Coffee className="h-3 w-3 text-muted-foreground opacity-40" />}
                                                          <p className={cn(
                                                            "font-black text-xs uppercase tracking-tight truncate",
                                                            entry.isBreak ? "text-muted-foreground/60" : "text-primary"
                                                          )}>{entry.subject}</p>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase truncate tracking-widest">{entry.details}</p>
                                                    </div>
                                                ) : <div className="h-full w-full opacity-0 group-hover:opacity-5 transition-opacity bg-primary/20 rounded-xl" />}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
    );
}
