
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Link as LinkIcon, FileText, User, BookOpen, Zap } from "lucide-react";
import { usePublicMaterials } from "@/hooks/use-firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { materials, loading } = usePublicMaterials(searchTerm);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Public Library</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto">
          Global knowledge exchange. Help others and learn together.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-all" />
        <Input 
          placeholder="SEARCH GLOBAL ARCHIVE..." 
          className="h-16 pl-16 rounded-[2rem] border-4 border-primary/10 focus:border-primary/40 bg-background text-lg font-black uppercase tracking-widest shadow-2xl transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)
        ) : materials.length > 0 ? (
          materials.map((material) => (
            <Card key={material.id} className="glass-card hover:border-primary/50 group">
              <CardHeader className="bg-primary/5 border-b p-8">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest border-2">
                    {material.type}
                  </Badge>
                  <BookOpen className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {material.title}
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">
                  Subject: {material.subjectTitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase">
                  <User className="h-4 w-4 text-primary/40" />
                  Shared by {material.uploaderName || "Anonymous"}
                </div>
                {material.contentType === 'link' ? (
                  <Button asChild className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                    <a href={material.content} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-5 w-5" /> Visit Link
                    </a>
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                        <FileText className="mr-2 h-5 w-5" /> Read Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[2.5rem] border-4 p-0 overflow-hidden bg-background/95 backdrop-blur-3xl">
                      <DialogHeader className="bg-primary/5 border-b p-8">
                        <DialogTitle className="text-3xl font-black tracking-tight">{material.title}</DialogTitle>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mt-2">Public Shared Material</p>
                      </DialogHeader>
                      <div className="p-8 max-h-[60vh] overflow-y-auto font-medium text-lg leading-relaxed whitespace-pre-wrap">
                        {material.content}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full h-[400px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center opacity-20 px-12 group transition-all hover:opacity-30">
             <div className="h-32 w-32 rounded-[3rem] bg-muted flex items-center justify-center mb-8 border-4 border-muted-foreground/20 group-hover:scale-110 transition-transform">
               <Search className="h-16 w-16" />
             </div>
             <h3 className="text-4xl font-black uppercase tracking-widest">Nothing Found</h3>
             <p className="text-xl font-bold mt-4 max-w-md">Search for keywords like "Physics", "Notes", or "Calculus" to see shared items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
