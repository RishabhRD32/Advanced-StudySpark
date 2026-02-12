"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useClassStudents } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyClassPage() {
  const { userProfile } = useAuth();
  const { students, loading } = useClassStudents(userProfile?.ccCode);

  if (userProfile?.profession !== 'teacher') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-black uppercase">Not Authorized</h2>
          <p className="text-muted-foreground font-medium">This page is for teachers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-primary/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Class Hub</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">My <span className="text-primary">Students</span></h1>
          <p className="text-muted-foreground font-bold italic opacity-80">Connected via Code: <span className="text-primary not-italic font-black">{userProfile.ccCode}</span></p>
        </div>
        <div className="bg-primary/5 px-6 py-4 rounded-2xl border-2 border-primary/10 backdrop-blur-xl">
           <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Class Size</div>
           <div className="text-3xl font-black text-primary tabular-nums">{students.length}</div>
        </div>
      </div>

      <Card className="border-2 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-2xl rounded-[2.5rem]">
        <CardHeader className="bg-primary/5 border-b p-8">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Student Roster</CardTitle>
          <CardDescription className="font-medium text-muted-foreground">List of all students linked to your CC Code.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-8 py-6 font-black uppercase text-[10px] tracking-widest">Student</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Class</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Division</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                    <TableHead className="pr-8 text-right font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.uid} className="hover:bg-primary/[0.03] border-none group transition-all">
                      <TableCell className="pl-8 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary transition-colors">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <GraduationCap className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-lg leading-none mb-1 group-hover:text-primary transition-colors">{student.firstName} {student.lastName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{student.collegeName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-black uppercase text-[10px] border-2 px-3 py-1">
                          {student.className || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-bold text-muted-foreground">
                          < GraduationCap className="h-4 w-4 opacity-40" />
                          {student.division || 'General'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Mail className="h-4 w-4 text-primary opacity-40" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-32 text-center space-y-4">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
              <p className="text-xl font-black uppercase text-muted-foreground tracking-widest">No Students Found</p>
              <p className="text-sm font-medium text-muted-foreground/60">Students must use your CC Code: {userProfile?.ccCode}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
