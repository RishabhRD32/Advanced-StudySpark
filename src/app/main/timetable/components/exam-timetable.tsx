"use client";

import { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse, isValid } from "date-fns";
import { useSubjects, useTimetable } from "@/hooks/use-firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, Zap, FileDown, Table as TableIcon, FileText } from 'lucide-react';
import type { TimetableEntry } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadTableAsExcel, downloadTableAsPDF } from "@/lib/download-utils";

interface ExamTimetableProps {
    type: 'written_exam' | 'practical_exam';
    title: string;
    description: string;
}

const examSchema = z.object({
    date: z.date({ required_error: "A valid date is required (DD/MM/YYYY)." }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    subject: z.string().min(1, "Subject is required"),
    details: z.string().optional(),
});

export function ExamTimetable({ type, title, description }: ExamTimetableProps) {
    const { entries, loading, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useTimetable(type);
    const { subjects, loading: subjectsLoading } = useSubjects();
    const { toast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [dateInput, setDateInput] = useState("");

    const form = useForm<z.infer<typeof examSchema>>({
        resolver: zodResolver(examSchema),
    });

    const handleOpenModal = (entry: TimetableEntry | null = null) => {
        setEditingEntry(entry);
        if (entry) {
            const date = entry.date ? new Date(entry.date) : new Date();
            form.reset({
                date: date,
                startTime: entry.startTime,
                endTime: entry.endTime,
                subject: entry.subject,
                details: entry.details,
            });
            setDateInput(format(date, "dd/MM/yyyy"));
        } else {
            const now = new Date();
            form.reset({
                date: now,
                startTime: '09:00',
                endTime: '12:00',
                subject: '',
                details: '',
            });
            setDateInput(format(now, "dd/MM/yyyy"));
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (values: z.infer<typeof examSchema>) => {
        try {
            const newEntry = {
                type,
                date: values.date.toISOString(),
                day: format(values.date, 'EEEE') as TimetableEntry['day'],
                startTime: values.startTime,
                endTime: values.endTime,
                subject: values.subject,
                details: values.details || values.subject,
            };

            if (editingEntry) {
                await updateTimetableEntry(editingEntry.id, newEntry);
                toast({ title: "Success", description: "Exam updated." });
            } else {
                await addTimetableEntry(newEntry as Omit<TimetableEntry, 'id' | 'userId'>);
                toast({ title: "Success", description: "Exam added to schedule." });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save entry." });
        }
    };
    
    const handleDelete = async (id: string) => {
       try {
            await deleteTimetableEntry(id);
            toast({ title: "Success", description: "Exam removed." });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Could not delete entry." });
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return format(date, 'hh:mm a');
    }

    const handleExport = (formatType: 'pdf' | 'excel') => {
        const headers = ["Date", "Day", "Time", "Subject", "Details"];
        const body = entries.map(entry => [
            entry.date ? format(new Date(entry.date), "PPP") : 'N/A',
            entry.day,
            `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`,
            entry.subject,
            entry.details
        ]);

        const fileName = type === 'written_exam' ? "Written_Exams" : "Practical_Exams";
        const pdfTitle = type === 'written_exam' ? "Theory Exam Schedule" : "Practical Exam Schedule";

        if (formatType === 'excel') {
            downloadTableAsExcel(headers, body, fileName);
        } else {
            downloadTableAsPDF(pdfTitle, headers, body, fileName);
        }
    };

    if (loading) {
        return <Skeleton className="h-[300px] w-full rounded-2xl" />
    }

    return (
        <>
            <Card className="border-2 shadow-sm overflow-hidden bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
                <CardHeader className="flex flex-col md:flex-row justify-between items-center bg-primary/5 border-b py-6 px-8 gap-4">
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">{title}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">{description}</CardDescription>
                    </div>
                    <div className="flex gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="font-black h-10 px-6 rounded-xl border-2 gap-2">
                                    <FileDown className="h-4 w-4" /> Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-xl border-2 font-bold">
                                <DropdownMenuItem onClick={() => handleExport('excel')} className="py-2 px-4 cursor-pointer">
                                    <TableIcon className="mr-2 h-4 w-4 text-emerald-600" /> Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('pdf')} className="py-2 px-4 cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4 text-red-600" /> PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => handleOpenModal()} className="font-black h-10 px-6 rounded-xl shadow-lg">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Exam
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase pl-8">Date</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Day</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Time</TableHead>
                                <TableHead className="font-black text-[10px] uppercase">Subject</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length > 0 ? entries.map(entry => (
                                <TableRow key={entry.id} className="hover:bg-primary/[0.02] border-none group transition-all h-20">
                                    <TableCell className="font-bold pl-8">{entry.date ? format(new Date(entry.date), "PPP") : 'N/A'}</TableCell>
                                    <TableCell className="font-bold text-xs uppercase text-muted-foreground">{entry.day}</TableCell>
                                    <TableCell className="font-bold text-xs tabular-nums">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</TableCell>
                                    <TableCell className="font-black text-primary text-lg">{entry.subject}</TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleOpenModal(entry)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2.5rem] border-4">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-3xl font-black tracking-tight">Delete Exam?</AlertDialogTitle>
                                                        <AlertDialogDescription className="font-medium text-lg leading-relaxed">
                                                            This will remove the exam for <span className="text-primary font-bold">{entry.subject}</span> from your schedule.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-6">
                                                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold px-8">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold uppercase opacity-30 italic">No exams added yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl rounded-[3rem] border-8 border-primary/10 bg-background/95 backdrop-blur-3xl p-10">
                    <DialogHeader>
                        <DialogTitle className="font-black text-4xl tracking-tight mb-4">{editingEntry ? 'Edit' : 'Add'} <span className="text-primary">Exam</span></DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-[11px] font-black uppercase tracking-widest text-primary/60">Exam Date (DD/MM/YYYY)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="DD/MM/YYYY"
                                      value={dateInput}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setDateInput(val);
                                        const parsed = parse(val, "dd/MM/yyyy", new Date());
                                        if (isValid(parsed)) field.onChange(parsed);
                                      }}
                                      className="h-14 border-4 border-primary/10 rounded-2xl px-6 font-black text-lg focus:border-primary shadow-inner transition-all"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )} />
                             <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="startTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-primary/60">Start Time</FormLabel>
                                        <FormControl><Input type="time" {...field} className="h-14 border-4 border-primary/10 rounded-2xl font-black text-lg focus:border-primary shadow-inner"/></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="endTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-primary/60">End Time</FormLabel>
                                        <FormControl><Input type="time" {...field} className="h-14 border-4 border-primary/10 rounded-2xl font-black text-lg focus:border-primary shadow-inner"/></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-primary/60">Subject</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-14 border-4 border-primary/10 rounded-2xl font-black focus:border-primary shadow-inner text-lg">
                                            {subjectsLoading ? <Zap className="h-6 w-6 animate-bolt"/> : <SelectValue placeholder="Pick a subject" />}
                                        </SelectTrigger></FormControl>
                                        <SelectContent className="rounded-2xl border-4 bg-background/95 backdrop-blur-xl">
                                            {subjects.map(s => <SelectItem key={s.id} value={s.title} className="font-bold py-4 rounded-xl">{s.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="details" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-primary/60">Room or Lab Number</FormLabel>
                                    <FormControl><Input placeholder="e.g. Room 204" {...field} className="h-14 border-4 border-primary/10 rounded-2xl font-bold text-lg focus:border-primary shadow-inner"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter className="gap-4 pt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-black text-[12px] uppercase tracking-widest h-14 px-10">Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="h-14 px-12 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl">
                                     {form.formState.isSubmitting ? <Zap className="h-5 w-5 animate-bolt fill-white/20" /> : 'Save Exam'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
