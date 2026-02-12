
"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Palette, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  Lock, 
  KeyRound, 
  Calendar, 
  Megaphone, 
  UserCheck, 
  BrainCircuit, 
  Globe, 
  Cpu as CpuIcon,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WEBLLM_MODELS } from "@/hooks/use-web-llm";

const PROVIDERS = [
  { 
    id: "google", 
    label: "Google AI (Gemini)", 
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"] 
  },
  {
    id: "groq",
    label: "Groq (Ultra Fast)",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
  },
  {
    id: "cerebras",
    label: "Cerebras (Instant)",
    models: ["llama-3.3-70b", "llama3.1-70b", "llama3.1-8b"]
  },
  {
    id: "mistral",
    label: "Mistral AI",
    models: ["mistral-large-latest", "pixtral-large-latest", "open-mistral-nemo"]
  },
  {
    id: "openai",
    label: "OpenAI (ChatGPT)",
    models: ["gpt-4o", "gpt-4o-mini"]
  }
];

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password."),
  newPassword: z.string().min(6, "New password must be at least 6 characters.").regex(/[0-9]/, "Include at least one number."),
});

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { updatePasswordDirectly, updateUserProfile, user, userProfile } = useAuth();
    const { toast } = useToast();
    const [feedback, setFeedback] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const georgiaFont = { fontFamily: "Georgia, 'Times New Roman', Times, serif" };

    const form = useForm<z.infer<typeof passwordSchema>>({
      resolver: zodResolver(passwordSchema),
      defaultValues: { currentPassword: "", newPassword: "" },
    });

    const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');

    const handleSendFeedback = () => {
      if (!feedback.trim()) return;
      toast({
        title: "Feedback Sent",
        description: "Thank you for sharing your thoughts with us!",
      });
      setFeedback("");
    };

    const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
      setIsUpdatingPassword(true);
      try {
        await updatePasswordDirectly(values.currentPassword, values.newPassword);
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        form.reset();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message || "Please check your current password.",
        });
      } finally {
        setIsUpdatingPassword(false);
      }
    };

    const handleConfigChange = async (updates: Partial<{ preferredCloudProvider: string, preferredCloudModel: string, preferredWebLLMModel: string }>) => {
      try {
        await updateUserProfile(updates);
        toast({ title: "Hub Updated", description: "Your Intelligence preferences have been synchronized." });
      } catch (e) {
        toast({ variant: "destructive", title: "Sync Error", description: "Failed to save model preference." });
      }
    };

    const selectedProviderId = userProfile?.preferredCloudProvider || "google";
    const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId) || PROVIDERS[0];

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter">Settings</h1>
      </div>

      {/* INTELLIGENCE CORE */}
      <Card className="border-4 shadow-2xl rounded-[3.5rem] overflow-hidden bg-background">
        <CardHeader className="bg-primary/5 border-b-4 border-primary/5 p-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-primary/10">
              <BrainCircuit className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle style={georgiaFont} className="text-3xl font-bold text-primary">Intelligence Core</CardTitle>
              <CardDescription className="font-bold text-muted-foreground mt-1">Configure global AI providers and local neural engines.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-12">
          
          {/* CLOUD CONFIG */}
          <div className="space-y-10">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 border-b-2 border-primary/5 pb-3">
              <Globe className="h-4 w-4" /> Cloud Intelligence Hub
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Active Provider</Label>
                <Select 
                  value={selectedProviderId}
                  onValueChange={(val) => {
                    const newProvider = PROVIDERS.find(p => p.id === val);
                    handleConfigChange({ 
                      preferredCloudProvider: val, 
                      preferredCloudModel: newProvider?.models[0] || "" 
                    });
                  }}
                >
                  <SelectTrigger className="h-16 border-4 rounded-2xl font-black text-lg bg-background hover:border-primary/30 transition-all">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 font-bold bg-background/95 backdrop-blur-xl">
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id} className="py-4 font-bold cursor-pointer rounded-xl">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Specific Model</Label>
                <Select 
                  value={userProfile?.preferredCloudModel || selectedProvider.models[0]}
                  onValueChange={(val) => handleConfigChange({ preferredCloudModel: val })}
                >
                  <SelectTrigger className="h-16 border-4 rounded-2xl font-black text-lg bg-background hover:border-primary/30 transition-all">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 font-bold bg-background/95 backdrop-blur-xl">
                    {selectedProvider.models.map(m => (
                      <SelectItem key={m} value={m} className="py-4 font-bold cursor-pointer rounded-xl">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-primary/5 border-2 border-primary/10">
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                 All providers listed above are now supported via our Direct Bridge. If your primary provider is rate-limited, the system will attempt an emergency rescue via Groq or Cerebras.
               </p>
            </div>
          </div>

          {/* LOCAL CONFIG */}
          <div className="space-y-10">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 border-b-2 border-primary/5 pb-3">
              <CpuIcon className="h-4 w-4" /> Local Neural Engine (WebLLM)
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Active Hardware Model</Label>
              <Select 
                value={userProfile?.preferredWebLLMModel || "Llama-3.2-1B-Instruct-q4f16_1-MLC"}
                onValueChange={(val) => handleConfigChange({ preferredWebLLMModel: val })}
              >
                <SelectTrigger className="h-16 border-4 rounded-2xl font-black text-lg bg-background shadow-inner hover:border-primary/30">
                  <SelectValue placeholder="Select Local Model" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-4 font-bold bg-background/95 backdrop-blur-xl">
                  {WEBLLM_MODELS.map(m => (
                    <SelectItem key={m.id} value={m.id} className="py-4 font-bold cursor-pointer rounded-xl">{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[9px] font-bold text-muted-foreground uppercase px-2 opacity-60">Privacy-first inference runs 100% on your local GPU/CPU hardware. (Warning: Slow response times).</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* APPEARANCE */}
      <Card className="border-2 shadow-sm rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl">
        <CardHeader className="bg-primary/5 border-b p-8">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle style={georgiaFont} className="text-2xl font-bold text-primary">Appearance</CardTitle>
          </div>
          <CardDescription className="font-medium text-muted-foreground text-base mt-1">Choose how you want the app to look on your screen.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
           <RadioGroup defaultValue={theme} onValueChange={(value) => setTheme(value as any)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 rounded-2xl border-2 p-5 cursor-pointer hover:bg-primary/5 transition-all">
                    <RadioGroupItem value="light" id="light" /><Label htmlFor="light" className="font-bold uppercase text-xs tracking-widest cursor-pointer flex-1">Light Mode</Label>
                </div>
                <div className="flex items-center space-x-3 rounded-2xl border-2 p-5 cursor-pointer hover:bg-primary/5 transition-all">
                    <RadioGroupItem value="dark" id="dark" /><Label htmlFor="dark" className="font-bold uppercase text-xs tracking-widest cursor-pointer flex-1">Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-3 rounded-2xl border-2 p-5 cursor-pointer hover:bg-primary/5 transition-all">
                    <RadioGroupItem value="system" id="system" /><Label htmlFor="system" className="font-bold uppercase text-xs tracking-widest cursor-pointer flex-1">System Default</Label>
                </div>
            </RadioGroup>
        </CardContent>
      </Card>

      {/* PRIVACY & SYNC */}
      <Card className="border-2 shadow-sm rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl">
        <CardHeader className="bg-primary/5 border-b p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle style={georgiaFont} className="text-2xl font-bold text-primary">Privacy & Sync</CardTitle>
          </div>
          <CardDescription className="font-medium text-muted-foreground text-base mt-1">Control which information you want to receive or sync.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 hover:bg-primary/5 transition-all">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-sm uppercase tracking-widest">Timetable Access</p>
                <p className="text-xs text-muted-foreground">Show your class and exam schedules.</p>
              </div>
            </div>
            <Switch 
              checked={userProfile?.accessTimetable ?? true} 
              onCheckedChange={(val) => updateUserProfile({ accessTimetable: val })} 
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 hover:bg-primary/5 transition-all">
            <div className="flex items-center gap-4">
              <Megaphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-sm uppercase tracking-widest">Announcements</p>
                <p className="text-xs text-muted-foreground">Receive broadcast updates from teachers.</p>
              </div>
            </div>
            <Switch 
              checked={userProfile?.accessAnnouncements ?? true} 
              onCheckedChange={(val) => updateUserProfile({ accessAnnouncements: val })} 
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 hover:bg-primary/5 transition-all">
            <div className="flex items-center gap-4">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-sm uppercase tracking-widest">Teacher Files</p>
                <p className="text-xs text-muted-foreground">Access materials shared via Class Code.</p>
              </div>
            </div>
            <Switch 
              checked={userProfile?.accessTeacherFiles ?? true} 
              onCheckedChange={(val) => updateUserProfile({ accessTeacherFiles: val })} 
            />
          </div>
        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card className="border-2 shadow-sm rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl">
        <CardHeader className="bg-primary/5 border-b p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle style={georgiaFont} className="text-2xl font-bold text-primary">Security</CardTitle>
          </div>
          <CardDescription className="font-medium text-muted-foreground text-base mt-1">Update your password directly to keep your account safe.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {isGoogleUser ? (
            <div className="p-8 rounded-3xl bg-muted/20 border-2 border-dashed flex flex-col items-center text-center space-y-4">
              <Lock className="h-8 w-8 text-muted-foreground/40" />
              <p className="font-bold text-muted-foreground">You are logged in with Google. You can manage your security in your Google Account settings.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/60">Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 border-2 rounded-xl bg-background" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary/60">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="New Password" {...field} className="pl-12 border-2 rounded-xl bg-background" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" disabled={isUpdatingPassword} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                  {isUpdatingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                  Change Password Now
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* FEEDBACK */}
      <Card className="border-2 shadow-sm rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl">
        <CardHeader className="bg-primary/5 border-b p-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle style={georgiaFont} className="text-2xl font-bold text-primary">Feedback</CardTitle>
          </div>
          <CardDescription className="font-medium text-muted-foreground text-base mt-1">Tell us what you think or suggest new features.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
              <Label htmlFor="feedback-text" className="font-black uppercase text-[10px] tracking-[0.2em] text-primary/60">Your Message</Label>
              <Textarea 
                id="feedback-text" 
                placeholder="What's on your mind? We read all your messages." 
                rows={5} 
                className="font-medium border-2 rounded-2xl p-6 shadow-inner focus:border-primary transition-all" 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
          </div>
          <Button onClick={handleSendFeedback} className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl">
            Send My Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
