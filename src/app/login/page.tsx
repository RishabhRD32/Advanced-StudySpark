
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
import { Eye, EyeOff, Sparkles, ArrowLeft, LogIn, Zap } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
    .regex(/[a-zA-Z]/, { message: "Must include at least one letter." })
    .regex(/[0-9]/, { message: "Must include at least one number." }),
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
      toast({ title: "Welcome back!", description: "You are now logged in." });
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
      toast({ variant: "destructive", title: "Google Login Failed", description: error.message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden perspective-2000">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 relative z-10">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-all mb-4 group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Home</span>
          </Link>
          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-primary/20 animate-float">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground font-medium">Study smarter, not harder.</p>
        </div>

        <Card className="border-2 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl rounded-[2.5rem] transform-gpu hover:scale-[1.01] transition-all duration-500">
          <CardHeader className="bg-primary/5 border-b py-6 text-center">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Login to your account</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@institute.edu" {...field} className="h-12 border-2 font-medium rounded-xl bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="h-12 border-2 font-medium rounded-xl bg-background" />
                      </FormControl>
                      <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-14 text-lg font-bold uppercase tracking-wider rounded-xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Zap className="mr-2 h-5 w-5 animate-bolt" /> : <LogIn className="mr-2 h-5 w-5" />}
                  Login
                </Button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card/0 px-4 text-muted-foreground tracking-widest">OR USE GOOGLE</span></div>
                </div>

                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-14 border-2 font-bold uppercase tracking-wider gap-3 rounded-xl bg-white text-black hover:bg-gray-50 transition-all" 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? <Zap className="h-5 w-5 animate-bolt text-primary" /> : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                
                <div className="mt-8 pt-6 border-t text-center space-y-2">
                  <p className="text-xs font-bold text-muted-foreground">New to StudySpark?</p>
                  <Button asChild variant="link" className="font-bold text-primary text-lg">
                    <Link href="/signup">Create Account</Link>
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
