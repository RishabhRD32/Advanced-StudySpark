"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/lib/auth/use-auth";
import { useChat } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Loader2, Zap, GraduationCap, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export default function TeacherChatWindowPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Student Details
  useEffect(() => {
    async function fetchStudent() {
      if (!studentId) return;
      try {
        const docRef = doc(db, 'users', studentId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStudent({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error("Error fetching student:", e);
      } finally {
        setLoadingStudent(false);
      }
    }
    fetchStudent();
  }, [studentId]);

  // 2. Setup Chat Hook
  const teacherUid = user?.uid || "";
  const { messages, loading: messagesLoading, sendMessage } = useChat(studentId, teacherUid);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !student) return;

    const chatRoomData = {
      ccCode: userProfile?.ccCode || '',
      studentUid: student.id,
      teacherUid: user.uid,
      studentName: `${student.firstName} ${student.lastName}`,
      teacherName: `${userProfile?.firstName} ${userProfile?.lastName}`,
    };

    try {
      await sendMessage(inputText, user.uid, chatRoomData);
      setInputText("");
    } catch (error) {
      console.error("Send failed:", error);
    }
  };

  if (loadingStudent) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-40 opacity-20"><Zap className="h-20 w-20 mx-auto" /><h2 className="text-3xl font-black uppercase">Connection Lost</h2></div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-6">
      {/* HEADER */}
      <Card className="border-4 shadow-xl rounded-[2.5rem] bg-card/40 backdrop-blur-xl overflow-hidden shrink-0">
        <CardHeader className="bg-primary/5 p-6 flex flex-row items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 hover:bg-primary/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg">
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
              <GraduationCap className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-black tracking-tight">{student.firstName} {student.lastName}</CardTitle>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{student.className} • {student.division || 'General'}</p>
          </div>
        </CardHeader>
      </Card>

      {/* MESSAGES */}
      <Card className="flex-1 border-4 shadow-2xl rounded-[3rem] bg-background/50 backdrop-blur-md overflow-hidden flex flex-col relative">
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6">
            {messages.map((msg, i) => {
              const isMe = msg.senderUid === user?.uid;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] px-6 py-4 rounded-[2rem] shadow-sm relative group",
                    isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 border-2 rounded-tl-none"
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
              placeholder="Type your response..."
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
