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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Min 6 characters required." })
    .regex(/[a-zA-Z]/, { message: "Include at least one letter." })
    .regex(/[0-9]/, { message: "Include at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Include at least one symbol." }),
  profession: z.enum(["student", "teacher"], { required_error: "Role is required." }),
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
    message: "Class name is required for students.",
    path: ["className"],
});

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialView?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onOpenChange, initialView = 'login' }: AuthModalProps) {
  const [isFlipped, setIsFlipped] = useState(initialView === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    setIsFlipped(initialView === 'signup');
  }, [initialView, isOpen]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
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

  const profession = signupForm.watch("profession");

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
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
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
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

  const handleFlip = (view: 'login' | 'signup') => {
    setIsFlipped(view === 'signup');
    loginForm.reset();
    signupForm.reset();
  }

  const GoogleLogo = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent w-full max-w-lg overflow-hidden">
        <div className="relative h-[850px]" style={{ perspective: '1000px' }}>
          <div
            className={cn("w-full h-full absolute transition-transform duration-700", isFlipped && "rotate-y-180")}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Login Form */}
            <div className="absolute w-full h-full p-8 bg-card rounded-[2.5rem] shadow-2xl border-2" style={{ backfaceVisibility: 'hidden' }}>
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-3xl font-black tracking-tight">Welcome Back</DialogTitle>
                <DialogDescription className="font-medium">Sign in to your account.</DialogDescription>
              </DialogHeader>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Email</FormLabel>
                      <FormControl><Input placeholder="name@institute.edu" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="h-12 border-2 font-medium rounded-xl" />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => setShowLoginPassword(prev => !prev)}>
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-lg" disabled={isLoading}>
                    {isLoading ? <Zap className="mr-2 h-5 w-5 animate-bolt" /> : "Login"}
                  </Button>
                </form>
              </Form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-4 text-muted-foreground tracking-widest">Or Use Google</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 border-2 font-bold uppercase tracking-widest gap-3 rounded-xl bg-white text-black" 
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Zap className="h-5 w-5 animate-bolt text-primary" /> : <GoogleLogo />}
                Continue with Google
              </Button>

              <p className="text-sm text-center font-bold mt-6">
                No account?{' '}
                <Button variant="link" className="p-0 h-auto font-black text-primary" onClick={() => handleFlip('signup')}>Sign Up</Button>
              </p>
            </div>

            {/* Signup Form */}
            <div className="absolute w-full h-full p-8 bg-card rounded-[2.5rem] shadow-2xl border-2 overflow-y-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-3xl font-black tracking-tight">Join StudySpark</DialogTitle>
                <DialogDescription className="font-medium">Get started for free today.</DialogDescription>
              </DialogHeader>

              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">First Name</FormLabel><FormControl><Input placeholder="Your First Name" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                       <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Last Name</FormLabel><FormControl><Input placeholder="Your Last Name" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={signupForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Email</FormLabel><FormControl><Input placeholder="name@institute.edu" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Password</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input type={showSignupPassword ? "text" : "password"} placeholder="Min 6 chars + symbols" {...field} className="h-12 border-2 font-medium rounded-xl" />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowSignupPassword(prev => !prev)}>
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="profession" render={({ field }) => (
                    <FormItem className="space-y-3 pt-2"><FormLabel className="font-bold uppercase text-[10px] text-primary">I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-6">
                          <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                            <FormControl><RadioGroupItem value="student" /></FormControl>
                            <FormLabel className="font-bold uppercase text-xs tracking-widest cursor-pointer">Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                            <FormControl><RadioGroupItem value="teacher" /></FormControl>
                            <FormLabel className="font-bold uppercase text-xs tracking-widest cursor-pointer">Teacher</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={signupForm.control} name="collegeName" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">School / College Name</FormLabel><FormControl><Input placeholder="Enter institution" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={signupForm.control} name="ccCode" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold uppercase text-[10px] text-primary">Class Code</FormLabel><FormControl><Input placeholder="e.g. MATH101" {...field} className="h-12 border-2 font-black rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  {profession === 'student' && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={signupForm.control} name="className" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Class</FormLabel><FormControl><Input placeholder="e.g. 10th Grade" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={signupForm.control} name="division" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold uppercase text-[10px] text-muted-foreground">Section</FormLabel><FormControl><Input placeholder="e.g. Section A" {...field} className="h-12 border-2 font-medium rounded-xl" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  )}

                  <Button type="submit" className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl shadow-lg mt-4" disabled={isLoading}>
                    {isLoading ? <Zap className="mr-2 h-5 w-5 animate-bolt" /> : "Sign Up"}
                  </Button>
                </form>
              </Form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-4 text-muted-foreground tracking-widest">Or Use Google</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 border-2 font-bold uppercase tracking-widest gap-3 rounded-xl bg-white text-black" 
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Zap className="h-5 w-5 animate-bolt text-primary" /> : <GoogleLogo />}
                Continue with Google
              </Button>

              <p className="text-sm text-center font-bold mt-4">
                Have an account?{' '}
                <Button variant="link" className="p-0 h-auto font-black text-primary" onClick={() => handleFlip('login')}>Login</Button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
