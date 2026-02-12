"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Feedback } from "@/lib/types";
import { Loader2, Zap, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  feedback: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
});

export function FeedbackSection() {
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { name: "", feedback: "" },
  });

  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
    });
    return () => unsubscribe();
  }, []);

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    setIsLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Your message has been sent!" });
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="feedback" className="container py-24 overflow-hidden">
      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          What Students <span className="text-primary">Say</span>
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          Hear from students who are already using StudySpark.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-primary font-bold uppercase text-xs tracking-widest mb-4 animate-in fade-in slide-in-from-left-4 duration-1000">
            <MessageSquare className="h-4 w-4" /> Latest Feedback
          </div>
          <div className="space-y-6">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((fb, idx) => (
                <Card 
                  key={fb.id} 
                  className={cn(
                    "border-2 rounded-[2rem] bg-card shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-left-10 fill-mode-both",
                  )}
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold">{fb.name}</CardTitle>
                    <CardDescription className="font-semibold text-xs uppercase text-primary/60">
                      {fb.createdAt ? new Date(fb.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-lg font-medium italic text-foreground/80 leading-relaxed">"{fb.feedback}"</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-30 animate-pulse">
                <p className="font-bold uppercase tracking-widest text-sm">No notes yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
          <div className="text-primary font-bold uppercase text-xs tracking-widest mb-4">Send us a Note</div>
          <Card className="border-2 rounded-[2.5rem] bg-muted/30 shadow-lg p-4 hover:shadow-2xl transition-shadow duration-500">
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold">Leave a Review</CardTitle>
              <CardDescription className="font-medium">Tell us what you think!</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-widest text-primary">Your Name</FormLabel>
                      <FormControl><Input placeholder="Enter your name" {...field} className="h-12 border-2 rounded-xl bg-background font-bold transition-all focus:border-primary" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="feedback" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-widest text-primary">Your Feedback</FormLabel>
                      <FormControl><Textarea placeholder="What do you love about StudySpark?" {...field} rows={5} className="border-2 rounded-2xl bg-background font-medium resize-none p-4 transition-all focus:border-primary" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isLoading} className="w-full h-14 text-base font-bold uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />} Send Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
