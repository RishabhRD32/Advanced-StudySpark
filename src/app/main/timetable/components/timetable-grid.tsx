
"use client";

import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubjects, useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, Edit, Trash2, Clock, Zap, FileDown, Table as TableIcon, FileText, Settings, Plus, Trash, Coffee } from 'lucide-react';
import type { TimetableEntry, TimeSlot } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadTableAsExcel, downloadTableAsPDF } from "@/lib/download-utils";
import { cn } from "@/lib/utils";

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimetableGridProps {
    type: 'lecture';
    title: string;
    description: string;
}

const lectureSchema = z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    subject: z.string().min(1, "Subject is required"),
    details: z.string().optional(),
    isBreak: z.boolean().default(false),
});

const timeSlotSchema = z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

export function TimetableGrid({ type, title, description }: TimetableGridProps) {
    const { entries, timeSlots, loading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, addTimeSlot, deleteTimeSlot } = useTimetable(type);
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { toast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const form = useForm<z.infer<typeof lectureSchema>>({
        resolver: zodResolver(lectureSchema),
        defaultValues: { isBreak: false }
    });

    const slotForm = useForm<z.infer<typeof timeSlotSchema>>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: { start: "09:00", end: "10:00" }
    });

    const handleOpenModal = (day?: string, slot?: TimeSlot, entry: TimetableEntry | null = null) => {
        setEditingEntry(entry);
        if (entry) {
            form.reset({
                day: entry.day,
                startTime: entry.startTime,
                endTime: entry.endTime,
                subject: entry.subject,
                details: entry.details,
                isBreak: entry.isBreak || false,
            });
        } else {
            form.reset({
                day: (day as any) || 'Monday',
                startTime: slot?.start || '09:00',
                endTime: slot?.end || '10:00',
                subject: '',
                details: '',
                isBreak: false,
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (values: z.infer<typeof lectureSchema>) => {
        try {
            const data = { ...values, type };
            if (editingEntry) {
                await updateTimetableEntry(editingEntry.id, data);
                toast({ title: "Success", description: "Schedule updated." });
            } else {
                await addTimetableEntry(data as Omit<TimetableEntry, 'id' | 'userId'>);
                toast({ title: "Success", description: "Class added to schedule." });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save entry." });
        }
    };

    const handleAddSlot = async (values: z.infer<typeof timeSlotSchema>) => {
        try {
            addTimeSlot(values);
            toast({ title: "Slot Added", description: "Time slot updated." });
            slotForm.reset();
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to add slot." });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTimetableEntry(id);
            toast({ title: "Success", description: "Class removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete entry." });
        }
    };

    const findEntry = (day: string, timeSlot: { start: string, end: string }) => {
        return entries.find(e => e.day === day && e.startTime === timeSlot.start);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    };

    const handleExport = (formatType: 'pdf' | 'excel') => {
        const headers = ["Time Slot", ...daysOfWeek];
        const body = timeSlots.map(slot => {
            const row = [ `${formatTime(slot.start)} - ${formatTime(slot.end)}` ];
            daysOfWeek.forEach(day => {
                const entry = findEntry(day, slot);
                if (entry) {
                    row.push(entry.isBreak ? `BREAK (${entry.details || 'Rest'})` : `${entry.subject} (${entry.details})`);
                } else {
                    row.push('-');
                }
            });
            return row;
        });

        if (formatType === 'excel') {
            downloadTableAsExcel(headers, body, "Weekly_Schedule");
        } else {
            downloadTableAsPDF("My Weekly Schedule", headers, body, "Weekly_Schedule");
        }
    };

    if (loading) return <div className="p-12 space-y-6"><Skeleton className="h-16 w-full rounded-3xl" /><Skeleton className="h-[500px] w-full rounded-[3.5rem]" /></div>;

    const isBreak = form.watch('isBreak');

    return (
        <div className="space-y-10">
            <Card className="border-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden rounded-[3.5rem] bg-card/40 backdrop-blur-3xl">
                <CardHeader className="flex flex-col md:flex-row justify-between items-center bg-primary/5 border-b-4 border-primary/5 py-10 px-12 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20">
                          <Clock className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary">{title}</CardTitle>
                            <CardDescription className="font-bold text-muted-foreground text-base mt-1">{description}</CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            className="h-16 w-16 rounded-2xl border-4 hover:bg-primary/5 transition-all"
                        >
                            <Settings className="h-6 w-6 text-muted-foreground" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="font-black h-16 px-8 rounded-[2rem] border-4 gap-2">
                                    <FileDown className="h-5 w-5" /> Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-2xl border-4 font-bold">
                                <DropdownMenuItem onClick={() => handleExport('excel')} className="py-3 px-6 cursor-pointer">
                                    <TableIcon className="mr-2 h-4 w-4 text-emerald-600" /> Excel (.xlsx)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('pdf')} className="py-3 px-6 cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4 text-red-600" /> PDF (.pdf)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => handleOpenModal()} className="font-black h-16 px-10 rounded-[2rem] shadow-2xl text-lg hover:scale-105 active:scale-95 transition-all">
                            <PlusCircle className="mr-3 h-6 w-6" /> Add Class
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto scrollbar-hide">
                        <Table className="min-w-[1200px]">
                            <TableHeader className="bg-muted/10">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[180px] font-black uppercase text-[12px] tracking-[0.4em] py-10 pl-12 border-r-4 border-primary/5">Time Slot</TableHead>
                                    {daysOfWeek.map(day => (
                                        <TableHead key={day} className="font-black uppercase text-[12px] tracking-[0.4em] text-center border-r-4 border-primary/5 last:border-none">{day}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timeSlots.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-24">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Clock className="h-12 w-12" />
                                                <p className="font-black uppercase tracking-widest text-lg">No time slots configured.</p>
                                                <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="rounded-xl font-bold border-2">Add your first time slot</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : timeSlots.map(slot => (
                                    <TableRow key={`${slot.start}-${slot.end}`} className="h-32 hover:bg-primary/[0.03] border-none group transition-all">
                                        <TableCell className="font-black text-[13px] tracking-tighter py-8 border-r-4 border-primary/5 bg-muted/5 pl-12 group-hover:text-primary transition-colors">
                                            {formatTime(slot.start)} — {formatTime(slot.end)}
                                        </TableCell>
                                        {daysOfWeek.map(day => {
                                            const entry = findEntry(day, slot);
                                            return (
                                                <TableCell key={day} className="p-3 align-middle border-r-4 border-primary/5 last:border-none">
                                                    {entry ? (
                                                        <div className={cn(
                                                            "relative h-full min-h-[100px] border-4 rounded-[2rem] p-5 shadow-inner group/item transition-all duration-500",
                                                            entry.isBreak 
                                                                ? "bg-muted/30 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40" 
                                                                : "bg-primary/5 border-primary/10 hover:border-primary/40 hover:bg-primary/10"
                                                        )}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {entry.isBreak && <Coffee className="h-4 w-4 text-muted-foreground/60" />}
                                                                <p className={cn(
                                                                    "font-black text-lg leading-tight tracking-tight",
                                                                    entry.isBreak ? "text-muted-foreground" : "text-primary"
                                                                )}>{entry.subject}</p>
                                                            </div>
                                                            <p className="text-[11px] font-black text-muted-foreground uppercase opacity-50 truncate tracking-widest">{entry.details}</p>
                                                            
                                                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all transform translate-y-2 group-hover/item:translate-y-0">
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-background/90 shadow-xl border-2 hover:bg-primary/10" onClick={() => handleOpenModal(day, slot, entry)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-background/90 shadow-xl border-2 text-destructive hover:bg-destructive/10">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="rounded-[3rem] border-8 border-primary/5 bg-background/95 backdrop-blur-3xl">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle className="font-black text-4xl tracking-tighter">Delete {entry.isBreak ? 'Break' : 'Class'}?</AlertDialogTitle>
                                                                            <AlertDialogDescription className="font-bold text-lg leading-relaxed mt-4">
                                                                                This will remove <span className="text-primary">{entry.subject}</span> from your schedule. Are you sure?
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter className="mt-10 gap-4">
                                                                            <AlertDialogCancel className="font-black text-[12px] uppercase tracking-widest rounded-2xl h-14 border-4">Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90 font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl h-14 px-10 shadow-2xl">Delete Now</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleOpenModal(day, slot)}
                                                            className="w-full h-full min-h-[100px] rounded-[2rem] border-4 border-dashed border-primary/5 flex items-center justify-center text-primary/20 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 transform hover:scale-[0.98]"
                                                        >
                                                            <PlusCircle className="h-10 w-10" />
                                                        </button>
                                                    )}
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

            {/* MANAGE TIME SLOTS DIALOG */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-xl rounded-[4rem] border-8 border-primary/10 bg-background/95 backdrop-blur-3xl p-12">
                    <DialogHeader>
                        <DialogTitle className="font-black text-4xl tracking-tighter mb-4">Manage <span className="text-primary">Time Slots</span></DialogTitle>
                        <DialogDescription className="font-bold">Add or remove the time intervals for your school day.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-8 space-y-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Add New Slot</p>
                            <Form {...slotForm}>
                                <form onSubmit={slotForm.handleSubmit(handleAddSlot)} className="flex items-end gap-4 bg-muted/20 p-6 rounded-3xl border-2">
                                    <FormField control={slotForm.control} name="start" render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-[9px] font-black uppercase">Start</FormLabel>
                                            <FormControl><Input type="time" {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={slotForm.control} name="end" render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-[9px] font-black uppercase">End</FormLabel>
                                            <FormControl><Input type="time" {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="h-12 w-12 rounded-xl shadow-lg"><Plus className="h-5 w-5" /></Button>
                                </form>
                            </Form>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Current Intervals</p>
                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                {timeSlots.map((slot, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background border-2 shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <Clock className="h-4 w-4 text-primary opacity-40" />
                                            <span className="font-black text-lg tabular-nums tracking-tighter">{formatTime(slot.start)} — {formatTime(slot.end)}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteTimeSlot(slot)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsSettingsOpen(false)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ADD/EDIT CLASS DIALOG */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl rounded-[4rem] border-8 border-primary/10 bg-background/95 backdrop-blur-3xl p-12">
                    <DialogHeader>
                        <DialogTitle className="font-black text-5xl tracking-tighter mb-4">
                            {editingEntry ? 'Edit' : 'Add'} <span className="text-primary">{isBreak ? 'Break' : 'Class'}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 py-6">
                            
                            <FormField control={form.control} name="isBreak" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-[2rem] border-4 border-primary/5 p-6 bg-primary/[0.02]">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-black uppercase tracking-widest text-primary">This is a break</FormLabel>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Recess, Lunch, or Free Time</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={(val) => {
                                            field.onChange(val);
                                            if (val) form.setValue('subject', 'Break');
                                        }} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="day" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">Select Day</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full h-16 border-4 border-primary/10 rounded-2xl bg-background font-black uppercase text-sm px-6 focus:border-primary transition-all shadow-inner">
                                            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="startTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">Start Time</FormLabel>
                                        <FormControl><Input type="time" {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-black text-lg focus:border-primary shadow-inner" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="endTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">End Time</FormLabel>
                                        <FormControl><Input type="time" {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-black text-lg focus:border-primary shadow-inner" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            
                            {!isBreak ? (
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">Select Subject</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-16 border-4 border-primary/10 rounded-2xl font-black focus:border-primary shadow-inner text-lg">
                                                    {subjectsLoading ? <Zap className="h-6 w-6 animate-bolt" /> : <SelectValue placeholder="Pick a Subject" />}
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-4 bg-background/95 backdrop-blur-xl">
                                                {subjects.map(s => <SelectItem key={s.id} value={s.title} className="font-bold py-4 rounded-xl">{s.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                <div className="hidden">
                                    <FormField control={form.control} name="subject" render={({ field }) => (
                                        <Input {...field} value="Break" />
                                    )} />
                                </div>
                            )}

                            <FormField control={form.control} name="details" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">{isBreak ? 'Optional Details' : 'Teacher or Room Number'}</FormLabel>
                                    <FormControl><Input placeholder={isBreak ? "e.g. Lunch Hall" : "e.g. Prof. Smith or Room 101"} {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-bold text-lg focus:border-primary shadow-inner" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter className="gap-4 pt-10">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-black text-[12px] uppercase tracking-widest h-16 px-10">Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="h-16 px-12 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)]">
                                    {form.formState.isSubmitting ? <Zap className="h-6 w-6 animate-bolt fill-white/20" /> : 'Save entry'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
