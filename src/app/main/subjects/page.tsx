
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, PlusCircle, Loader2, Edit, Trash2, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSubjects } from "@/hooks/use-firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth/use-auth";
import type { Subject } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const subjectSchema = z.object({
  title: z.string().min(1, "Name is required"),
  instructor: z.string().min(1, "Teacher's name is required"),
});

export default function SubjectsPage() {
  const { user } = useAuth();
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { title: "", instructor: "" },
  });

  const handleOpenModal = (subject: Subject | null = null) => {
    setEditingSubject(subject);
    if (subject) {
      form.reset({ title: subject.title, instructor: subject.instructor });
    } else {
      form.reset({ title: "", instructor: "" });
    }
    setIsModalOpen(true);
  };
  
  const onSubmit = async (values: z.infer<typeof subjectSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        updateSubject(editingSubject.id, values);
        toast({ title: "Success", description: "Subject updated." });
      } else {
        addSubject({ ...values });
        toast({ title: "Success", description: "Subject added." });
      }
      setIsModalOpen(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not save subject." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (subjectId: string) => {
      try {
          await deleteSubject(subjectId);
          toast({ title: "Success", description: "Subject deleted." });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not delete subject. Check your connection or permissions." });
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your Subjects</h1>
          <p className="text-muted-foreground font-medium">Manage your subjects here.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="font-bold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="group hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="hover:text-primary transition-colors leading-tight font-black">
                    <Link href={`/main/subjects/${subject.id}`}>{subject.title}</Link>
                  </CardTitle>
                  <CardDescription className="font-bold uppercase tracking-tighter text-[10px]">{subject.instructor}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenModal(subject)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the subject and all its notes and tasks.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(subject.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Notes & Goals</span>
              </div>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="secondary" className="w-full font-bold">
                    <Link href={`/main/subjects/${subject.id}`}>Study Now</Link>
                 </Button>
            </CardFooter>
          </Card>
        ))}
        </div>
      ) : (
        <Card className="col-span-full flex flex-col items-center justify-center py-20 border-dashed">
            <CardContent className="text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-muted-foreground" /></div>
                <h3 className="text-xl font-black">No Subjects Found</h3>
                <p className="text-muted-foreground mt-2 font-medium">Add your first subject to get started.</p>
                <Button onClick={() => handleOpenModal()} className="mt-6 font-bold" variant="outline">Create Now</Button>
            </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="font-black text-2xl">{editingSubject ? 'Edit' : 'Add New'} Subject</DialogTitle>
                <DialogDescription className="font-medium">Enter your subject information below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Subject Name</FormLabel><FormControl><Input placeholder="e.g. Science" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                 <FormField control={form.control} name="instructor" render={({ field }) => (
                    <FormItem><FormLabel>Teacher's Name</FormLabel><FormControl><Input placeholder="Enter teacher's name" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSubject ? 'Save Changes' : 'Add Subject'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
