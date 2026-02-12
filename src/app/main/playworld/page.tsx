
"use client";

import React from 'react';
import { Gamepad2 } from "lucide-react";
import { SpeedMath } from "./components/speed-math";
import { ReactionBlitz } from "./components/reaction-blitz";
import { TileMatch } from "./components/tile-match";
import { MemoryMaster } from "./components/memory-master";
import { ColorMatch } from "./components/color-match";
import { WordScramble } from "./components/word-scramble";

export default function PlayworldPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="text-center">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Gamepad2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter">Offline Brain Hub</h1>
        <p className="text-xl text-muted-foreground font-medium mt-2">Zero latency. High intensity. Train your cognitive edge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SpeedMath />
        <ReactionBlitz />
        <TileMatch />
        <MemoryMaster />
        <ColorMatch />
        <WordScramble />
      </div>
    </div>
  );
}
