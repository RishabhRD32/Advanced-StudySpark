
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Maximize2, X, Delete, Eraser, Move, Cpu, Sparkles } from "lucide-react";
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
      const result = eval(fullEquation.replace(/[^-()\d/*+.]/g, ''));
      setDisplay(String(result));
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
    <div className={cn("grid grid-cols-4 gap-2.5", isFloating ? "p-8" : "p-0")}>
      <div className="col-span-4 bg-muted/30 p-6 rounded-[1.5rem] mb-4 text-right border-4 border-primary/5 shadow-inner group/display">
        <div className="text-[10px] font-black text-muted-foreground/40 uppercase h-4 truncate tracking-widest">{equation}</div>
        <div className="text-4xl font-black tabular-nums truncate text-foreground/90 transition-transform group-hover/display:scale-[1.02]">{display}</div>
      </div>

      {/* Function Row */}
      <Button variant="outline" onClick={() => handleFunction('sin')} className="font-black text-[9px] uppercase h-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all">sin</Button>
      <Button variant="outline" onClick={() => handleFunction('cos')} className="font-black text-[9px] uppercase h-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all">cos</Button>
      <Button variant="outline" onClick={() => handleFunction('tan')} className="font-black text-[9px] uppercase h-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all">tan</Button>
      <Button variant="secondary" onClick={clear} className="font-black text-[10px] uppercase h-14 rounded-2xl border-2 border-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all">AC</Button>

      {/* Controls Row */}
      <Button variant="outline" onClick={() => handleFunction('sqrt')} className="font-black text-[10px] h-14 rounded-2xl border-2">√</Button>
      <Button variant="outline" onClick={() => handleFunction('pow2')} className="font-black text-[10px] h-14 rounded-2xl border-2">x²</Button>
      <Button variant="outline" onClick={() => handleFunction('log')} className="font-black text-[9px] uppercase h-14 rounded-2xl border-2">log</Button>
      <Button variant="secondary" onClick={deleteLast} className="h-14 rounded-2xl border-2 hover:bg-primary/10 transition-all"><Delete className="h-5 w-5" /></Button>

      {/* Number Grid */}
      {[7, 8, 9].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-2xl font-black h-14 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('/')} className="font-black text-2xl h-14 rounded-2xl border-2 bg-primary/5 text-primary">÷</Button>

      {[4, 5, 6].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-2xl font-black h-14 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('*')} className="font-black text-2xl h-14 rounded-2xl border-2 bg-primary/5 text-primary">×</Button>

      {[1, 2, 3].map(n => (
        <Button key={n} variant="ghost" onClick={() => handleNumber(String(n))} className="text-2xl font-black h-14 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">{n}</Button>
      ))}
      <Button variant="outline" onClick={() => handleOperator('-')} className="font-black text-2xl h-14 rounded-2xl border-2 bg-primary/5 text-primary">−</Button>

      <Button variant="ghost" onClick={() => handleNumber('0')} className="text-2xl font-black h-14 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">0</Button>
      <Button variant="ghost" onClick={() => handleNumber('.')} className="text-2xl font-black h-14 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">.</Button>
      <Button variant="default" onClick={calculate} className="bg-primary text-white font-black text-2xl h-14 rounded-2xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)] active:scale-95 transition-all">=</Button>
      <Button variant="outline" onClick={() => handleOperator('+')} className="font-black text-2xl h-14 rounded-2xl border-2 bg-primary/5 text-primary">+</Button>
    </div>
  );

  return (
    <Card className="border-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden group/calc rounded-[2.5rem]">
      <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b-2 border-primary/5 py-6 px-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Lab Core</CardTitle>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Scientific Logic Unit</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary transition-all active:scale-90">
              <Maximize2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[450px] p-0 border-8 border-primary/10 rounded-[3.5rem] overflow-hidden bg-background/95 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="bg-primary/5 border-b-4 border-primary/5 p-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="h-8 w-8 text-primary animate-float" />
                <div>
                  <DialogTitle className="font-black uppercase tracking-[0.4em] text-[12px] text-primary">Scientific Studio</DialogTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">Advanced Mathematics Suite</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500/40" />
                <span className="h-2 w-2 rounded-full bg-amber-500/40" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/40" />
              </div>
            </div>
            <CalculatorLayout isFloating />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-10">
        <CalculatorLayout />
      </CardContent>
    </Card>
  );
}
