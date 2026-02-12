
"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Globe, FileText, Clipboard, Check, Quote, Zap, ArrowDown, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const citationSchema = z.object({
  sourceType: z.enum(['book', 'website', 'journal']),
  style: z.enum(['APA', 'MLA', 'Chicago']),
  author: z.string().min(1, "Author name required"),
  title: z.string().min(1, "Title required"),
  year: z.string().min(4, "Invalid year"),
  publisher: z.string().optional(),
  url: z.string().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
});

type CitationResult = {
  id: string;
  text: string;
  style: string;
};

export default function CitationGeneratorPage() {
  const [results, setResults] = useState<CitationResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof citationSchema>>({
    resolver: zodResolver(citationSchema),
    defaultValues: { 
      sourceType: "book", 
      style: "APA", 
      author: "", 
      title: "", 
      year: new Date().getFullYear().toString(),
      publisher: "",
      url: "",
      journal: "",
      volume: "",
      issue: "",
      pages: ""
    },
  });

  const sourceType = form.watch("sourceType");

  const generateCitation = (values: z.infer<typeof citationSchema>) => {
    let citation = "";
    const { author, title, year, publisher, url, journal, volume, issue, pages, style } = values;

    if (style === 'APA') {
      if (values.sourceType === 'book') {
        citation = `${author}. (${year}). ${title}. ${publisher}.`;
      } else if (values.sourceType === 'website') {
        citation = `${author}. (${year}). ${title}. ${url}`;
      } else {
        citation = `${author}. (${year}). ${title}. ${journal}, ${volume}(${issue}), ${pages}.`;
      }
    } else if (style === 'MLA') {
      if (values.sourceType === 'book') {
        citation = `${author}. ${title}. ${publisher}, ${year}.`;
      } else if (values.sourceType === 'website') {
        citation = `${author}. "${title}." ${year}, ${url}`;
      } else {
        citation = `${author}. "${title}." ${journal}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.`;
      }
    } else { // Chicago
      if (values.sourceType === 'book') {
        citation = `${author}. ${title}. ${publisher}, ${year}.`;
      } else if (values.sourceType === 'website') {
        citation = `${author}. "${title}." Last modified ${year}. ${url}`;
      } else {
        citation = `${author}. "${title}." ${journal} ${volume}, no. ${issue} (${year}): ${pages}.`;
      }
    }

    const newResult = {
      id: Math.random().toString(36).substr(2, 9),
      text: citation,
      style: style
    };

    setResults([newResult, ...results]);
    toast({ title: "Citation Generated", description: "Added to your bibliography list." });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeCitation = (id: string) => {
    setResults(results.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <Quote className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Citation Automator</h1>
        <p className="text-xl text-muted-foreground font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          Generate perfectly formatted academic references using pure logic.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <Card className="border-2 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-8">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Source Logic Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generateCitation)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="sourceType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Medium</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          <SelectItem value="book" className="font-bold py-3"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Book</div></SelectItem>
                          <SelectItem value="website" className="font-bold py-3"><div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Website</div></SelectItem>
                          <SelectItem value="journal" className="font-bold py-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Journal</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="style" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 font-black rounded-2xl bg-background">
                            <SelectValue placeholder="Style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-4">
                          <SelectItem value="APA" className="font-bold py-3">APA (7th Ed)</SelectItem>
                          <SelectItem value="MLA" className="font-bold py-3">MLA (9th Ed)</SelectItem>
                          <SelectItem value="Chicago" className="font-bold py-3">Chicago (Author-Date)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Author(s)</FormLabel>
                      <FormControl><Input placeholder="e.g. Smith, J." className="h-14 border-2 font-bold rounded-2xl bg-background" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</FormLabel>
                      <FormControl><Input placeholder="e.g. 2024" className="h-14 border-2 font-bold rounded-2xl bg-background" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</FormLabel>
                    <FormControl><Input placeholder="Full title of the source" className="h-14 border-2 font-bold rounded-2xl bg-background shadow-inner" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                {sourceType === 'book' && (
                  <FormField control={form.control} name="publisher" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Publisher</FormLabel>
                      <FormControl><Input placeholder="e.g. Oxford Press" className="h-14 border-2 font-bold rounded-2xl bg-background" {...field} /></FormControl>
                    </FormItem>
                  )} />
                )}

                {sourceType === 'website' && (
                  <FormField control={form.control} name="url" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL</FormLabel>
                      <FormControl><Input placeholder="https://..." className="h-14 border-2 font-bold rounded-2xl bg-background" {...field} /></FormControl>
                    </FormItem>
                  )} />
                )}

                {sourceType === 'journal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="journal" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Journal Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Nature" className="h-14 border-2 font-bold rounded-2xl bg-background" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-3 gap-2">
                      <FormField control={form.control} name="volume" render={({ field }) => (
                        <FormItem><FormLabel className="text-[8px] font-black">Vol</FormLabel><FormControl><Input className="h-10 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="issue" render={({ field }) => (
                        <FormItem><FormLabel className="text-[8px] font-black">Issue</FormLabel><FormControl><Input className="h-10 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="pages" render={({ field }) => (
                        <FormItem><FormLabel className="text-[8px] font-black">Pages</FormLabel><FormControl><Input className="h-10 border-2 rounded-xl" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                  <Zap className="mr-3 h-5 w-5 fill-white/20" /> Generate Citation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-primary">Your Bibliography</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{results.length} References</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.map((res) => (
              <Card key={res.id} className="border-2 shadow-lg group hover:border-primary/30 transition-all rounded-[2rem] bg-background">
                <CardContent className="p-8 flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {res.style}
                      </span>
                    </div>
                    <p className="text-xl font-bold leading-relaxed text-foreground italic">{res.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(res.text, res.id)}
                      className="h-12 w-12 rounded-2xl border-2 hover:bg-primary/5 transition-all"
                    >
                      {copiedId === res.id ? <Check className="h-5 w-5 text-emerald-500" /> : <Clipboard className="h-5 w-5" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeCitation(res.id)}
                      className="h-12 w-12 rounded-2xl border-2 text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <div className="h-[250px] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center opacity-20 bg-muted/5">
                <Quote className="h-12 w-12 mb-4" />
                <p className="font-black uppercase tracking-widest">No References Yet</p>
                <p className="text-xs font-bold mt-2">Generated citations will appear here for copying.</p>
                <ArrowDown className="mt-6 h-6 w-6 animate-bounce" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
