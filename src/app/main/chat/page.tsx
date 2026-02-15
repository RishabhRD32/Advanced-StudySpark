
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/lib/auth/use-auth";
import { useChat } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Loader2, Zap, UserCheck, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StudentChatPage() {
  const { user, userProfile } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Find all teachers for the student's CC code
  useEffect(() => {
    async function findFaculty() {
      if (!userProfile?.ccCode) {
        setLoadingFaculty(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'users'),
          where('profession', '==', 'teacher'),
          where('ccCode', '==', userProfile.ccCode)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTeachers(list);
        if (list.length === 1) {
          setSelectedTeacher(list[0]);
        }
      } catch (e) {
        console.error("Error finding faculty:", e);
      } finally {
        setLoadingFaculty(false);
      }
    }
    findFaculty();
  }, [userProfile?.ccCode]);

  // 2. Setup Chat Hook (only when teacher is selected)
  const studentUid = user?.uid || "";
  const teacherUid = selectedTeacher?.id || "";
  const { messages, loading: messagesLoading, sendMessage } = useChat(studentUid, teacherUid);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !selectedTeacher) return;

    const chatRoomData = {
      ccCode: userProfile?.ccCode || '',
      studentUid: user.uid,
      teacherUid: selectedTeacher.id,
      studentName: `${userProfile?.firstName} ${userProfile?.lastName}`,
      teacherName: `${selectedTeacher.firstName} ${selectedTeacher.lastName}`,
    };

    try {
      await sendMessage(inputText, user.uid, chatRoomData);
      setInputText("");
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  if (loadingFaculty) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 3. SELECTION SCREEN: If multiple teachers or none selected
  if (!selectedTeacher && teachers.length > 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Faculty Hub</h1>
          <p className="text-xl text-muted-foreground font-bold opacity-60">Multiple faculty members share Class Code: <span className="text-primary">{userProfile?.ccCode}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teachers.map((t) => (
            <Card key={t.id} className="border-4 shadow-lg hover:border-primary/40 hover:scale-[1.02] transition-all cursor-pointer bg-card/40 backdrop-blur-xl rounded-[2.5rem] group overflow-hidden" onClick={() => setSelectedTeacher(t)}>
              <CardContent className="p-8 flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-xl">
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                    {t.firstName?.[0]}{t.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">{t.firstName} {t.lastName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2">Institutional Faculty</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <ChevronRight className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 4. EMPTY STATE: No teachers found
  if (teachers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-6 opacity-30">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto border-4 border-dashed">
          <UserCheck className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">No Teacher Found</h2>
          <p className="font-bold text-lg max-w-sm mx-auto">
            You are currently not linked to an active teacher for Class Code: <span className="text-primary font-black">{userProfile?.ccCode || 'None'}</span>
          </p>
        </div>
      </div>
    );
  }

  // 5. CHAT INTERFACE
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <Card className="border-4 shadow-xl rounded-[2.5rem] bg-card/40 backdrop-blur-xl overflow-hidden shrink-0">
        <CardHeader className="bg-primary/5 p-6 flex flex-row items-center gap-6">
          {teachers.length > 1 && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedTeacher(null)} className="rounded-xl h-10 w-10 hover:bg-primary/10 border-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg">
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
              {selectedTeacher.firstName?.[0]}{selectedTeacher.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-black tracking-tight">{selectedTeacher.firstName} {selectedTeacher.lastName}</CardTitle>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Faculty Hub • {userProfile?.ccCode}</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Zap className="h-5 w-5 text-primary animate-bolt fill-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Active Sync</span>
          </div>
        </CardHeader>
      </Card>

      {/* MESSAGES */}
      <Card className="flex-1 border-4 shadow-2xl rounded-[3rem] bg-background/50 backdrop-blur-md overflow-hidden flex flex-col relative">
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6">
            {messages.length === 0 && !messagesLoading && (
              <div className="py-20 text-center opacity-20">
                <MessageSquare className="h-16 w-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">Ask {selectedTeacher.firstName} a doubt.</p>
              </div>
            )}
            
            {messages.map((msg, i) => {
              const isMe = msg.senderUid === user?.uid;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] px-6 py-4 rounded-[2rem] shadow-sm relative group",
                    isMe ? "bg-primary text-primary-foreground rounded-tr-none shadow-[0_10px_25px_-5px_hsla(var(--primary),0.4)]" : "bg-muted/50 border-2 rounded-tl-none"
                  )}>
                    <p className="text-lg font-medium leading-relaxed">{msg.text}</p>
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest mt-2 opacity-40",
                      isMe ? "text-right" : "text-left"
                    )}>
                      {msg.createdAt ? format(msg.createdAt.toDate(), "hh:mm a") : "Sending..."}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* INPUT */}
        <div className="p-6 bg-primary/5 border-t-4 border-primary/5">
          <form onSubmit={handleSend} className="flex gap-4">
            <Input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${selectedTeacher.firstName}...`}
              className="h-16 border-4 border-primary/10 rounded-2xl bg-background font-bold text-xl px-8 focus:border-primary shadow-inner transition-all"
            />
            <Button type="submit" disabled={!inputText.trim()} className="h-16 w-16 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
