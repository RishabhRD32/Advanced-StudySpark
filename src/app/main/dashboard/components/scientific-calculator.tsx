
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Maximize2, X, Delete, Eraser, Move, Cpu, Sparkles, Hash, Binary } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleNumber = (num: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
  };

  const handleFunction = (fn: string) => {
    try {
      const val = parseFloat(display);
      let result = 0;
      switch (fn) {
        case 'sin': result = Math.sin(val * (Math.PI / 180)); break;
        case 'cos': result = Math.cos(val * (Math.PI / 180)); break;
        case 'tan': result = Math.tan(val * (Math.PI / 180)); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'exp': result = Math.exp(val); break;
        case 'pow2': result = Math.pow(val, 2); break;
        default: return;
      }
      setDisplay(result.toFixed(4).replace(/\.?0+$/, ""));
    } catch (e) {
      setDisplay("Error");
    }
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // STRONGER SANITIZATION: Only allow safe math tokens
      const allowed = /^[0-9+\-*/().\s]*$/;
      if (!allowed.test(fullEquation)) {
        setDisplay("SafeError");
        return;
      }
      
      // Use Function constructor instead of eval for slightly better safety/scoping
      const result = new Function(`return ${fullEquation}`)();
      
      if (result === Infinity || isNaN(result)) {
        setDisplay("LimitError");
      } else {
        // Format large numbers or precise decimals
        const formatted = Number(result).toFixed(4).replace(/\.?0+$/, "");
        setDisplay(String(formatted));
      }
      setEquation("");
    } catch (e) {
      setDisplay("Error");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const CalculatorLayout = ({ isFloating = false }: { isFloating?: boolean }) => (
    <div className={cn("grid grid-cols-4 gap-2", isFloating ? "p-8" : "p-0")}>
      <div className="col-span-4 bg-[#1a1a1a] p-6 rounded-2xl mb-4 text-right border-4 border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group/display">
        <div className="text-[9px] font-black text-emerald-500/40 uppercase h-4 truncate tracking-[0.2em] mb-1">{equation}</div>
        <div className="text-4xl font-black tabular-nums truncate text-emerald-400 font-mono tracking-tighter transition-all group-hover/display:brightness-125">
          {display}
        </div>
      </div>

      {/* Function Row */}
      <div className="col-span-4 grid grid-cols-4 gap-2 mb-2">
        <Button variant="outline" onClick={() => handleFunction('sin')} className="font-black text-[9px] uppercase h-10 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all">sin</Button>
        <Button variant="outline" onClick={() => handleFunction('cos')} className="font-black text-[9px] uppercase h-10 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all">cos</Button>
        <Button variant="outline" onClick={() => handleFunction('tan')} className="font-black text-[9px] uppercase h-10 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all">tan</Button>
        <Button variant="outline" onClick={() => handleFunction('sqrt')} className="font-black text-xs h-10 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all">√</Button>
      </div>

      {/* Controls Row */}
      <Button variant="secondary" onClick={clear} className="col-span-2 font-black text-[10px] uppercase h-12 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white">Clear Entry</Button>
      <Button variant="secondary" onClick={deleteLast} className="h-12 rounded-xl border-2 hover:bg-primary/10 transition-all"><Delete className="h-4 w-4" /></Button>
      <Button variant="outline" onClick={() => handleOperator('/')} className="font-black text-xl h-12 rounded-xl border-2 bg-primary/5 text-primary">÷</Button>

      {/* Number Grid */}
      {[7, 8, 9].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-xl font-black h-14 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('*')} className="font-black text-xl h-14 rounded-xl border-2 bg-primary/5 text-primary">×</Button>

      {[4, 5, 6].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-xl font-black h-14 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('-')} className="font-black text-xl h-14 rounded-xl border-2 bg-primary/5 text-primary">−</Button>

      {[1, 2, 3].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-xl font-black h-14 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('+')} className="font-black text-xl h-14 rounded-xl border-2 bg-primary/5 text-primary">+</Button>

      <Button variant="ghost" onClick={() => handleNumber('0')} className="col-span-2 text-xl font-black h-14 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">0</Button>
      <Button variant="ghost" onClick={() => handleNumber('.')} className="text-xl font-black h-14 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">.</Button>
      <Button variant="default" onClick={calculate} className="bg-primary text-white font-black text-xl h-14 rounded-xl shadow-[0_10px_20px_-5px_hsla(var(--primary),0.4)] active:scale-95 transition-all">=</Button>
    </div>
  );

  return (
    <Card className="border-2 shadow-2xl overflow-hidden group/calc rounded-[2.5rem] bg-card/40 backdrop-blur-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b-2 border-primary/5 py-6 px-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-background rounded-xl flex items-center justify-center shadow-sm border">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Logic Core</CardTitle>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Scientific Engine</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary transition-all">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[450px] p-0 border-8 border-primary/10 rounded-[3.5rem] overflow-hidden bg-background shadow-2xl">
            <div className="bg-primary/5 border-b-4 border-primary/5 p-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="h-8 w-8 text-primary animate-float" />
                <div>
                  <DialogTitle className="font-black uppercase tracking-[0.4em] text-[12px] text-primary">Scientific Studio</DialogTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Professional Math Hub</p>
                </div>
              </div>
            </div>
            <CalculatorLayout isFloating />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-8 flex-1 flex flex-col justify-center">
        <CalculatorLayout />
      </CardContent>
    </Card>
  );
}
