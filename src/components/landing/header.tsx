"use client"

import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-all h-20 flex items-center">
      <div className="container flex items-center justify-between">
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
                  "relative py-2 text-sm font-semibold transition-colors hover:text-primary group",
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
            <Button variant="ghost" asChild className="font-bold text-sm h-10 px-5 rounded-xl">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="font-bold text-sm h-10 px-6 rounded-xl shadow-lg hover:scale-105 transition-all animate-pulse-glow">
              <Link href="/signup">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
