"use client";

import React from 'react';
import { useAuth } from "@/lib/auth/use-auth";
import { useChatRooms } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ChevronRight, User, Loader2, Zap, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherMessagesInboxPage() {
  const { user, userProfile } = useAuth();
  const { rooms, loading } = useChatRooms(user?.uid || "");

  if (userProfile?.profession !== 'teacher') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 opacity-20">
          <Zap className="h-16 w-16 mx-auto" />
          <h2 className="text-2xl font-black uppercase">Role Restriction</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-primary/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Communication Hub</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic">Student <span className="text-primary">Queries</span></h1>
          <p className="text-xl text-muted-foreground font-bold italic opacity-60">Manage direct doubts and academic communication.</p>
        </div>
        <div className="bg-primary/5 px-8 py-4 rounded-3xl border-2 border-primary/10 shadow-inner">
           <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Active Rooms</div>
           <div className="text-4xl font-black tabular-nums">{rooms.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /></div>
        ) : rooms.length > 0 ? (
          rooms.map((room) => (
            <Link key={room.id} href={`/main/messages/${room.studentUid}`}>
              <Card className="border-4 shadow-lg hover:border-primary/40 hover:scale-[1.01] transition-all cursor-pointer bg-card/40 backdrop-blur-xl rounded-[2.5rem] group overflow-hidden">
                <CardContent className="p-8 flex items-center gap-8">
                  <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-xl group-hover:border-primary/30 transition-all">
                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                      <GraduationCap className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">{room.studentName}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{room.updatedAt ? format(room.updatedAt.toDate(), "MMM dd, hh:mm a") : ""}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-medium text-muted-foreground truncate italic">"{room.lastMessage || 'Sent an attachment'}"</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ChevronRight className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="py-40 text-center space-y-6 opacity-20 border-4 border-dashed rounded-[4rem]">
            <MessageSquare className="h-24 w-24 mx-auto stroke-1" />
            <div className="space-y-2">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Quiet Channel</h3>
              <p className="text-xl font-bold">Students from Class Code <span className="text-primary uppercase">{userProfile.ccCode}</span> will appear here when they message you.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
