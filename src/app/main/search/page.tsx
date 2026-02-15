"use client";

import { useSearchParams } from "next/navigation";
import { useSubjects, usePublicMaterials } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search as SearchIcon, 
  BrainCircuit, 
  ScrollText, 
  FileQuestion, 
  Presentation, 
  Gamepad2, 
  Book, 
  ArrowRight,
  Zap,
  Quote,
  GraduationCap,
  ArrowRightLeft,
  ScanText,
  Puzzle,
  Globe
} from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

const APP_TOOLS = [
  { href: "/main/unit-converter", label: "Unit Converter", icon: <ArrowRightLeft className="h-5 w-5" />, description: "Quick scientific and math converter." },
  { href: "/main/gpa-calculator", label: "GPA Tracking", icon: <GraduationCap className="h-5 w-5" />, description: "Calculate your performance." },
  { href: "/main/citation-generator", label: "Citation Pro", icon: <Quote className="h-5 w-5" />, description: "Format academic references." },
  { href: "/main/reading-analytics", label: "Reading Stats", icon: <ScanText className="h-5 w-5" />, description: "Check reading levels and speed." },
  { href: "/main/cloze-master", label: "Memory Fill", icon: <Puzzle className="h-5 w-5" />, description: "Fill in the gaps memory test." },
  { href: "/main/ai-tutor", label: "AI Tutor", icon: <BrainCircuit className="h-5 w-5" />, description: "Get help with your study notes." },
  { href: "/main/ai-summarizer", label: "Summarizer", icon: <ScrollText className="h-5 w-5" />, description: "Shorten long notes instantly." },
  { href: "/main/quiz-generator", label: "Practice Quiz", icon: <FileQuestion className="h-5 w-5" />, description: "Test your knowledge." },
  { href: "/main/lesson-planner", label: "Lesson Planner", icon: <Presentation className="h-5 w-5" />, description: "Design a study schedule." },
  { href: "/main/playworld", label: "Break Hub", icon: <Gamepad2 className="h-5 w-5" />, description: "Take a break with games." },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { materials, loading: materialsLoading } = usePublicMaterials(query);

  const filteredTools = APP_TOOLS.filter(tool => 
    tool.label.toLowerCase().includes(query.toLowerCase()) || 
    tool.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSubjects = subjects.filter(subject => 
    subject.title.toLowerCase().includes(query.toLowerCase()) ||
    subject.instructor.toLowerCase().includes(query.toLowerCase())
  );

  const noResults = filteredTools.length === 0 && filteredSubjects.length === 0 && materials.length === 0;

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <SearchIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Search Results</h1>
        <p className="text-xl text-muted-foreground font-bold">
          Found matches for "<span className="text-primary">{query}</span>"
        </p>
      </div>

      {noResults && !subjectsLoading && !materialsLoading ? (
        <div className="py-32 text-center opacity-30 flex flex-col items-center gap-6 border-4 border-dashed rounded-[4rem]">
          <Zap className="h-20 w-20" />
          <div>
            <p className="text-3xl font-black uppercase tracking-widest">No Matches</p>
            <p className="text-xl font-bold mt-2">Try simpler words.</p>
          </div>
          <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-4 font-black uppercase tracking-widest">
            <Link href="/main/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-16">
          {/* APP TOOLS SECTION */}
          {filteredTools.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-8 w-8 bg-amber-500/10 rounded-xl flex items-center justify-center border-2 border-amber-500/20">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">Study Tools</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <Card key={tool.href} className="glass-card hover:border-amber-500/30 group">
                    <CardHeader className="bg-amber-500/5 border-b p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                          {tool.icon}
                        </div>
                        <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest border-2">Tool</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
                        {tool.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-muted-foreground font-medium mb-6">{tool.description}</p>
                      <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700">
                        <Link href={tool.href}>Open Tool <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* SUBJECTS SECTION */}
          {filteredSubjects.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-8 w-8 bg-blue-500/10 rounded-xl flex items-center justify-center border-2 border-blue-500/20">
                  <Book className="h-4 w-4 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">My Subjects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <Card key={subject.id} className="glass-card hover:border-blue-500/30 group">
                    <CardHeader className="bg-blue-500/5 border-b p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <Book className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest border-2">Course</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                        {subject.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-muted-foreground font-medium mb-6">Instructor: {subject.instructor}</p>
                      <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-widest">
                        <Link href={`/main/subjects/${subject.id}`}>View Course <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* PUBLIC LIBRARY SECTION */}
          {materials.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-8 w-8 bg-emerald-500/10 rounded-xl flex items-center justify-center border-2 border-emerald-500/20">
                   <Globe className="h-4 w-4 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">Library Results</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <Card key={material.id} className="glass-card hover:border-emerald-500/30 group">
                    <CardHeader className="bg-emerald-500/5 border-b p-8">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest border-2">Notes</Badge>
                        <Globe className="h-4 w-4 text-emerald-500/40" />
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                        {material.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-muted-foreground font-medium mb-6">Subject: {material.subjectTitle}</p>
                      <Button asChild variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest border-2">
                        <Link href="/main/library">Open in Library <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Zap className="h-12 w-12 text-primary animate-bolt fill-primary/20" />
          <p className="text-sm text-muted-foreground animate-pulse font-black tracking-[0.3em] uppercase">Scanning Database...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
