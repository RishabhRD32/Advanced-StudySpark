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
  Puzzle
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

  const mainNavLinks = allMainNavLinks.filter(link => !link.studentOnly || !isTeacher);

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
    { href: "/main/cloze-master", label: "Cloze Master", icon: <Puzzle className="h-5 w-5" /> },
    { href: "/main/ai-tutor", label: "AI Tutor", icon: <BrainCircuit className="h-5 w-5" /> },
    { href: "/main/ai-dictionary", label: "Dictionary", icon: <BookMarked className="h-5 w-5" /> },
    { href: "/main/ai-humanizer", label: "AI Humanizer", icon: <Languages className="h-5 w-5" /> },
    { href: "/main/ai-summarizer", label: "Summarizer", icon: <ScrollText className="h-5 w-5" /> },
    { href: "/main/ai-writer", label: "Creative Writer", icon: <PenTool className="h-5 w-5" /> },
    { href: "/main/ai-mnemonics", label: "Mnemonic Hack", icon: <Lightbulb className="h-5 w-5" /> },
    { href: "/main/ai-researcher", label: "Researcher", icon: <Search className="h-5 w-5" /> },
    { href: "/main/ai-problem-solver", label: "Problem Solver", icon: <Brain className="h-5 w-5" /> },
    { href: "/main/ai-code-mentor", label: "Coding Help", icon: <Terminal className="h-5 w-5" /> },
    { href: "/main/ai-career-navigator", label: "Career Guide", icon: <Compass className="h-5 w-5" /> },
    { href: "/main/flashcards", label: "Flashcards", icon: <Layers className="h-5 w-5" /> },
    { href: "/main/ppt-generator", label: "Slide Maker", icon: <FileQuestion className="h-5 w-5" /> },
    { href: "/main/quiz-generator", label: "Practice Quiz", icon: <FileQuestion className="h-5 w-5" /> },
    { href: "/main/playworld", label: "Break Hub", icon: <Gamepad2 className="h-5 w-5" /> },
  ];

  const serifHeader = { fontFamily: "'Times New Roman', Times, serif" };
  const serifLink = { fontFamily: "Georgia, 'Times New Roman', Times, serif" };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative hidden lg:flex flex-col border-r bg-background dark:bg-[#020817] transition-all duration-500 shadow-2xl z-40",
          isCollapsed ? "w-24" : "w-80"
        )}
      >
        <div className={cn("flex items-center h-24 border-b border-border dark:border-white/5 px-10", isCollapsed && "px-0 justify-center")}>
          <Link href="/main/dashboard" className="transition-transform active:scale-90 duration-300">
            {isCollapsed ? <Zap className="h-8 w-8 text-primary animate-bolt" /> : <Logo className="scale-110" />}
          </Link>
        </div>
        <nav className="flex flex-col gap-8 p-8 flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-3">
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
                          ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-bold shadow-sm dark:shadow-lg border border-primary/20 dark:border-primary/40" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        isCollapsed && "justify-center w-14 h-14 p-0 rounded-2xl"
                      )}
                    >
                      <Link href={link.href}>
                        {pathname === link.href && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]" />
                        )}
                        <span className={cn("transition-transform duration-300 group-hover:scale-110 shrink-0", pathname === link.href ? "text-primary" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                        {!isCollapsed && <span className="ml-5 font-bold text-[13px] uppercase tracking-wider">{link.label}</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right" className="font-bold uppercase text-[10px] tracking-widest bg-primary text-white border-none">{link.label}</TooltipContent>}
                </Tooltip>
              </li>
            ))}
          </ul>

          <div>
            {!isCollapsed && <h3 style={serifHeader} className="text-[14px] font-bold text-primary uppercase px-5 mt-10 mb-6 tracking-[0.3em]">{isTeacher ? 'Teacher Tools' : 'Resources'}</h3>}
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        style={serifLink}
                        className={cn(
                          "w-full justify-start h-14 transition-all duration-300 rounded-2xl relative group overflow-hidden",
                          pathname === link.href 
                            ? "bg-primary/15 dark:bg-primary/25 text-primary dark:text-white font-bold border border-primary/20 dark:border-primary/40 shadow-sm dark:shadow-lg" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "justify-center w-14 h-14 p-0 rounded-2xl"
                        )}
                      >
                        <Link href={link.href}>
                          {pathname === link.href && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]" />
                          )}
                          <span className={cn("shrink-0", pathname === link.href ? "text-primary" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                          {!isCollapsed && <span className="ml-5 font-bold text-[13px] uppercase tracking-wider">{link.label}</span>}
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
            {!isCollapsed && <h3 style={serifHeader} className="text-[14px] font-bold text-primary uppercase px-5 mt-12 mb-6 tracking-[0.3em]">AI Tools</h3>}
            <ul className="space-y-3 pb-16">
              {aiToolsLinks.map((link) => (
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
                            ? "bg-primary/15 dark:bg-primary/25 text-primary dark:text-white font-bold border border-primary/20 dark:border-primary/40 shadow-sm dark:shadow-lg" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "justify-center w-14 h-14 p-0 rounded-2xl"
                        )}
                      >
                        <Link href={link.href}>
                          {pathname === link.href && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]" />
                          )}
                          <span className={cn("shrink-0", pathname === link.href ? "text-primary" : "opacity-90 group-hover:opacity-100")}>{link.icon}</span>
                          {!isCollapsed && <span className="ml-5 font-bold text-[13px] uppercase tracking-wider">{link.label}</span>}
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
