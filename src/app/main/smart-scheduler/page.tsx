"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CalendarRange, 
  Plus, 
  Trash2, 
  Zap, 
  Clock, 
  UserCheck, 
  Users, 
  ArrowLeftRight, 
  Coffee,
  BookOpen,
  Download,
  RefreshCw,
  Loader2,
  Search,
  X,
  FileDown,
  Table as TableIcon,
  FileText,
  FlaskConical
} from "lucide-react";
import { 
  generateSmartSchedule, 
  SchedulerConfig, 
  ScheduledEntry 
} from "@/lib/scheduler-utils";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubjects } from '@/hooks/use-firestore';
import { downloadTableAsPDF, downloadTableAsExcel } from "@/lib/download-utils";

export default function SmartSchedulerPage() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [config, setConfig] = useState<SchedulerConfig>({
    startTime: "08:30",
    lectureDuration: 45,
    lectureCount: 7,
    breakAfter: 4,
    breakDuration: 30,
    teachers: [
      { name: "Prof. Alan", subject: "Mathematics", targetClass: "10th", targetDivision: "A", lecturesPerWeek: 5, labsPerWeek: 0 },
      { name: "Dr. Sarah", subject: "Physics", targetClass: "10th", targetDivision: "A", lecturesPerWeek: 4, labsPerWeek: 1 },
    ],
    classes: [
      { name: "10th", division: "A" },
      { name: "10th", division: "B" }
    ]
  });

  const [generatedEntries, setGeneratedEntries] = useState<ScheduledEntry[]>([]);
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const { toast } = useToast();

  const handleAddTeacher = () => {
    setConfig({ 
      ...config, 
      teachers: [...config.teachers, { name: "", subject: "", targetClass: "", targetDivision: "", lecturesPerWeek: 1, labsPerWeek: 0 }] 
    });
  };

  const handleSyncSubjects = () => {
    if (subjects.length === 0) {
      toast({ title: "No Subjects Found", description: "Add some subjects in the 'My Subjects' tab first." });
      return;
    }
    const syncedTeachers = subjects.map(s => ({
      name: s.instructor,
      subject: s.title,
      targetClass: "",
      targetDivision: "",
      lecturesPerWeek: 1,
      labsPerWeek: 0
    }));
    setConfig({ ...config, teachers: [...config.teachers, ...syncedTeachers] });
    toast({ title: "Data Synced", description: `Added ${syncedTeachers.length} assignments.` });
  };

  const handleAddClass = () => {
    setConfig({ ...config, classes: [...config.classes, { name: "", division: "" }] });
  };

  const handleRemoveTeacher = (idx: number) => {
    const updated = config.teachers.filter((_, i) => i !== idx);
    setConfig({ ...config, teachers: updated });
  };

  const handleRemoveClass = (idx: number) => {
    const updated = config.classes.filter((_, i) => i !== idx);
    setConfig({ ...config, classes: updated });
  };

  const handleGenerate = () => {
    const hasEmpty = config.teachers.some(t => !t.name || !t.subject || !t.targetClass || !t.targetDivision);
    if (hasEmpty) {
      toast({ variant: "destructive", title: "Incomplete Config", description: "Please assign a Class and Division to all teacher allotments." });
      return;
    }
    const results = generateSmartSchedule(config);
    setGeneratedEntries(results);
    toast({ title: "Schedule Generated", description: "Conflict-free roadmap is ready." });
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const uniqueTimeSlots = useMemo(() => 
    Array.from(new Set(generatedEntries.map(e => e.startTime))).sort(), 
    [generatedEntries]
  );

  const handleDownloadClass = (formatType: 'pdf' | 'excel') => {
    if (generatedEntries.length === 0) return;
    const headers = ["Time", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const body = uniqueTimeSlots.map(time => {
      const row = [time];
      DAYS.forEach(day => {
        const entry = generatedEntries.find(e => 
          e.day === day && 
          e.startTime === time && 
          e.className === config.classes[selectedClassIdx]?.name &&
          e.division === config.classes[selectedClassIdx]?.division
        );
        row.push(entry ? (entry.isLab ? `PRACTICAL: ${entry.subject}` : entry.subject) : '-');
      });
      return row;
    });
    const fileName = `Class_${config.classes[selectedClassIdx]?.name}_${config.classes[selectedClassIdx]?.division}`;
    if (formatType === 'excel') downloadTableAsExcel(headers, body, fileName);
    else downloadTableAsPDF(`Class Schedule: ${config.classes[selectedClassIdx]?.name}-${config.classes[selectedClassIdx]?.division}`, headers, body, fileName);
  };

  const handleDownloadTeacherDuty = (teacher: string, formatType: 'pdf' | 'excel') => {
    const headers = ["Time", ...DAYS];
    const body = uniqueTimeSlots.map(time => {
      const row = [time];
      DAYS.forEach(day => {
        const entry = generatedEntries.find(e => e.day === day && e.startTime === time && e.teacherName === teacher);
        const isRecess = generatedEntries.some(e => e.startTime === time && e.isBreak && e.day === day);
        if (isRecess) row.push('RECESS');
        else if (entry) row.push(`${entry.isLab ? 'LAB: ' : ''}${entry.subject} (${entry.className}-${entry.division})`);
        else row.push('No Duty');
      });
      return row;
    });
    const fileName = `Duty_${teacher.replace(/\s+/g, '_')}`;
    if (formatType === 'excel') downloadTableAsExcel(headers, body, fileName);
    else downloadTableAsPDF(`Duty Chart: ${teacher}`, headers, body, fileName);
  };

  const uniqueTeachersList = useMemo(() => 
    Array.from(new Set(generatedEntries.filter(e => !e.isBreak && e.teacherName !== 'None' && e.teacherName !== 'N/A').map(e => e.teacherName))).sort(),
    [generatedEntries]
  );

  const filteredTeachers = useMemo(() => 
    uniqueTeachersList.filter(t => t.toLowerCase().includes(teacherSearchQuery.toLowerCase())),
    [uniqueTeachersList, teacherSearchQuery]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <CalendarRange className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Smart Scheduler</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Algorithmic conflict-free planning with weekly lecture and lab quotas.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <Card className="border-2 shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Configuration Hub</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Time</Label>
                <Input type="time" value={config.startTime} onChange={e => setConfig({...config, startTime: e.target.value})} className="h-12 border-2 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lecture (Mins)</Label>
                <Input type="number" value={config.lectureDuration} onChange={e => setConfig({...config, lectureDuration: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slots/Day</Label>
                <Input type="number" value={config.lectureCount} onChange={e => setConfig({...config, lectureCount: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Break After</Label>
                <Input type="number" value={config.breakAfter} onChange={e => setConfig({...config, breakAfter: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Break (Mins)</Label>
                <Input type="number" value={config.breakDuration} onChange={e => setConfig({...config, breakDuration: parseInt(e.target.value)})} className="h-12 border-2 rounded-xl font-bold" />
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t-2 border-dashed">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">1. Manage Classes</p>
                <Button variant="outline" size="sm" onClick={handleAddClass} className="h-9 px-4 rounded-xl text-primary font-bold border-2"><Plus className="h-4 w-4 mr-2" /> Add Class</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.classes.map((c, i) => (
                  <div key={i} className="flex gap-2 p-3 rounded-xl bg-muted/20 border-2 relative group transition-all hover:border-primary/20">
                    <Input placeholder="Class (e.g. 10th)" value={c.name} onChange={e => {
                      const updated = [...config.classes]; updated[i].name = e.target.value; setConfig({...config, classes: updated});
                    }} className="h-10 text-xs border-2 rounded-xl font-bold" />
                    <Input placeholder="Div (e.g. A)" value={c.division} onChange={e => {
                      const updated = [...config.classes]; updated[i].division = e.target.value; setConfig({...config, classes: updated});
                    }} className="h-10 text-xs border-2 rounded-xl font-bold w-20" />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveClass(i)} className="h-10 w-10 text-destructive shrink-0 opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t-2 border-dashed">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">2. Allotment Inventory (Lectures & Labs)</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSyncSubjects} disabled={subjectsLoading} className="h-9 px-4 rounded-xl text-primary font-bold border-2 border-primary/10">
                    {subjectsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />} Sync Subjects
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAddTeacher} className="h-9 px-4 rounded-xl text-primary font-bold border-2"><Plus className="h-4 w-4 mr-2" /> Add Assignment</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 px-4 hidden md:grid">
                  <div className="col-span-3 text-[9px] font-black uppercase text-muted-foreground/60">Teacher</div>
                  <div className="col-span-2 text-[9px] font-black uppercase text-muted-foreground/60">Subject</div>
                  <div className="col-span-2 text-[9px] font-black uppercase text-muted-foreground/60">Target Class</div>
                  <div className="col-span-2 text-[9px] font-black uppercase text-muted-foreground/60">Target Div</div>
                  <div className="col-span-1 text-[9px] font-black uppercase text-muted-foreground/60">Lec/Wk</div>
                  <div className="col-span-1 text-[9px] font-black uppercase text-muted-foreground/60">Lab/Wk</div>
                  <div className="col-span-1"></div>
                </div>
                {config.teachers.map((t, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-muted/10 border-2 hover:border-primary/30 transition-all group items-center">
                    <div className="md:col-span-3">
                      <Input placeholder="Teacher" value={t.name} onChange={e => {
                        const updated = [...config.teachers]; updated[i].name = e.target.value; setConfig({...config, teachers: updated});
                      }} className="h-10 text-xs border-2 rounded-xl font-bold" />
                    </div>
                    <div className="md:col-span-2">
                      <Input placeholder="Subject" value={t.subject} onChange={e => {
                        const updated = [...config.teachers]; updated[i].subject = e.target.value; setConfig({...config, teachers: updated});
                      }} className="h-10 text-xs border-2 rounded-xl font-bold" />
                    </div>
                    <div className="md:col-span-2">
                      <Select value={t.targetClass} onValueChange={val => {
                        const updated = [...config.teachers]; updated[i].targetClass = val; setConfig({...config, teachers: updated});
                      }}>
                        <SelectTrigger className="h-10 text-xs border-2 rounded-xl font-bold">
                          <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 font-bold">
                          {config.classes.filter(c => c.name.trim() !== "").map((cls, ci) => (
                            <SelectItem key={ci} value={cls.name} className="text-xs">{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Select value={t.targetDivision} onValueChange={val => {
                        const updated = [...config.teachers]; updated[i].targetDivision = val; setConfig({...config, teachers: updated});
                      }}>
                        <SelectTrigger className="h-10 text-xs border-2 rounded-xl font-bold">
                          <SelectValue placeholder="Div" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 font-bold">
                          {config.classes.filter(c => c.division.trim() !== "").map((cls, ci) => (
                            <SelectItem key={ci} value={cls.division} className="text-xs">{cls.division}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <Input type="number" placeholder="Lec" value={t.lecturesPerWeek} onChange={e => {
                        const updated = [...config.teachers]; updated[i].lecturesPerWeek = parseInt(e.target.value); setConfig({...config, teachers: updated});
                      }} className="h-10 text-xs border-2 rounded-xl font-bold text-center" />
                    </div>
                    <div className="md:col-span-1">
                      <Input type="number" placeholder="Lab" value={t.labsPerWeek} onChange={e => {
                        const updated = [...config.teachers]; updated[i].labsPerWeek = parseInt(e.target.value); setConfig({...config, teachers: updated});
                      }} className="h-10 text-xs border-2 rounded-xl font-bold text-center" />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveTeacher(i)} className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              <Zap className="mr-3 h-5 w-5 fill-white/20" /> Run Algorithmic Solver
            </Button>
          </CardContent>
        </Card>

        <div className="w-full space-y-8">
          {generatedEntries.length > 0 ? (
            <Card className="border-4 shadow-2xl overflow-hidden rounded-[3.5rem] bg-background">
              <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-10 px-12 flex flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20">
                    {viewMode === 'class' ? <Users className="h-7 w-7 text-primary" /> : <UserCheck className="h-7 w-7 text-primary" />}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">
                      {viewMode === 'class' ? 'Class Timetable' : 'Faculty Duty Grid'}
                    </CardTitle>
                    <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">
                      {viewMode === 'class' 
                        ? `Viewing Class: ${config.classes[selectedClassIdx]?.name}-${config.classes[selectedClassIdx]?.division}`
                        : 'Search faculty name to see their weekly workload'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {viewMode === 'class' ? (
                    <div className="flex gap-2">
                      <Select value={selectedClassIdx.toString()} onValueChange={(val) => setSelectedClassIdx(parseInt(val))}>
                        <SelectTrigger className="w-[200px] h-14 border-4 rounded-2xl font-bold bg-background shadow-lg"><SelectValue placeholder="Select Class" /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-4 font-bold">
                          {config.classes.map((cls, idx) => (
                            <SelectItem key={idx} value={idx.toString()} className="py-3 px-4 rounded-xl cursor-pointer">
                              Class {cls.name || 'Untitled'} - {cls.division || 'N/A'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-14 px-6 rounded-2xl border-4 shadow-lg font-bold gap-2"><Download className="h-5 w-5" /> Export</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-4 font-bold p-2">
                          <DropdownMenuItem onClick={() => handleDownloadClass('excel')} className="py-3 px-4 cursor-pointer gap-2 rounded-xl"><TableIcon className="h-4 w-4 text-emerald-600" /> Excel</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadClass('pdf')} className="py-3 px-4 cursor-pointer gap-2 rounded-xl"><FileText className="h-4 w-4 text-red-600" /> PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Search Teacher..." 
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                        className="h-14 pl-12 pr-10 border-4 rounded-2xl font-bold w-[250px] bg-background shadow-lg"
                      />
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 rounded-2xl border-4 font-black uppercase text-[10px] tracking-widest gap-3 shadow-lg hover:bg-primary/5"
                    onClick={() => setViewMode(viewMode === 'class' ? 'teacher' : 'class')}
                  >
                    <ArrowLeftRight className="h-4 w-4" /> Swap View
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-hide">
                  {viewMode === 'class' ? (
                    <Table className="min-w-[1000px]">
                      <TableHeader className="bg-muted/10">
                        <TableRow className="border-none">
                          <TableHead className="w-[150px] font-black uppercase text-[11px] tracking-widest pl-12 py-8 border-r-2 border-primary/5">Time</TableHead>
                          {DAYS.map(day => (
                            <TableHead key={day} className="font-black uppercase text-[11px] tracking-widest text-center border-r-2 border-primary/5 last:border-none">{day}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uniqueTimeSlots.map(time => (
                          <TableRow key={time} className="h-28 border-none group transition-all">
                            <TableCell className="font-black text-[13px] tracking-tighter py-8 border-r-2 border-primary/5 bg-muted/5 pl-12 group-hover:text-primary transition-colors">{time}</TableCell>
                            {DAYS.map(day => {
                              const entry = generatedEntries.find(e => e.day === day && e.startTime === time && e.className === config.classes[selectedClassIdx]?.name && e.division === config.classes[selectedClassIdx]?.division);
                              return (
                                <TableCell key={day} className="p-3 align-middle border-r-2 border-primary/5 last:border-none">
                                  {entry ? (
                                    <div className={cn(
                                      "h-full min-h-[80px] border-4 rounded-[2rem] p-4 shadow-inner flex flex-col justify-center text-center transition-all duration-500",
                                      entry.isBreak ? "bg-amber-500/10 border-amber-500/20" : entry.isLab ? "bg-emerald-500/10 border-emerald-500/20" : "bg-primary/5 border-primary/10"
                                    )}>
                                      <div className="flex items-center justify-center gap-2 mb-1">
                                        {entry.isBreak ? <Coffee className="h-3 w-3 text-amber-600" /> : entry.isLab ? <FlaskConical className="h-3 w-3 text-emerald-600" /> : <BookOpen className="h-3 w-3 text-primary" />}
                                        <p className={cn("font-black text-sm uppercase tracking-tight", entry.isBreak ? "text-amber-700" : entry.isLab ? "text-emerald-700" : "text-primary")}>{entry.subject}</p>
                                      </div>
                                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 truncate">{entry.teacherName}</p>
                                    </div>
                                  ) : <div className="h-full w-full bg-muted/5 rounded-[2rem] opacity-20" />}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-10 space-y-10">
                      {filteredTeachers.length === 0 ? (
                        <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                          <Search className="h-16 w-16" />
                          <p className="text-2xl font-black uppercase tracking-widest">No Matches</p>
                        </div>
                      ) : (
                        filteredTeachers.map(teacher => (
                          <div key={teacher} className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center justify-between px-2">
                              <Badge className="h-10 px-6 rounded-xl font-black uppercase text-xs tracking-widest bg-primary text-white shadow-xl">{teacher}'s Weekly Duty Chart</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" className="h-10 px-6 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm"><Download className="h-4 w-4" /> Export Duty</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-xl border-2 font-bold p-2">
                                  <DropdownMenuItem onClick={() => handleDownloadTeacherDuty(teacher, 'excel')} className="py-2 px-4 cursor-pointer gap-2 rounded-lg"><TableIcon className="h-4 w-4 text-emerald-600" /> Excel</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadTeacherDuty(teacher, 'pdf')} className="py-2 px-4 cursor-pointer gap-2 rounded-lg"><FileText className="h-4 w-4 text-red-600" /> PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="border-4 rounded-[2.5rem] overflow-hidden shadow-xl border-primary/5">
                              <Table className="min-w-[1000px]">
                                <TableHeader className="bg-primary/5"><TableRow className="border-none"><TableHead className="w-[150px] font-black uppercase text-[10px] tracking-widest pl-10 py-6 border-r-2 border-primary/10">Time</TableHead>
                                {DAYS.map(day => <TableHead key={day} className="font-black uppercase text-[10px] tracking-widest text-center border-r-2 border-primary/10 last:border-none">{day}</TableHead>)}
                                </TableRow></TableHeader>
                                <TableBody>
                                  {uniqueTimeSlots.map(time => (
                                    <TableRow key={time} className="h-24 hover:bg-primary/[0.02] border-none transition-all">
                                      <TableCell className="font-black text-xs tracking-tighter py-6 border-r-2 border-primary/10 bg-muted/5 pl-10">{time}</TableCell>
                                      {DAYS.map(day => {
                                        const entry = generatedEntries.find(e => e.day === day && e.startTime === time && e.teacherName === teacher);
                                        const isRecess = generatedEntries.some(e => e.startTime === time && e.isBreak && e.day === day);
                                        return (
                                          <TableCell key={day} className="p-2 align-middle border-r-2 border-primary/10 last:border-none">
                                            {isRecess ? <div className="h-full min-h-[60px] bg-amber-500/5 border-2 border-dashed border-amber-500/10 rounded-2xl flex items-center justify-center"><Coffee className="h-4 w-4 text-amber-600/30" /></div> : entry ? (
                                              <div className={cn("h-full min-h-[60px] border-2 rounded-2xl p-3 flex flex-col justify-center text-center", entry.isLab ? "bg-emerald-500/10 border-emerald-500/20" : "bg-primary/10 border-primary/20")}>
                                                <p className={cn("font-black text-[10px] uppercase mb-1", entry.isLab ? "text-emerald-700" : "text-primary")}>{entry.isLab ? 'LAB: ' : ''}{entry.subject}</p>
                                                <p className="text-[14px] font-black text-foreground/80 tracking-tighter">{entry.className}-{entry.division}</p>
                                              </div>
                                            ) : <div className="h-full min-h-[60px] bg-muted/5 rounded-2xl opacity-10 flex items-center justify-center"><span className="text-[10px] font-bold uppercase tracking-widest">No Duty</span></div>}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[400px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group hover:opacity-30 transition-all bg-muted/5">
               <CalendarRange className="h-24 w-24 mb-8" />
               <h3 className="text-4xl font-black uppercase tracking-widest">Ready to Solve</h3>
               <p className="text-xl font-bold mt-2 max-w-md">Input your faculty inventory above. The system will calculate an optimal weekly workload across all classes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
