
"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useClassStudents, useAnnouncements, useSubjects } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Megaphone, BookOpen, Settings2, ArrowRight, Zap, GraduationCap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageHubPage() {
  const { userProfile } = useAuth();
  const { students, loading: studentsLoading } = useClassStudents(userProfile?.ccCode);
  const { announcements, loading: annLoading } = useAnnouncements(userProfile?.ccCode);
  const { subjects, loading: subjectsLoading } = useSubjects();

  if (userProfile?.profession !== 'teacher') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Settings2 className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-black uppercase">Unauthorized Access</h2>
          <p className="text-muted-foreground font-medium">This hub is restricted to Faculty logins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-2 border-primary/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Operational Center</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter">Manage <span className="text-primary">Hub</span></h1>
          <p className="text-xl text-muted-foreground font-bold italic opacity-80">Command your classroom data and resources.</p>
        </div>
        <div className="bg-primary/5 px-10 py-6 rounded-[2.5rem] border-2 border-primary/10 backdrop-blur-xl shadow-inner group hover:border-primary/20 transition-all">
           <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1 text-center">Institutional CC Code</div>
           <div className="text-5xl font-black text-primary tracking-tighter text-center uppercase">{userProfile.ccCode}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl group hover:scale-[1.02] transition-all overflow-hidden relative rounded-[2.5rem] h-56">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Users className="h-32 w-32 rotate-12" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Students</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {studentsLoading ? <Skeleton className="h-16 w-24 bg-white/20" /> : <div className="text-8xl font-black tabular-nums tracking-tighter">{students.length}</div>}
            <Button asChild variant="link" className="text-white font-black p-0 mt-2 justify-start h-auto">
              <Link href="/main/my-class">View Roster <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg bg-card/40 backdrop-blur-md rounded-[2.5rem] h-56 group hover:border-primary/30 transition-all relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-primary absolute top-6 right-6" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {subjectsLoading ? <Skeleton className="h-16 w-24" /> : <div className="text-8xl font-black text-primary tabular-nums tracking-tighter">{subjects.length}</div>}
            <Button asChild variant="link" className="text-primary font-black p-0 mt-2 justify-start h-auto">
              <Link href="/main/subjects">Manage Curriculum <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg bg-card/40 backdrop-blur-md rounded-[2.5rem] h-56 group hover:border-emerald-400/30 transition-all relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Posts</CardTitle>
            <Megaphone className="h-4 w-4 text-emerald-500 absolute top-6 right-6" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-32">
            {annLoading ? <Skeleton className="h-16 w-24" /> : <div className="text-8xl font-black text-emerald-500 tabular-nums tracking-tighter">{announcements.length}</div>}
            <Button asChild variant="link" className="text-emerald-600 font-black p-0 mt-2 justify-start h-auto">
              <Link href="/main/announcements">Manage Broadcasts <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-2xl border-2 overflow-hidden bg-card/20 backdrop-blur-2xl rounded-[3rem]">
          <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b py-8 px-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Class Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sync Health</p>
                <p className="text-2xl font-black">All Systems Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
                <Zap className="h-8 w-8 text-emerald-500 fill-emerald-500/20" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Response Logic</p>
                <p className="text-2xl font-black">AI Tutor Fully Calibrated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-2 overflow-hidden bg-card/20 backdrop-blur-2xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
           <Settings2 className="h-20 w-20 text-primary opacity-20" />
           <div className="space-y-2">
             <h3 className="text-3xl font-black tracking-tighter">Strategic Config</h3>
             <p className="text-muted-foreground font-medium max-w-sm">Use this hub to ensure your institutional CC Code is active and shared with your students.</p>
           </div>
           <Button variant="outline" className="h-14 border-2 rounded-2xl font-black uppercase tracking-widest px-10 hover:bg-primary/5 transition-all">
             Audit Institutional Access
           </Button>
        </Card>
      </div>
    </div>
  );
}
