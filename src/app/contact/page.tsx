"use client"

import React, { useState } from "react";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Message Sent",
        description: "We have received your message and will get back to you soon.",
      });

      // Clear form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not send your message. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020817] text-white">
      <LandingHeader />
      <main className="flex-1 py-20 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
        
        <div className="container max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-6xl font-bold tracking-tighter">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              Have a question? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="p-8 rounded-[2rem] bg-card/5 backdrop-blur-3xl border-2 border-primary/10 shadow-2xl space-y-4 hover:border-primary/30 transition-all group h-fit">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-primary/20">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-primary/80">Email Us</h3>
                  <p className="text-lg font-bold mt-1">researcherrd32@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="md:col-span-2 border-2 border-primary/10 shadow-2xl bg-card/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                <CardTitle className="text-3xl font-bold tracking-tight">Send a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Your Name</Label>
                      <Input 
                        placeholder="Your full name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 border-2 border-primary/10 bg-[#020817] rounded-xl font-bold focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground/40" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Your Email</Label>
                      <Input 
                        type="email" 
                        placeholder="name@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 border-2 border-primary/10 bg-[#020817] rounded-xl font-bold focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground/40" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Your Message</Label>
                    <Textarea 
                      placeholder="How can we help you today?" 
                      rows={6} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-2 border-primary/10 bg-[#020817] rounded-2xl font-medium p-6 focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground/40" 
                      required 
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-16 text-lg font-bold uppercase tracking-widest shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-white">
                    {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Send className="mr-3 h-5 w-5" />} Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
