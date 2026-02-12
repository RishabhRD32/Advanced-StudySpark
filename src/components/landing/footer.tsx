import { Logo } from "@/components/logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer id="footer" className="bg-background dark:bg-[#050505] border-t-2 border-primary/5 pt-24 pb-12 animate-in fade-in duration-1000">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2 space-y-8 text-center md:text-left animate-in slide-in-from-left-4 duration-1000">
            <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
              <Logo className="scale-125 origin-left" />
            </Link>
            <p className="text-muted-foreground max-w-sm mx-auto md:mx-0 leading-relaxed font-medium text-lg">
              The next generation of academic help. Built for students and teachers who want to succeed faster.
            </p>
          </div>
          
          <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000 delay-200">
            <h4 className="font-bold uppercase text-xs tracking-[0.2em] text-primary/60">Features</h4>
            <ul className="space-y-5">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-semibold">AI Tutor</Link></li>
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Summarizer</Link></li>
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Planner</Link></li>
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Practice Quiz</Link></li>
            </ul>
          </div>

          <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000 delay-300">
            <h4 className="font-bold uppercase text-xs tracking-[0.2em] text-primary/60">Help</h4>
            <ul className="space-y-5">
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors font-semibold">FAQs</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-semibold">How it Works</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Support</Link></li>
              <li><Link href="#search" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Library</Link></li>
            </ul>
          </div>

          <div className="space-y-8 text-center md:text-left animate-in fade-in duration-1000 delay-400">
            <h4 className="font-bold uppercase text-xs tracking-[0.2em] text-primary/60">Company</h4>
            <ul className="space-y-5">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-semibold">About Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Privacy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Terms</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-primary/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 StudySpark. All rights reserved. <br className="md:hidden" />
            Designed by <span className="text-foreground font-bold tracking-tight uppercase">Rishabdev Tripathi</span>.
          </p>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
