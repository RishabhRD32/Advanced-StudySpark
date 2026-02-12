"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubject, useAssignments, useStudyMaterials } from "@/hooks/use-firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MoreVertical, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Link as LinkIcon, 
  FileText, 
  Megaphone, 
  Zap, 
  Globe, 
  ShieldCheck, 
  BookOpen,
  Sparkles,
  BrainCircuit,
  ScrollText,
  Map,
  Loader2,
  X
} from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Assignment, StudyMaterial } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth/use-auth";
import { format, parse, isValid } from "date-fns";
import { aiTutorAssistance } from "@/ai/flows/ai-tutor-assistance";
import { summarizeText } from "@/ai/flows/text-summarization";

const assignmentSchema = z.object({
  title: z.string().min(1, "Name is required"),
  dueDate: z.date({ required_error: "A valid date is required (DD/MM/YYYY)." }),
  status: z.enum(["Pending", "Completed"]),
  grade: z.string().optional(),
}).refine(data => {
    if (data.status === 'Completed' && data.grade) {
        const gradeNum = parseFloat(data.grade);
        return !isNaN(gradeNum) && gradeNum >= 0 && gradeNum <= 100;
    }
    return true;
}, { message: "Score must be between 0 and 100.", path: ["grade"] });

const materialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["Notes", "Practicals", "PYQ"]),
    contentType: z.enum(["link", "text"]),
    content: z.string().min(1, "Content is required"),
    isPublic: z.boolean().default(false),
    isBroadcast: z.boolean().default(false),
});

