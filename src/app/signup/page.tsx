"use client"

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ArrowLeft, ShieldCheck, GraduationCap, UserCircle, Zap, Eye, EyeOff, Info, Building2, User, Book, Atom, Brain } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[a-zA-Z]/, { message: "Include at least one letter." })
    .regex(/[0-9]/, { message: "Include at least one number." }),
  profession: z.enum(["student", "teacher"], { required_error: "Please select your role." }),
  className: z.string().optional(),
  collegeName: z.string().optional(),
  ccCode: z.string().optional(),
  division: z.string().optional(),
}).refine(data => {
    if (data.profession === 'student') {
        return !!data.className && data.className.length > 0;
    }
    return true;
}, {
    message: "Please enter your class or grade.",
    path: ["className"],
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      firstName: "", 
      lastName: "", 
      email: "", 
      password: "", 
      profession: "student", 
      className: "", 
      collegeName: "",
      ccCode: "",
      division: ""
    },
  });

  const profession = form.watch("profession");

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      await signup(
        values.firstName, 
        values.lastName, 
        values.email, 
        values.password, 
        values.profession, 
        values.className, 
        values.collegeName,
        values.ccCode,
        values.division
      );
      toast({ title: "Welcome!", description: "Your account is ready." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Oops!", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden py-24 px-4 mesh-background [perspective:2000px]">
      
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[10%] animate-float opacity-10 [transform:rotateX(20deg)_rotateY(20deg)_translateZ(150px)]">
          <Book className="h-32 w-32 text-primary" />
        </div>
        <div className="absolute top-[50%] right-[5%] animate-float opacity-10 [transform:rotateX(-30deg)_rotateY(-10deg)_translateZ(250px)]" style={{ animationDelay: '-1s' }}>
          <Atom className="h-40 w-40 text-primary" />
        </div>
        <div className="absolute bottom-[5%] left-[5%] animate-float opacity-10 [transform:rotateX(10deg)_rotateY(40deg)_translateZ(100px)]" style={{ animationDelay: '-3s' }}>
          <Brain className="h-24 w-24 text-primary" />
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 relative z-10 [transform-style:preserve-3d]">
        <div className="text-center space-y-6 [transform:translateZ(60px)]">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all mb-4 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to home</span>
          </Link>
          <div className="flex justify-center">
            <Logo className="scale-150 drop-shadow-2xl" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">Join <span className="text-primary">Free</span></h1>
            <p className="text-xl text-muted-foreground font-bold opacity-60">The easiest way to study.</p>
          </div>
        </div>

        <Card className="border-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden bg-card/40 backdrop-blur-xl rounded-[3.5rem] transition-all duration-500 hover:[transform:rotateX(1deg)_rotateY(1deg)_translateZ(10px)] group">
          <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-8 text-center">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-16">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-4 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
                    <span className="h-px w-12 bg-primary/20" /> I am a... <span className="h-px w-12 bg-primary/20" />
                  </div>
                  <FormField control={form.control} name="profession" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                        >
                          <FormItem>
                            <FormControl><RadioGroupItem value="student" className="sr-only" /></FormControl>
                            <FormLabel className={cn(
                              "flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all h-52 group relative overflow-hidden",
                              field.value === 'student' ? "border-primary bg-primary/10 shadow-2xl scale-105" : "border-primary/5 border-dashed bg-muted/5 opacity-60 hover:border-primary/20"
                            )}>
                              <GraduationCap className={cn("h-14 w-14 mb-4 transition-all", field.value === 'student' ? "text-primary scale-110" : "text-muted-foreground")} />
                              <span className="font-black uppercase text-xs tracking-[0.2em]">Student</span>
                            </FormLabel>
                          </FormItem>

                          <FormItem className="relative">
                            <FormControl><RadioGroupItem value="teacher" className="sr-only" /></FormControl>
                            <FormLabel className={cn(
                              "flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all h-52 group relative overflow-hidden",
                              field.value === 'teacher' ? "border-primary bg-primary/10 shadow-2xl scale-105" : "border-primary/5 border-dashed bg-muted/5 opacity-60 hover:border-primary/20"
                            )}>
                              <UserCircle className={cn("h-14 w-14 mb-4 transition-all", field.value === 'teacher' ? "text-primary scale-110" : "text-muted-foreground")} />
                              <span className="font-black uppercase text-xs tracking-[0.2em]">Teacher</span>
                            </FormLabel>
                            {field.value === 'teacher' && (
                              <div className="absolute top-6 right-6">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/20 text-primary border-2 border-primary/30 animate-pulse hover:bg-primary hover:text-white">
                                      <Info className="h-5 w-5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 rounded-[2rem] border-4 p-8 shadow-2xl bg-background/95 backdrop-blur-xl">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 text-primary">
                                        <Building2 className="h-5 w-5" />
                                        <h4 className="font-black uppercase text-[10px] tracking-widest">Team Work</h4>
                                      </div>
                                      <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                                        Teachers who use the same code can share notices and student lists with each other.
                                      </p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary/40 font-black uppercase text-[9px] tracking-[0.4em]">
                      <User className="h-3 w-3" /> Your Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">First Name</FormLabel>
                          <FormControl><Input placeholder="First Name" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Last Name</FormLabel>
                          <FormControl><Input placeholder="Last Name" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email</FormLabel>
                        <FormControl><Input placeholder="name@email.com" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground" onClick={() => setShowPassword(prev => !prev)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 text-primary/40 font-black uppercase text-[9px] tracking-[0.4em]">
                      <Building2 className="h-3 w-3" /> Your School
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="collegeName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">School Name</FormLabel>
                          <FormControl><Input placeholder="School name" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ccCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Class Code</FormLabel>
                          <FormControl><Input placeholder="e.g. MATH101" {...field} className="h-14 border-4 border-primary/20 rounded-2xl bg-primary/5 font-black px-6 shadow-inner uppercase placeholder:normal-case focus:border-primary" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {profession === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                      <FormField control={form.control} name="className" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Grade</FormLabel>
                          <FormControl><Input placeholder="e.g. 10th Grade" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="division" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Section</FormLabel>
                          <FormControl><Input placeholder="e.g. Section A" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold px-6 shadow-inner" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  <Button type="submit" className="w-full h-20 text-xl font-black uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)] rounded-[2.5rem] group transition-all hover:scale-[1.01] active:scale-95" disabled={isLoading}>
                    {isLoading ? <Zap className="mr-3 h-8 w-8 animate-bolt fill-primary/20" /> : <ShieldCheck className="mr-3 h-8 w-8 group-hover:scale-110 transition-transform" />}
                    Join Now
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-primary/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 shrink-0">Or use google</span>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>

                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-16 border-4 font-black uppercase tracking-widest gap-4 rounded-[2rem] bg-background hover:bg-primary/5 transition-all shadow-md active:scale-95" 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? <Zap className="h-6 w-6 animate-bolt text-primary" /> : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Google Signup
                </Button>
                
                <div className="pt-8 border-t-2 border-dashed text-center space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Have an account?</p>
                  <Button asChild variant="link" className="font-black text-primary text-2xl uppercase tracking-tighter hover:scale-105 transition-transform">
                    <Link href="/login">Login Here</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
