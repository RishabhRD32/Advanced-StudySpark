"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useAnnouncements } from "@/hooks/use-firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Plus, Trash2, Calendar, User, Zap, Lock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function AnnouncementsPage() {
  const { userProfile } = useAuth();
  const { announcements, loading, addAnnouncement, deleteAnnouncement } = useAnnouncements(userProfile?.ccCode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isTeacher = userProfile?.profession === 'teacher';

  if (userProfile?.accessAnnouncements === false) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 opacity-30 animate-in fade-in zoom-in-95 duration-700">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Announcements Blocked</h2>
          <p className="font-medium text-lg max-w-md mx-auto leading-relaxed">
            Broadcast updates are currently disabled in your privacy settings. Enable them in Settings to stay updated with your campus.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-xl border-2 font-bold uppercase tracking-widest">
            <a href="/main/settings">Go to Settings</a>
          </Button>
        </div>
      </div>
    );
  }

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await addAnnouncement(title, content);
      toast({ title: "Success", description: "Announcement broadcasted." });
      setTitle("");
      setContent("");
      setIsModalOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to post." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-primary/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Campus Feed</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Announcements</h1>
          <p className="text-muted-foreground font-bold italic opacity-80">Syncing updates for CC Code: <span className="text-primary not-italic font-black">{userProfile?.ccCode}</span></p>
        </div>
        {isTeacher && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-4 max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">Broadcast Directive</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Heading</p>
                  <Input placeholder="Enter title..." value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 border-2 font-bold rounded-xl" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Message Body</p>
                  <Textarea placeholder="What's the update?" value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="border-2 font-medium rounded-2xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Cancel</Button>
                <Button onClick={handlePost} disabled={isSubmitting} className="h-14 px-10 rounded-xl font-black uppercase tracking-widest shadow-xl">
                  {isSubmitting ? <Zap className="animate-bolt h-5 w-5 fill-primary/20" /> : "Transmit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)
        ) : announcements.length > 0 ? (
          announcements.map((ann) => (
            <Card key={ann.id} className="border-2 shadow-xl hover:border-primary/30 transition-all overflow-hidden bg-card/40 backdrop-blur-xl rounded-[2.5rem] group">
              <CardHeader className="bg-primary/5 border-b p-8 flex flex-row justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">{ann.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> {ann.teacherName}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {ann.createdAt ? format(ann.createdAt.toDate(), "PPP") : "Today"}</div>
                  </div>
                </div>
                {isTeacher && ann.userId === userProfile?.uid && (
                  <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)} className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-32 text-center opacity-30 flex flex-col items-center gap-4">
            <Megaphone className="h-20 w-20 stroke-1" />
            <div>
              <p className="text-2xl font-black uppercase tracking-widest">Quiet Campus</p>
              <p className="font-bold">No announcements have been logged recently.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
