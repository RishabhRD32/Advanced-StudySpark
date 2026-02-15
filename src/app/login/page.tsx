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
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, LogIn, Zap, Book, Atom, Brain, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast({ title: "Welcome back!", description: "Opening your dashboard..." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4 md:p-6 lg:p-8 mesh-background [perspective:2000px]">
      
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] animate-float opacity-20 [transform:rotateX(25deg)_rotateY(-15deg)_translateZ(100px)]">
          <Book className="h-24 w-24 text-primary" />
        </div>
        <div className="absolute top-[60%] right-[10%] animate-float opacity-10 [transform:rotateX(-20deg)_rotateY(30deg)_translateZ(200px)]" style={{ animationDelay: '-2s' }}>
          <Atom className="h-32 w-32 text-primary" />
        </div>
        <div className="absolute bottom-[10%] left-[20%] animate-float opacity-15 [transform:rotateX(15deg)_rotateY(10deg)_translateZ(50px)]" style={{ animationDelay: '-4s' }}>
          <Brain className="h-20 w-20 text-primary" />
        </div>
        <div className="absolute top-[40%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10 [transform-style:preserve-3d]">
        <div className="text-center space-y-6 [transform:translateZ(50px)]">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all mb-4 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to home</span>
          </Link>
          <div className="flex justify-center">
            <Logo className="scale-150 drop-shadow-2xl" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Welcome <span className="text-primary">Back</span></h1>
            <p className="text-muted-foreground font-bold opacity-60">Ready to study today?</p>
          </div>
        </div>

        <Card className="border-4 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden bg-card/40 backdrop-blur-3xl rounded-[3rem] transition-all duration-500 hover:[transform:rotateX(2deg)_rotateY(-2deg)_translateZ(20px)] group">
          <CardHeader className="bg-primary/5 border-b-4 border-primary/5 py-8 text-center">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Login</CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold text-lg px-6 focus:border-primary transition-all shadow-inner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} className="h-14 border-4 border-primary/10 rounded-2xl bg-background font-bold text-lg px-6 focus:border-primary transition-all shadow-inner" />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-primary" onClick={() => setShowPassword(prev => !prev)}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
                  {isLoading ? <Zap className="mr-3 h-6 w-6 animate-bolt fill-primary/20" /> : <LogIn className="mr-3 h-6 w-6" />}
                  Login
                </Button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-primary/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 shrink-0">Or use google</span>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>

                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-14 border-4 font-black uppercase tracking-widest gap-4 rounded-2xl bg-background hover:bg-primary/5 transition-all shadow-md active:scale-95" 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? <Zap className="h-5 w-5 animate-bolt text-primary" /> : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Sign in with Google
                </Button>
                
                <div className="pt-6 border-t-2 border-dashed flex flex-col items-center gap-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New here?</p>
                  <Button asChild variant="link" className="font-black text-primary text-xl uppercase tracking-tighter hover:scale-105 transition-transform">
                    <Link href="/signup">Join Now</Link>
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