export default function SubjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { userProfile } = useAuth();
  const { subject, loading: subjectLoading } = useSubject(id);
  const { assignments, loading: assignmentsLoading, addAssignment, updateAssignment, deleteAssignment } = useAssignments(id);
  const { materials, loading: materialsLoading, addMaterial, deleteMaterial } = useStudyMaterials(id);
  const { toast } = useToast();

  const [isAssignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [dateInput, setDateInput] = useState("");

  // AI Assistant States
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiAiMode] = useState<'concepts' | 'notes' | 'roadmap' | null>(null);

  const isTeacher = userProfile?.profession === 'teacher';

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: "", status: "Pending", grade: "" },
  });

  const materialForm = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: { title: "", type: "Notes", contentType: "link", content: "", isPublic: false, isBroadcast: false },
  });

  const handleOpenAssignmentModal = (assignment: Assignment | null = null) => {
    setEditingAssignment(assignment);
    if (assignment) {
      const date = new Date(assignment.dueDate);
      assignmentForm.reset({ title: assignment.title, dueDate: date, status: assignment.status, grade: assignment.grade?.toString() ?? "" });
      setDateInput(format(date, "dd/MM/yyyy"));
    } else {
      assignmentForm.reset({ title: "", dueDate: undefined, status: "Pending", grade: "" });
      setDateInput("");
    }
    setAssignmentModalOpen(true);
  };
  
  const handleAssignmentSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    const grade = values.status === 'Completed' && values.grade ? parseFloat(values.grade) : null;
    const data = { ...values, grade, dueDate: values.dueDate.toISOString() };
    
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, data);
      toast({ title: "Success", description: "Task updated." });
    } else {
      addAssignment({ ...data, subjectId: id });
      toast({ title: "Success", description: "Task added." });
    }
    setAssignmentModalOpen(false);
  };

  const handleMaterialSubmit = async (values: z.infer<typeof materialSchema>) => {
    const uploaderName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Anonymous";
    addMaterial({ 
      ...values, 
      uploaderName, 
      subjectId: id, 
      ccCode: userProfile?.ccCode || '',
    });
    toast({ title: "Success", description: "Material added." });
    setMaterialModalOpen(false);
    materialForm.reset();
  };

  // AI Help Handlers - Integrated with Direct Bridge Preferences
  const handleExplainConcepts = async () => {
    if (!subject) return;
    setIsAiLoading(true);
    setAiAiMode('concepts');
    setAiResult(null);
    try {
      const res = await aiTutorAssistance({ 
        question: `Explain the core concepts and fundamental principles of the subject: ${subject.title}. Use simple language and clear academic context.`,
        provider: userProfile?.preferredCloudProvider || 'google',
        model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
      });
      setAiResult(res.answer);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Busy", description: "Could not analyze concepts right now. Try switching providers in Settings." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSummarizeNotes = async () => {
    const textMaterials = materials.filter(m => m.contentType === 'text' && m.content);
    if (textMaterials.length === 0) {
      toast({ title: "No Text Notes", description: "Upload some text notes first to use this feature." });
      return;
    }
    setIsAiLoading(true);
    setAiAiMode('notes');
    setAiResult(null);
    try {
      const combinedText = textMaterials.map(m => `--- ${m.title} ---\n${m.content}`).join('\n\n');
      const res = await summarizeText({ 
        text: combinedText,
        provider: userProfile?.preferredCloudProvider || 'google',
        model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
      });
      setAiResult(res.summary);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Busy", description: "Could not analyze notes right now." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!subject) return;
    setIsAiLoading(true);
    setAiAiMode('roadmap');
    setAiResult(null);
    try {
      const res = await aiTutorAssistance({ 
        question: `Create a step-by-step study roadmap for mastering the subject: ${subject.title}. Include key topics to cover and a suggested order of study based on academic standards.`,
        provider: userProfile?.preferredCloudProvider || 'google',
        model: userProfile?.preferredCloudModel || 'gemini-1.5-flash'
      });
      setAiResult(res.answer);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Busy", description: "Could not generate roadmap right now." });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (subjectLoading) return <div className="p-12 space-y-10"><Skeleton className="h-20 w-1/2 rounded-[2rem]" /><Skeleton className="h-64 w-full rounded-[3.5rem]" /></div>;
  if (!subject) return <div className="text-center py-40 opacity-20"><Zap className="h-24 w-24 mx-auto mb-6" /><h2 className="text-4xl font-bold uppercase">Subject Not Found</h2></div>;

  const renderMaterial = (material: StudyMaterial) => {
    return (
      <div className="flex items-center gap-3">
        {material.contentType === 'link' ? (
          <a href={material.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline font-bold text-lg">
            <LinkIcon className="h-5 w-5" /> {material.title}
          </a>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-left text-primary hover:underline font-bold text-lg">
                <FileText className="h-5 w-5" /> {material.title}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-[3rem] border-8 bg-background/95 backdrop-blur-3xl p-0 overflow-hidden">
              <DialogHeader className="bg-primary/5 border-b-4 border-primary/5 p-10">
                <DialogTitle className="text-4xl font-bold tracking-tight">{material.title}</DialogTitle>
                <div className="flex gap-4 mt-4">
                  {material.isPublic && <Badge className="font-bold uppercase text-[10px] tracking-widest"><Globe className="h-3 w-3 mr-1" /> Shared publicly</Badge>}
                  {material.isBroadcast && <Badge variant="secondary" className="font-bold uppercase text-[10px] tracking-widest"><Megaphone className="h-3 w-3 mr-1" /> Sent by Teacher</Badge>}
                </div>
              </DialogHeader>
              <div className="p-10 max-h-[60vh] overflow-y-auto font-medium text-xl leading-relaxed whitespace-pre-wrap">
                {material.content}
              </div>
            </DialogContent>
          </Dialog>
        )}
        {material.isBroadcast && <Megaphone className="h-4 w-4 text-emerald-500 animate-pulse" />}
        {material.isPublic && <Globe className="h-4 w-4 text-blue-400" />}
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-24 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b-4 border-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-primary/60">Subject Details</span>
          </div>
          <h1 className="text-7xl font-bold tracking-tight leading-none">{subject.title}</h1>
          <p className="text-2xl text-muted-foreground font-bold italic opacity-40">Teacher: {subject.instructor}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setMaterialModalOpen(true)} variant="outline" className="h-16 px-10 rounded-[2rem] border-4 font-bold uppercase tracking-widest hover:bg-primary/5 transition-all shadow-xl">
            Add Notes
          </Button>
          <Button onClick={() => handleOpenAssignmentModal()} className="h-16 px-10 rounded-[2rem] font-bold uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
            <PlusCircle className="mr-3 h-6 w-6" /> New Task
          </Button>
        </div>
      </div>

      <div className="space-y-12 max-w-5xl mx-auto">
        {/* AI SUBJECT ASSISTANT */}
        <Card className="border-4 border-primary/10 bg-primary/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <CardHeader className="bg-primary/10 border-b-4 border-primary/5 py-8 px-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <Sparkles className="h-6 w-6 text-primary animate-float" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">AI Subject Assistant</CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Analyze resources via {userProfile?.preferredCloudProvider?.toUpperCase() || 'Google'}</p>
              </div>
            </div>
            {aiResult && (
              <Button variant="ghost" size="icon" onClick={() => { setAiResult(null); setAiAiMode(null); }} className="h-10 w-10 rounded-full hover:bg-white/50">
                <X className="h-5 w-5" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-10">
            {!aiResult && !isAiLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleExplainConcepts} className="h-24 rounded-[2rem] bg-white text-primary border-4 border-primary/10 flex flex-col gap-2 hover:bg-primary hover:text-white transition-all shadow-lg group">
                  <BrainCircuit className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Core Concepts</span>
                </Button>
                <Button onClick={handleSummarizeNotes} className="h-24 rounded-[2rem] bg-white text-primary border-4 border-primary/10 flex flex-col gap-2 hover:bg-primary hover:text-white transition-all shadow-lg group">
                  <ScrollText className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Analyze Notes</span>
                </Button>
                <Button onClick={handleGenerateRoadmap} className="h-24 rounded-[2rem] bg-white text-primary border-4 border-primary/10 flex flex-col gap-2 hover:bg-primary hover:text-white transition-all shadow-lg group">
                  <Map className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Study Roadmap</span>
                </Button>
              </div>
            ) : isAiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                  {aiMode === 'concepts' ? 'Analyzing Science...' : aiMode === 'notes' ? 'Synthesizing Resources...' : 'Mapping Roadmap...'}
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 border-b pb-4">
                  {aiMode === 'concepts' && <BrainCircuit className="h-5 w-5 text-primary" />}
                  {aiMode === 'notes' && <ScrollText className="h-5 w-5 text-primary" />}
                  {aiMode === 'roadmap' && <Map className="h-5 w-5 text-primary" />}
                  <h3 className="font-black uppercase text-xs tracking-widest">
                    {aiMode === 'concepts' ? 'Core Concepts' : aiMode === 'notes' ? 'Notes Summary' : 'Subject Roadmap'}
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap italic opacity-90">
                    {aiResult}
                  </p>
                </div>
                <div className="pt-6 flex justify-end">
                  <Button variant="outline" onClick={() => { setAiResult(null); setAiAiMode(null); }} className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-10 border-2">
                    Clear Result
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MY TASKS */}
        <Card className="glass-card">
          <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-10 px-12 flex flex-row items-center justify-between">
            <div className="flex items-center gap-5">
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle className="text-[12px] font-bold uppercase tracking-widest">My Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {assignmentsLoading ? <div className="p-20 text-center"><Zap className="animate-bolt mx-auto text-primary h-16 w-16 fill-primary/20"/></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-12 py-8 font-bold text-[12px] uppercase tracking-widest border-r-4 border-primary/5">Task Name</TableHead>
                    <TableHead className="font-bold text-[12px] uppercase tracking-widest border-r-4 border-primary/5">Due Date</TableHead>
                    <TableHead className="font-bold text-[12px] uppercase tracking-widest border-r-4 border-primary/5">Status</TableHead>
                    <TableHead className="font-bold text-[12px] uppercase tracking-widest border-r-4 border-primary/5 text-center">Score</TableHead>
                    <TableHead className="pr-12 text-right font-bold text-[12px] uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40 text-muted-foreground font-bold uppercase opacity-10 text-4xl italic tracking-tight">No tasks yet.</TableCell></TableRow>
                  ) : assignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-primary/[0.03] border-none group transition-all h-32">
                      <TableCell className="pl-12 py-8 font-bold text-3xl group-hover:text-primary transition-colors tracking-tight border-r-4 border-primary/5">{assignment.title}</TableCell>
                      <TableCell className="font-bold text-xs uppercase tracking-widest text-muted-foreground border-r-4 border-primary/5">{format(new Date(assignment.dueDate), 'PPP')}</TableCell>
                      <TableCell className="border-r-4 border-primary/5">
                        <Badge variant={assignment.status === "Completed" ? "secondary" : "outline"} className="font-bold uppercase text-[10px] px-6 py-2 rounded-full border-2 shadow-inner">
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-5xl text-primary tabular-nums text-center border-r-4 border-primary/5">
                        {assignment.status === 'Completed' && assignment.grade !== null ? `${assignment.grade}%` : '—'}
                      </TableCell>
                      <TableCell className="pr-12 text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.5rem] border-4 opacity-0 group-hover:opacity-100 transition-all"><MoreVertical className="h-6 w-6" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-4 p-2 w-48 shadow-2xl">
                                  <DropdownMenuItem onClick={() => handleOpenAssignmentModal(assignment)} className="font-bold py-4 rounded-xl px-6 cursor-pointer"><Edit className="mr-3 h-5 w-5 text-primary" /> Edit</DropdownMenuItem>
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive font-bold py-4 rounded-xl px-6 cursor-pointer"><Trash2 className="mr-3 h-5 w-5" /> Delete</DropdownMenuItem></AlertDialogTrigger>
                                      <AlertDialogContent className="rounded-[3rem] border-8 border-primary/5 p-12">
                                          <AlertDialogHeader><AlertDialogTitle className="font-bold text-4xl tracking-tight">Are you sure?</AlertDialogTitle><AlertDialogDescription className="font-medium text-xl leading-relaxed mt-4">This will delete this task. You cannot undo this.</AlertDialogDescription></AlertDialogHeader>
                                          <AlertDialogFooter className="mt-10 gap-4"><AlertDialogCancel className="rounded-2xl h-16 px-10 font-bold text-[12px] uppercase tracking-widest border-4">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteAssignment(assignment.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl h-16 px-10 font-bold text-[12px] uppercase tracking-widest shadow-2xl">Delete</AlertDialogAction></AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>

        {/* STUDY MATERIALS */}
        <Card className="glass-card">
            <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-10 px-12 flex flex-row items-center gap-5">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <CardTitle className="text-[12px] font-bold uppercase tracking-widest">Study Materials</CardTitle>
            </CardHeader>
            <CardContent className="p-12">
                {materialsLoading ? <div className="p-20 text-center"><Zap className="animate-bolt mx-auto text-primary h-16 w-16 fill-primary/20"/></div> : (
                <Accordion type="multiple" className="space-y-8">
                    {[
                      { label: 'Class Notes', val: 'Notes' },
                      { label: 'Practical Work', val: 'Practicals' },
                      { label: 'Old Papers', val: 'PYQ' }
                    ].map((cat) => (
                      <AccordionItem key={cat.val} value={cat.val.toLowerCase()} className="border-none bg-muted/10 rounded-[3rem] px-8 overflow-hidden group/acc">
                        <AccordionTrigger className="hover:no-underline py-10 font-bold uppercase text-base tracking-widest group-data-[state=open]/acc:text-primary transition-colors">{cat.label}</AccordionTrigger>
                        <AccordionContent className="pb-10">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materials.filter(m => m.type === cat.val).length === 0 ? <p className="text-muted-foreground text-sm italic font-bold uppercase opacity-10 p-4 text-center col-span-full">Empty</p> : materials.filter(m => m.type === cat.val).map(m => (
                                    <li key={m.id} className="flex justify-between items-center group/item bg-background/50 p-6 rounded-[2rem] border-4 border-transparent hover:border-primary/30 transition-all shadow-xl">
                                        <div className="transition-transform group-hover/item:translate-x-2">
                                          {renderMaterial(m)}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive opacity-0 group-hover/item:opacity-100 transition-all hover:bg-destructive/10" onClick={() => deleteMaterial(m.id)}>
                                          <Trash2 className="h-5 w-5"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
                )}
            </CardContent>
        </Card>
      </div>

        <Dialog open={isAssignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
            <DialogContent className="max-w-xl rounded-[4rem] border-8 border-primary/10 bg-background/95 backdrop-blur-3xl p-12">
                 <Form {...assignmentForm}><form onSubmit={assignmentForm.handleSubmit(handleAssignmentSubmit)}>
                        <DialogHeader><DialogTitle className="font-bold text-5xl tracking-tight mb-4">{editingAssignment ? 'Update' : 'New'} <span className="text-primary">Task</span></DialogTitle></DialogHeader>
                        <div className="grid gap-8 py-10">
                            <FormField control={assignmentForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Task Name</FormLabel><FormControl><Input placeholder="What do you need to do?" {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-bold text-xl px-6 focus:border-primary transition-all shadow-inner" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={assignmentForm.control} name="dueDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Due Date (DD/MM/YYYY)</FormLabel>
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
                                      className="h-16 border-4 border-primary/10 rounded-2xl px-6 font-bold text-lg focus:border-primary shadow-inner transition-all"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}/>
                            <FormField control={assignmentForm.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Status</FormLabel><FormControl><select {...field} className="w-full h-16 border-4 border-primary/10 rounded-2xl bg-background font-black uppercase text-sm px-6 focus:border-primary transition-all shadow-inner"><option value="Pending">Pending</option><option value="Completed">Completed</option></select></FormControl><FormMessage /></FormItem>
                            )}/>
                            {assignmentForm.watch('status') === 'Completed' && (
                                <FormField control={assignmentForm.control} name="grade" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Score (%)</FormLabel><FormControl><Input type="number" placeholder="0-100" {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-bold text-3xl text-center focus:border-primary shadow-inner" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                        </div>
                        <DialogFooter className="gap-4 pt-6">
                          <Button type="button" variant="ghost" onClick={() => setAssignmentModalOpen(false)} className="font-bold text-[12px] uppercase tracking-widest h-16 px-10">Cancel</Button>
                          <Button type="submit" disabled={assignmentForm.formState.isSubmitting} className="h-16 px-12 rounded-[2rem] font-bold uppercase text-[12px] tracking-widest shadow-xl transition-all active:scale-95">Save Task</Button>
                        </DialogFooter>
                    </form></Form>
            </DialogContent>
        </Dialog>

        <Dialog open={isMaterialModalOpen} onOpenChange={setMaterialModalOpen}>
            <DialogContent className="max-w-3xl rounded-[4rem] border-8 border-primary/10 bg-background/95 backdrop-blur-3xl p-12"><Form {...materialForm}><form onSubmit={materialForm.handleSubmit(handleMaterialSubmit)}>
                        <DialogHeader><DialogTitle className="font-bold text-5xl tracking-tight mb-4">Add <span className="text-primary">Material</span></DialogTitle></DialogHeader>
                        <div className="grid gap-8 py-10">
                            <FormField control={materialForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Title</FormLabel><FormControl><Input placeholder="Material Title..." {...field} className="h-16 border-4 border-primary/10 rounded-2xl font-bold text-xl px-6 focus:border-primary shadow-inner transition-all" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-6">
                              <FormField control={materialForm.control} name="type" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Category</FormLabel><FormControl><select {...field} className="w-full h-16 border-4 border-primary/10 rounded-2xl bg-background font-bold uppercase text-xs px-6 focus:border-primary shadow-inner"><option value="Notes">Class Notes</option><option value="Practicals">Practical Work</option><option value="PYQ">Old papers</option></select></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={materialForm.control} name="contentType" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Type</FormLabel><FormControl><select {...field} className="w-full h-16 border-4 border-primary/10 rounded-2xl bg-background font-bold uppercase text-xs px-6 focus:border-primary shadow-inner"><option value="link">Website Link</option><option value="text">Text Content</option></select></FormControl><FormMessage /></FormItem>
                              )}/>
                            </div>
                            <FormField control={materialForm.control} name="content" render={({ field }) => (
                                <FormItem><FormLabel className="text-[11px] font-bold uppercase tracking-widest text-primary/60">{materialForm.watch('contentType') === 'link' ? 'URL Link' : 'Content'}</FormLabel><FormControl>
                                    {materialForm.watch('contentType') === 'link' ? <Input {...field} placeholder="https://..." className="h-16 border-4 border-primary/10 rounded-2xl font-bold text-lg px-6 shadow-inner"/> : <Textarea {...field} placeholder="Type your notes here..." rows={10} className="border-4 border-primary/10 font-medium rounded-[2rem] p-8 text-lg focus:border-primary shadow-inner"/>}
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={materialForm.control} name="isPublic" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-3xl border-4 border-primary/5 p-6 bg-primary/[0.02] hover:bg-primary/[0.05] transition-all cursor-pointer">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 border-2" /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel className="font-bold uppercase text-[11px] tracking-widest">Share publicly</FormLabel><p className="text-[10px] text-muted-foreground font-medium uppercase opacity-60">Help students everywhere.</p></div></FormItem>
                                )}/>

                                {isTeacher && (
                                    <FormField control={materialForm.control} name="isBroadcast" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-3xl border-4 border-emerald-500/10 p-6 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] transition-all cursor-pointer">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 border-emerald-500 data-[state=checked]:bg-emerald-500" /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-bold uppercase text-[11px] tracking-widest text-emerald-600">Send to Class</FormLabel>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase opacity-60">Share with students in your class.</p>
                                        </div></FormItem>
                                    )}/>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="gap-4 pt-10">
                          <Button type="button" variant="ghost" onClick={() => setMaterialModalOpen(false)} className="font-bold text-[12px] uppercase tracking-widest h-16 px-10">Cancel</Button>
                          <Button type="submit" disabled={materialForm.formState.isSubmitting} className="h-16 px-12 rounded-[2rem] font-bold uppercase text-[12px] tracking-widest shadow-xl transition-all">Save Material</Button>
                        </DialogFooter>
                    </form></Form></DialogContent>
        </Dialog>
    </div>
  );
}
