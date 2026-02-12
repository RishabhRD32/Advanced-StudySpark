
"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, User, GraduationCap, UserCheck } from "lucide-react";
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  className: z.string().optional(),
  collegeName: z.string().optional(),
  ccCode: z.string().optional(),
  division: z.string().optional(),
});

export default function ProfilePage() {
  const { userProfile, updateUserProfile, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      firstName: "", 
      lastName: "", 
      className: "", 
      collegeName: "",
      ccCode: "",
      division: ""
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        className: userProfile.className || "",
        collegeName: userProfile.collegeName || "",
        ccCode: userProfile.ccCode || "",
        division: userProfile.division || "",
      });
    }
  }, [userProfile, form]);

  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      await updateUserProfile(values);
      toast({ title: "Saved", description: "Your profile has been updated." });
    } catch (error: any) { 
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { 
      setIsSubmitting(false); 
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const isStudent = userProfile?.profession === 'student';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <h1 className="text-4xl font-black tracking-tight">Your Profile</h1>
      
      <Card className="border-2 shadow-sm bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b p-8">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Identity Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userProfile?.profession === 'teacher' ? (
                            <UserCheck className="h-16 w-16" />
                          ) : (
                            <GraduationCap className="h-16 w-16" />
                          )}
                        </AvatarFallback>
                    </Avatar>
                     <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">
                          {userProfile?.firstName} {userProfile?.lastName}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {userProfile?.profession} Account
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                     <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold uppercase text-[10px] tracking-widest">First Name</FormLabel>
                          <FormControl><Input placeholder="Your First Name" {...field} className="font-medium border-2 rounded-xl h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                     <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold uppercase text-[10px] tracking-widest">Last Name</FormLabel>
                          <FormControl><Input placeholder="Your Last Name" {...field} className="font-medium border-2 rounded-xl h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="collegeName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold uppercase text-[10px] tracking-widest">School / College Name</FormLabel>
                          <FormControl><Input {...field} placeholder="Enter your institution" className="font-medium border-2 rounded-xl h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                     <FormField control={form.control} name="ccCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-primary">Class Code</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. MATH101" className="font-black border-2 rounded-xl h-12 uppercase" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                </div>
                
                {isStudent && (
                  <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                      <FormField control={form.control} name="className" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest">Class / Grade</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g. 10th Grade" className="font-medium border-2 rounded-xl h-12" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                       <FormField control={form.control} name="division" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest">Section / Division</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g. Section A" className="font-medium border-2 rounded-xl h-12" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="h-14 px-10 font-black uppercase tracking-widest rounded-xl shadow-lg w-full md:w-auto">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save My Profile
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
