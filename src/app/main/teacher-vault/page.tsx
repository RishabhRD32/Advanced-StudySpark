
"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useBroadcastMaterials } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Download, Link as LinkIcon, FileText, Loader2, Sparkles, UserCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherVaultPage() {
  const { userProfile } = useAuth();
  const { materials, loading } = useBroadcastMaterials(userProfile?.ccCode);

  if (userProfile?.profession !== 'student') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-black uppercase">Restricted Area</h2>
          <p className="text-muted-foreground font-medium">This section is for students to receive teacher files.</p>
        </div>
      </div>
    );
  }

  if (userProfile?.accessTeacherFiles === false) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 opacity-30 animate-in fade-in zoom-in-95 duration-700">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Vault Access Blocked</h2>
          <p className="font-medium text-lg max-w-md mx-auto leading-relaxed">
            Teacher shared files are currently disabled in your privacy settings. Enable them in Settings to receive materials via Class Code.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl border-2 font-bold uppercase tracking-widest">
            <a href="/main/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-4 pb-8 border-b-2 border-primary/5">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase">Teacher's <span className="text-primary">Files</span></h1>
        <p className="text-xl text-muted-foreground font-medium">Helpful study files shared by your teachers.</p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 font-bold text-xs">
          <UserCheck className="h-3.5 w-3.5 text-primary" />
          Class Code: <span className="text-primary font-black ml-1 uppercase">{userProfile.ccCode}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)}
        </div>
      ) : materials.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="border-2 shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/40 backdrop-blur-xl rounded-[2.5rem] group">
              <CardHeader className="bg-primary/5 border-b p-8">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest border-2 px-3">
                    {material.type}
                  </Badge>
                  <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {material.title}
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">
                  Shared by: {material.uploaderName}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {material.contentType === 'link' ? (
                  <Button asChild className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                    <a href={material.content} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-5 w-5" /> Open Resource
                    </a>
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                        <FileText className="mr-2 h-5 w-5" /> View Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[2.5rem] border-4 p-0 overflow-hidden bg-background/95 backdrop-blur-3xl">
                      <DialogHeader className="bg-primary/5 border-b p-8">
                        <DialogTitle className="text-3xl font-black tracking-tight">{material.title}</DialogTitle>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mt-2">School Material</p>
                      </DialogHeader>
                      <div className="p-8 max-h-[60vh] overflow-y-auto font-medium text-lg leading-relaxed whitespace-pre-wrap">
                        {material.content}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-[400px] border-4 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center text-center opacity-30 px-10">
           <ShieldCheck className="h-20 w-20 mb-6" />
           <h3 className="text-3xl font-black uppercase tracking-widest">No files yet</h3>
           <p className="text-xl font-bold mt-2">Your teachers haven't shared any materials for this class code yet.</p>
        </div>
      )}
    </div>
  );
}
