"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#search", label: "Library" },
  { href: "/#feedback", label: "Feedback" },
  { href: "/contact", label: "Contact" },
];

export function LandingHeader() {
  const [activeLink, setActiveLink] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 transition-all duration-500 pointer-events-none">
      <div className={cn(
        "container flex items-center justify-between h-16 md:h-20 px-6 md:px-10 rounded-full transition-all duration-500 pointer-events-auto border-2 border-transparent",
        isScrolled 
          ? "bg-background/70 backdrop-blur-2xl border-primary/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-5xl" 
          : "bg-transparent max-w-full"
      )}>
        <div className="flex items-center gap-10">
          <Link href="/" className="hover:scale-105 transition-transform">
            <Logo />
          </Link>
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={cn(
                  "relative py-2 text-[11px] font-black uppercase tracking-widest transition-colors hover:text-primary group",
                  activeLink === link.label ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                  activeLink === link.label && "w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center space-x-3">
            <Button variant="ghost" asChild className="font-black uppercase text-[10px] tracking-widest h-10 px-5 rounded-full">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="font-black uppercase text-[10px] tracking-[0.2em] h-10 px-8 rounded-full shadow-lg hover:scale-105 transition-all animate-pulse-glow">
              <Link href="/signup">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}