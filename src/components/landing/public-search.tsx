
"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen, FileText, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { usePublicMaterials } from "@/hooks/use-firestore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PublicSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { materials, loading } = usePublicMaterials(searchTerm);

  // Determine which materials to display
  // If searching, show all matches. If not searching, respect the showAll toggle (limit to 3 or show all)
  const isSearching = searchTerm.trim().length > 0;
  const displayedMaterials = isSearching || showAll ? materials : materials.slice(0, 3);
  const hasMore = materials.length > 3;

  return (
    <section id="search" className="container py-24 bg-muted/20 overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Search the <span className="text-primary">Library</span>
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          Find notes and helpful resources shared by other students.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12 animate-in fade-in zoom-in-95 duration-1000 delay-200">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search by title or subject (e.g. Physics)..."
            className="w-full h-14 pl-12 text-lg border-2 rounded-2xl shadow-sm focus:border-primary transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex flex-col justify-center items-center gap-4 py-12 text-muted-foreground animate-pulse">
              <Loader2 className="h-10 w-10 animate-spin text-primary"/>
              <span className="font-bold uppercase text-xs tracking-widest">Searching Archive...</span>
           </div>
        ) : displayedMaterials.length > 0 ? (
          displayedMaterials.map((material, idx) => (
            <Card 
              key={material.id} 
              className="border-2 rounded-[2rem] hover:border-primary/20 transition-all duration-500 group overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="bg-primary/5 border-b p-6">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">{material.title}</CardTitle>
                    <BookOpen className="h-5 w-5 text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all" />
                  </div>
                <CardDescription className="font-bold text-xs uppercase tracking-tighter">Subject: {material.subjectTitle}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Shared by {material.uploaderName || "Anonymous"}</p>
                
                {material.contentType === 'link' ? (
                  <Button variant="link" asChild className="p-0 h-auto mt-4 font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <a href={material.content} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" /> Visit Link
                    </a>
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto mt-4 font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <FileText className="mr-2 h-4 w-4" /> View Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[2.5rem] border-4 p-0 overflow-hidden bg-background/95 backdrop-blur-3xl">
                      <DialogHeader className="bg-primary/5 border-b p-8">
                        <DialogTitle className="text-3xl font-black tracking-tight">{material.title}</DialogTitle>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mt-2">Shared Publicly</p>
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
           searchTerm && (
             <div className="col-span-full text-center py-12 opacity-40 animate-in fade-in duration-500">
               <p className="font-bold text-lg">No results found for "{searchTerm}".</p>
               <p className="text-sm">Try using simpler keywords like "Math" or "History".</p>
             </div>
           )
        )}
      </div>

      {!loading && !isSearching && hasMore && (
        <div className="mt-12 text-center animate-in fade-in duration-700">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)} 
            className="h-14 px-10 rounded-2xl border-2 font-bold uppercase tracking-widest hover:bg-primary/5 transition-all shadow-lg"
          >
            {showAll ? (
              <><ChevronUp className="mr-2 h-5 w-5" /> Show Less</>
            ) : (
              <><ChevronDown className="mr-2 h-5 w-5" /> View All Notes</>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
