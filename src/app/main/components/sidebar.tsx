"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth/use-auth";
import { useSidebar } from "./sidebar-provider";
import {
  LayoutDashboard,
  Book,
  BrainCircuit,
  FileQuestion,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gamepad2,
  CheckCircle2,
  Presentation,
  Globe,
  Layers,
  Users,
  ShieldCheck,
  CalendarRange,
  Megaphone,
  Settings2,
  Zap,
  Library,
  Brain,
  Terminal,
  Compass,
  Search,
  PenTool,
  Lightbulb,
  Languages,
  BookMarked,
  MessageSquare,
  Quote,
  GraduationCap,
  ArrowRightLeft,
  ScanText,
  Puzzle,
  MonitorPlay
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { userProfile } = useAuth();

  const isTeacher = userProfile?.profession === 'teacher';

  const allMainNavLinks = [
    { href: "/main/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/main/announcements", label: "Notices", icon: <Megaphone className="h-5 w-5" /> },
    { href: isTeacher ? "/main/messages" : "/main/chat", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/main/subjects", label: "My Subjects", icon: <Book className="h-5 w-5" /> },
    { href: "/main/timetable", label: "My Schedule", icon: <Calendar className="h-5 w-5" /> },
    { href: "/main/todo", label: "To-Do List", icon: <CheckCircle2 className="h-5 w-5" /> },
    { href: "/main/news", label: "Global News", icon: <Globe className="h-5 w-5" /> },
  ];

  const mainNavLinks = allMainNavLinks;

  const resourceLinks = [
    { href: "/main/library", label: "Public Notes", icon: <Library className="h-5 w-5" /> },
    ...(isTeacher ? [
      { href: "/main/manage", label: "Management", icon: <Settings2 className="h-5 w-5" /> },
      { href: "/main/my-class", label: "My Students", icon: <Users className="h-5 w-5" /> },
      { href: "/main/smart-scheduler", label: "Smart Scheduler", icon: <CalendarRange className="h-5 w-5" /> },
      { href: "/main/lesson-planner", label: "Lesson Planner", icon: <Presentation className="h-5 w-5" /> },
    ] : [
      { href: "/main/teacher-vault", label: "Teacher's Files", icon: <ShieldCheck className="h-5 w-5" /> },
      { href: "/main/class-schedule", label: "Class Schedule", icon: <Calendar className="h-5 w-5" /> },
    ])
  ];

  const aiToolsLinks = [
    { href: "/main/unit-converter", label: "Unit Converter", icon: <ArrowRightLeft className="h-5 w-5" /> },
    { href: "/main/gpa-calculator", label: "GPA Tracking", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/main/citation-generator", label: "Citation Pro", icon: <Quote className="h-5 w-5" /> },
    { href: "/main/reading-analytics", label: "Reading Stats", icon: <ScanText className="h-5 w-5" /> },
    { href: "/main/cloze-master", label: "Memory Fill", icon: <Puzzle className="h-5 w-5" /> },
    { href: "/main/ai-tutor", label: "AI Tutor", icon: <BrainCircuit className="h-5 w-5" /> },
    { href: "/main/ai-dictionary", label: "Dictionary", icon: <BookMarked className="h-5 w-5" /> },
    { href: "/main/ai-humanizer", label: "Natural Writer", icon: <Languages className="h-5 w-5" /> },
    { href: "/main/ai-summarizer", label: "Summarizer", icon: <ScrollText className="h-5 w-5" /> },
    { href: "/main/ai-writer", label: "Creative Writer", icon: <PenTool className="h-5 w-5" /> },
    { href: "/main/ai-mnemonics", label: "Memory Tricks", icon: <Lightbulb className="h-5 w-5" /> },
    { href: "/main/ai-researcher", label: "Researcher", icon: <Search className="h-5 w-5" /> },
    { href: "/main/ai-problem-solver", label: "Problem Solver", icon: <Brain className="h-5 w-5" /> },
    { href: "/main/ai-code-mentor", label: "Coding Help", icon: <Terminal className="h-5 w-5" /> },
    { href: "/main/ai-career-navigator", label: "Career Guide", icon: <Compass className="h-5 w-5" /> },
    { href: "/main/flashcards", label: "Flashcards", icon: <Layers className="h-5 w-5" /> },
    { href: "/main/ppt-generator", label: "Slide Maker", icon: <MonitorPlay className="h-5 w-5" /> },
    { href: "/main/quiz-generator", label: "Practice Quiz", icon: <FileQuestion className="h-5 w-5" /> },
    { href: "/main/playworld", label: "Break Hub", icon: <Gamepad2 className="h-5 w-5" /> },
  ];

  const serifHeader = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
  const serifLink = { fontFamily: "'Inter', sans-serif" };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative hidden lg:flex flex-col border-r bg-background dark:bg-[#020817] transition-all duration-500 shadow-2xl z-40",
          isCollapsed ? "w-24" : "w-80"
        )}
      >
        <div className={cn("flex items-center h-24 border-b border-border dark:border-white/5 px-8", isCollapsed && "px-0 justify-center")}>
          <Link href="/main/dashboard" className="transition-all active:scale-95 duration-300 block">
            {isCollapsed ? (
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20 shadow-sm">
                <Zap className="h-6 w-6 text-primary animate-bolt fill-primary/20" />
              </div>
            ) : (
              <Logo />
            )}
          </Link>
        </div>
        <nav className="flex flex-col gap-8 p-8 flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-2">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      style={serifLink}
                      className={cn(
                        "w-full justify-start h-14 transition-all duration-300 rounded-2xl relative group overflow-hidden",
                        pathname === link.href 
                          ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-black shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3)] border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        isCollapsed && "justify-center w-14 h-14 p-0 rounded-2xl"
                      )}
                    >
                      <Link href={link.href}>
                        {pathname === link.href && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_hsl(var(--primary))]" />
                        )}
                        <span className={cn("transition-transform duration-300 group-hover:scale-110 shrink-0", pathname === link.href ? "text-primary scale-110" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                        {!isCollapsed && <span className="ml-5 font-black text-[12px] uppercase tracking-[0.1em]">{link.label}</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right" className="font-bold uppercase text-[10px] tracking-widest bg-primary text-white border-none">{link.label}</TooltipContent>}
                </Tooltip>
              </li>
            ))}
          </ul>

          <div>
            {!isCollapsed && <h3 style={serifHeader} className="text-[11px] font-black text-primary uppercase px-5 mt-8 mb-4 tracking-[0.4em] opacity-60">{isTeacher ? 'Faculty' : 'Resources'}</h3>}
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        style={serifLink}
                        className={cn(
                          "w-full justify-start h-12 transition-all duration-300 rounded-xl relative group overflow-hidden",
                          pathname === link.href 
                            ? "bg-primary/15 text-primary font-black border border-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "justify-center w-12 h-12 p-0 rounded-xl"
                        )}
                      >
                        <Link href={link.href}>
                          <span className={cn("shrink-0", pathname === link.href ? "text-primary" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                          {!isCollapsed && <span className="ml-4 font-black text-[11px] uppercase tracking-widest">{link.label}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right" className="font-bold uppercase text-[10px] tracking-widest bg-primary text-white border-none">{link.label}</TooltipContent>}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {!isCollapsed && <h3 style={serifHeader} className="text-[11px] font-black text-primary uppercase px-5 mt-10 mb-4 tracking-[0.4em] opacity-60">AI Tools</h3>}
            <ul className="space-y-2 pb-16">
              {aiToolsLinks.map((link) => (
                <li key={link.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        style={serifLink}
                        className={cn(
                          "w-full justify-start h-12 transition-all duration-300 rounded-xl relative group overflow-hidden",
                          pathname === link.href 
                            ? "bg-primary/15 text-primary font-black border border-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "justify-center w-12 h-12 p-0 rounded-xl"
                        )}
                      >
                        <Link href={link.href}>
                          <span className={cn("shrink-0", pathname === link.href ? "text-primary" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                          {!isCollapsed && <span className="ml-4 font-black text-[11px] uppercase tracking-widest">{link.label}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right" className="font-bold uppercase text-[10px] tracking-widest bg-primary text-white border-none">{link.label}</TooltipContent>}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        
        <div className="absolute top-1/2 -right-[18px] z-50">
          <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full h-10 w-10 bg-background dark:bg-[#020817] shadow-2xl border-4 border-border dark:border-white/10 hover:scale-110 hover:border-primary active:scale-90 transition-all group" 
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 group-hover:text-primary transition-colors text-foreground dark:text-white" /> : <ChevronLeft className="h-5 w-5 group-hover:text-primary transition-colors text-foreground dark:text-white" />}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
