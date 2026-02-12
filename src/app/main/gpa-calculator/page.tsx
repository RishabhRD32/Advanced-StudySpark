
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Plus, Trash2, Zap, TrendingUp, Trophy, GraduationCap, X, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useSubjects } from '@/hooks/use-firestore';

type Semester = {
  id: string;
  name: string;
  courses: { id: string; name: string; credits: number; grade: number }[];
};

export default function GPACalculatorPage() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', courses: [{ id: 'c1', name: '', credits: 3, grade: 4.0 }] }
  ]);
  const { toast } = useToast();

  const handleSyncSubjects = () => {
    if (subjects.length === 0) {
      toast({ title: "No Subjects", description: "Add subjects in the 'My Subjects' tab first." });
      return;
    }

    const syncedCourses = subjects.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      name: s.title,
      credits: 3,
      grade: 4.0
    }));

    setSemesters(prev => {
      const updated = [...prev];
      // Append to the first semester or create a "Synced" semester
      updated[0].courses = [...updated[0].courses.filter(c => c.name !== ""), ...syncedCourses];
      return updated;
    });

    toast({ title: "Subjects Synced", description: `Added ${subjects.length} courses to Semester 1.` });
  };

  const addSemester = () => {
    const newSem: Semester = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Semester ${semesters.length + 1}`,
      courses: [{ id: Math.random().toString(36).substr(2, 9), name: '', credits: 3, grade: 4.0 }]
    };
    setSemesters([...semesters, newSem]);
  };

  const addCourse = (semId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return {
          ...s,
          courses: [...s.courses, { id: Math.random().toString(36).substr(2, 9), name: '', credits: 3, grade: 4.0 }]
        };
      }
      return s;
    }));
  };

  const updateCourse = (semId: string, courseId: string, field: string, value: any) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return {
          ...s,
          courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
        };
      }
      return s;
    }));
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
      }
      return s;
    }));
  };

  const removeSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const calculateGPA = (courses: Semester['courses']) => {
    const totalCredits = courses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);
    if (totalCredits === 0) return 0;
    const weightedSum = courses.reduce((acc, c) => acc + ((Number(c.grade) || 0) * (Number(c.credits) || 0)), 0);
    return (weightedSum / totalCredits).toFixed(2);
  };

  const calculateCGPA = () => {
    const allCourses = semesters.flatMap(s => s.courses);
    return calculateGPA(allCourses);
  };

  const totalCredits = semesters.flatMap(s => s.courses).reduce((acc, c) => acc + (Number(c.credits) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">GPA Calculator</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Track your cumulative performance with algorithmic weighted credit analysis.
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleSyncSubjects} 
          disabled={subjectsLoading}
          className="h-12 border-4 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-primary/5 transition-all shadow-lg"
        >
          {subjectsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync My Subjects
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {semesters.map((sem, sIdx) => (
            <Card key={sem.id} className="border-2 shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group">
              <CardHeader className="bg-primary/5 border-b py-6 px-10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border-2 border-primary/10 shadow-sm">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <Input 
                    value={sem.name} 
                    onChange={e => {
                      const updated = [...semesters]; updated[sIdx].name = e.target.value; setSemesters(updated);
                    }}
                    className="h-10 border-none bg-transparent font-black uppercase tracking-widest text-lg p-0 focus-visible:ring-0 w-40"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-black border-2 px-4 h-8 bg-background">GPA: {calculateGPA(sem.courses)}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeSemester(sem.id)} className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="grid grid-cols-12 gap-4 px-2 hidden md:grid">
                  <div className="col-span-6 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Course Name</div>
                  <div className="col-span-3 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest text-center">Credits</div>
                  <div className="col-span-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest text-center">Grade (4.0)</div>
                  <div className="col-span-1"></div>
                </div>
                
                {sem.courses.map((course, cIdx) => (
                  <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-in slide-in-from-left-4 duration-300">
                    <div className="md:col-span-6">
                      <Input 
                        placeholder="Course Name" 
                        value={course.name}
                        onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)}
                        className="h-12 border-2 rounded-xl font-bold"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input 
                        type="number" 
                        placeholder="Credits" 
                        value={course.credits}
                        onChange={e => updateCourse(sem.id, course.id, 'credits', e.target.value)}
                        className="h-12 border-2 rounded-xl font-black text-center"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Grade" 
                        value={course.grade}
                        onChange={e => updateCourse(sem.id, course.id, 'grade', e.target.value)}
                        className="h-12 border-2 rounded-xl font-black text-center text-primary"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <Button variant="ghost" size="icon" onClick={() => removeCourse(sem.id, course.id)} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  onClick={() => addCourse(sem.id)} 
                  className="w-full h-12 mt-4 rounded-xl border-2 border-dashed font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Subject to {sem.name}
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addSemester} className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all bg-background text-primary border-4 border-primary/10">
            <Plus className="mr-3 h-6 w-6" /> Add New Semester Block
          </Button>
        </div>

        <div className="space-y-8">
          <Card className="border-4 border-primary shadow-2xl bg-primary text-primary-foreground rounded-[3rem] sticky top-32 overflow-hidden group">
            <Zap className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700" />
            <CardHeader className="pt-10 px-10">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">Master Metric</CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
              <div className="space-y-2">
                <div className="text-[100px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                  {calculateCGPA()}
                </div>
                <p className="text-sm font-black uppercase tracking-widest opacity-80">Cumulative CGPA</p>
              </div>

              <div className="w-full pt-8 border-t border-white/20 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Credits Earned</span>
                  <span className="text-2xl font-black">{totalCredits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Academic Standing</span>
                  <Badge variant="outline" className="bg-white/10 border-white/20 font-black uppercase text-[10px] py-1 px-4 text-white">
                    {Number(calculateCGPA()) >= 3.5 ? 'Elite' : Number(calculateCGPA()) >= 3.0 ? 'Merit' : 'Standard'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/10 border-white/20 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-primary transition-all">
                  <Trophy className="mr-2 h-4 w-4" /> Save Scorecard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed bg-muted/10 rounded-[2.5rem] p-8 text-center space-y-4">
            <Calculator className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-widest">
              Our algorithm uses the standard weighted credit system. Credits determine the weight of each course in your overall average.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
