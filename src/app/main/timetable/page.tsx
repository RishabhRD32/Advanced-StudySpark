
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimetableGrid } from "./components/timetable-grid";
import { ExamTimetable } from "./components/exam-timetable";
import type { TimetableType } from "@/lib/types";
import { Calendar, Zap, BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState<TimetableType>("lecture");
  const { user, userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const isTeacher = userProfile?.profession === 'teacher';

  if (userProfile?.accessTimetable === false) {
    return (
      <div className="flex items-center justify-center h-[60vh] px-4">
        <div className="text-center space-y-4 opacity-30 animate-in fade-in zoom-in-95 duration-700">
          <Lock className="h-12 md:h-16 w-12 md:w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Schedule Access Blocked</h2>
          <p className="font-medium text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Academic schedule is disabled in settings. Enable it to manage lectures and exams.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl border-2 font-bold uppercase tracking-widest">
            <a href="/main/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleSharing = async (val: boolean) => {
    if (!user) return;
    
    try {
      await updateUserProfile({ shareTimetable: val });
      const entriesRef = collection(db, 'timetableEntries');
      const q = query(entriesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { 
            isShared: val, 
            ccCode: userProfile?.ccCode || '' 
          });
        });
        await batch.commit();
      }

      toast({
        title: val ? "Schedule Broadcasted" : "Schedule Private",
        description: val 
          ? `Entries visible to students with code ${userProfile?.ccCode}.` 
          : "Your schedule is now hidden.",
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sync sharing status." });
    }
  };

  return (
    <div className="space-y-10 md:space-y-12 max-w-6xl mx-auto pb-24 px-2 md:px-4 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b-4 border-primary/5 pb-10">
        <div className="text-center md:text-left space-y-2 w-full md:w-auto">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Calendar className="h-5 md:h-6 w-5 md:w-6 text-primary" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary/60">Weekly Plan</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground">My Schedule</h1>
          <p className="text-base md:text-lg text-muted-foreground font-bold italic opacity-60">Personal study blocks and exam dates.</p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-6 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-primary/5 border-4 border-primary/10 shadow-inner group transition-all hover:border-primary/30 w-full md:w-auto justify-between md:justify-start">
            <div className="space-y-0.5 text-left md:text-right">
              <Label className="text-xs md:text-sm font-black uppercase tracking-widest text-primary">Broadcast Grid</Label>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60">Code: {userProfile?.ccCode}</p>
            </div>
            <Switch 
              checked={userProfile?.shareTimetable ?? false} 
              onCheckedChange={handleToggleSharing}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto scrollbar-hide pb-4">
          <TabsList className="w-full max-w-2xl h-20 md:h-24 bg-background/90 border-4 border-primary/10 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 backdrop-blur-xl">
            <TabsTrigger 
              value="lecture" 
              className={cn(
                "flex-1 h-full gap-2 md:gap-3 transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] px-4 md:px-6",
                "data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl",
                "text-sm font-black uppercase tracking-widest"
              )}
            >
              <Zap className={cn("h-5 w-5", activeTab === 'lecture' ? "text-white" : "text-blue-600")} />
              <span className="hidden sm:inline">Timetable</span>
              <span className="sm:hidden text-[10px]">Grid</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="written_exam" 
              className={cn(
                "flex-1 h-full gap-2 md:gap-3 transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] px-4 md:px-6",
                "data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-xl",
                "text-sm font-black uppercase tracking-widest"
              )}
            >
              <BookOpen className={cn("h-5 w-5", activeTab === 'written_exam' ? "text-white" : "text-amber-600")} />
              <span className="hidden sm:inline">Theory</span>
              <span className="sm:hidden text-[10px]">Theory</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="practical_exam" 
              className={cn(
                "flex-1 h-full gap-2 md:gap-3 transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] px-4 md:px-6",
                "data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-xl",
                "text-sm font-black uppercase tracking-widest"
              )}
            >
              <Zap className={cn("h-5 w-5", activeTab === 'practical_exam' ? "text-white" : "text-emerald-600")} />
              <span className="hidden sm:inline">Practical</span>
              <span className="sm:hidden text-[10px]">Lab</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lecture">
          <TimetableGrid type="lecture" title="Daily Grid" description="Personal class and study hours." />
        </TabsContent>
        <TabsContent value="written_exam">
            <ExamTimetable type="written_exam" title="Theory Exams" description="Upcoming written test dates." />
        </TabsContent>
        <TabsContent value="practical_exam">
            <ExamTimetable type="practical_exam" title="Practical Evalu" description="Hands-on performance tests." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
