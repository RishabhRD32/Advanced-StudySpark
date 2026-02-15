
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Book,
  BrainCircuit,
  Calendar,
  FileQuestion,
  LayoutDashboard,
  Menu,
  ScrollText,
  Gamepad2,
  Timer,
  Presentation,
  Search as SearchIcon,
  Zap,
  Cpu,
  Sparkles,
  Megaphone,
  PenTool,
  Lightbulb,
  Library,
  Settings2,
  Users,
  ShieldCheck,
  Languages,
  BookMarked,
  Quote,
  GraduationCap,
  ArrowRightLeft,
  ScanText,
  Puzzle,
  CalendarRange,
  Globe,
  CheckCircle2,
  MessageSquare,
  Brain,
  Terminal,
  Compass,
  Layers,
  MonitorPlay
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { UserNav } from "./user-nav";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from "./sidebar-provider";
import { useAuth } from "@/lib/auth/use-auth";
import { useAnnouncements } from "@/hooks/use-firestore";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { userProfile } = useAuth();
  const { announcements, loading } = useAnnouncements(userProfile?.ccCode);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const isTeacher = userProfile?.profession === 'teacher';

  const mainNavLinks = [
    { href: "/main/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/main/announcements", label: "Notices", icon: <Megaphone className="h-5 w-5" /> },
    { href: isTeacher ? "/main/messages" : "/main/chat", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/main/subjects", label: "My Subjects", icon: <Book className="h-5 w-5" /> },
    { href: "/main/timetable", label: "My Schedule", icon: <Calendar className="h-5 w-5" /> },
    { href: "/main/todo", label: "To-Do List", icon: <CheckCircle2 className="h-5 w-5" /> },
    { href: "/main/news", label: "Global News", icon: <Globe className="h-5 w-5" /> },
  ];

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
    { href: "/main/ai-researcher", label: "Researcher", icon: <SearchIcon className="h-5 w-5" /> },
    { href: "/main/ai-problem-solver", label: "Problem Solver", icon: <Brain className="h-5 w-5" /> },
    { href: "/main/ai-code-mentor", label: "Coding Help", icon: <Terminal className="h-5 w-5" /> },
    { href: "/main/ai-career-navigator", label: "Career Guide", icon: <Compass className="h-5 w-5" /> },
    { href: "/main/flashcards", label: "Flashcards", icon: <Layers className="h-5 w-5" /> },
    { href: "/main/ppt-generator", label: "Slide Maker", icon: <MonitorPlay className="h-5 w-5" /> },
    { href: "/main/quiz-generator", label: "Practice Quiz", icon: <FileQuestion className="h-5 w-5" /> },
    { href: "/main/playworld", label: "Break Hub", icon: <Gamepad2 className="h-5 w-5" /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/main/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="flex h-20 md:h-24 items-center gap-4 md:gap-6 border-b bg-background/60 backdrop-blur-xl px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-xl transition-all">
      <div className="flex items-center gap-4 md:gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden lg:flex rounded-2xl hover:bg-primary/10 transition-all hover:scale-110 active:scale-90 border-2 border-transparent"
          onClick={toggleSidebar}
        >
          <Menu className="h-7 w-7 text-primary" />
        </Button>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden rounded-xl border-2 hover:bg-primary/10 transition-all">
              <Menu className="h-6 w-6 text-primary" />
              <span className="sr-only">Toggle drawer</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col rounded-r-[3rem] border-r-8 border-primary/10 w-[300px] md:w-[340px] p-6 md:p-10 bg-background/95 backdrop-blur-3xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access all study tools, subjects, and resource hubs.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full pr-2">
              <nav className="grid gap-4 md:gap-6 text-lg font-medium pb-10">
                <Link
                  href="/main/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center mb-4 md:mb-6 transition-transform active:scale-95"
                >
                  <Logo />
                </Link>
                
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-4 md:gap-5 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-bold text-[13px] md:text-[14px]"
                  >
                    <span className="text-primary">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                <div className="my-2 md:my-4 border-t-2 border-primary/5">
                  <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase px-4 md:px-6 pt-4 tracking-widest">Resources</p>
                </div>
                
                {resourceLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-4 md:gap-5 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-bold text-[13px] md:text-[14px]"
                  >
                    <span className="text-primary">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                <div className="my-2 md:my-4 border-t-2 border-primary/5">
                  <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase px-4 md:px-6 pt-4 tracking-widest">AI Tools</p>
                </div>
                
                {aiToolsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-4 md:gap-5 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-bold text-[13px] md:text-[14px]"
                  >
                    <span className="text-primary">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto hidden md:flex">
        <form onSubmit={handleSearch} className="relative w-full group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, tasks..." 
            className="w-full bg-muted/30 border-4 border-transparent focus:border-primary/30 focus:bg-background h-14 pl-16 rounded-3xl font-serif italic text-xl tracking-tight shadow-inner transition-all placeholder:text-lg placeholder:font-serif placeholder:italic placeholder:opacity-40"
          />
          <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 hover:opacity-100 opacity-20 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-widest">Global</span>
            <Cpu className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="flex-1 md:hidden"></div>

      <div className="flex items-center gap-3 md:gap-6">
        <ThemeToggle />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl md:rounded-2xl hover:bg-primary/10 transition-all h-10 md:h-12 w-10 md:w-12 border-2 border-transparent">
                    <Bell className="h-5 md:h-6 w-5 md:w-6" />
                    {announcements.length > 0 && (
                      <span className="absolute top-2.5 md:top-3 right-2.5 md:right-3 h-2.5 md:h-3 w-2.5 md:w-3 bg-primary rounded-full border-2 md:border-4 border-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] md:w-[400px] rounded-[2rem] md:rounded-[3rem] border-4 border-primary/10 shadow-2xl p-0 mt-4 bg-background/95 backdrop-blur-3xl overflow-hidden">
                <DropdownMenuLabel className="font-black uppercase text-[10px] md:text-[11px] tracking-[0.4em] px-8 md:px-10 py-6 md:py-8 text-primary/60 border-b-2 border-primary/5 bg-primary/5">Notifications</DropdownMenuLabel>
                <ScrollArea className="max-h-[400px] md:max-h-[500px]">
                  <div className="p-4 space-y-2">
                    <DropdownMenuItem className="rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 cursor-default hover:bg-primary/5 transition-all border-4 border-transparent mb-2 outline-none">
                        <div className="flex gap-4 md:gap-5 items-start">
                            <div className="h-10 md:h-12 w-10 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
                              <Sparkles className="h-5 md:h-6 w-5 md:w-6 text-primary animate-float fill-primary/20" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="font-bold text-sm md:text-base text-primary uppercase tracking-tight">Welcome to StudySpark</p>
                                <p className="text-[12px] md:text-[13px] text-muted-foreground font-medium leading-relaxed">Let's make learning exciting together.</p>
                            </div>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="mx-6 bg-primary/5" />

                    {loading ? (
                      <div className="p-10 text-center opacity-30">
                        <Zap className="h-8 w-8 animate-bolt mx-auto text-primary" />
                      </div>
                    ) : announcements.length > 0 ? (
                      announcements.slice(0, 5).map((ann) => (
                        <DropdownMenuItem key={ann.id} asChild className="outline-none">
                          <Link href="/main/announcements" className="rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 cursor-pointer hover:bg-primary/5 transition-all border-4 border-transparent hover:border-primary/10 mb-2 block">
                            <div className="flex gap-4 md:gap-5 items-start">
                                <div className="h-10 md:h-12 w-10 md:w-12 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border-2 border-emerald-500/20">
                                  <Megaphone className="h-5 md:h-6 w-5 md:w-6 text-emerald-500 animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm md:text-base text-emerald-600 uppercase tracking-tight truncate">{ann.title}</p>
                                    <p className="text-[12px] md:text-[13px] text-muted-foreground font-medium leading-relaxed line-clamp-2">{ann.content}</p>
                                </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="py-16 text-center opacity-20 flex flex-col items-center gap-3">
                        <Bell className="h-8 w-8" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No New Notices</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </header>
  );
}
