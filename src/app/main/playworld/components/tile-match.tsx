
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Brain, RotateCcw, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = ['⚛️', '🧬', '🧠', '🔬', '📚', '🧪', '📐', '🎓'];

export function TileMatch() {
  const [tiles, setTiles] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('tile-match-best');
    if (saved) setBestScore(parseInt(saved));
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon, flipped: false, matched: false }));
    setTiles(shuffled);
    setFlipped([]);
    setMoves(0);
  };

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || tiles[id].flipped || tiles[id].matched) return;
    
    const newTiles = [...tiles];
    newTiles[id].flipped = true;
    setTiles(newTiles);
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (tiles[first].icon === tiles[second].icon) {
        newTiles[first].matched = true;
        newTiles[second].matched = true;
        setTiles(newTiles);
        setFlipped([]);
        checkWin(newTiles);
      } else {
        setTimeout(() => {
          newTiles[first].flipped = false;
          newTiles[second].flipped = false;
          setTiles(newTiles);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const checkWin = (currentTiles: any[]) => {
    if (currentTiles.every(t => t.matched)) {
      if (moves + 1 < bestScore || bestScore === 0) {
        setBestScore(moves + 1);
        localStorage.setItem('tile-match-best', (moves + 1).toString());
      }
    }
  };

  return (
    <Card className="border-2 shadow-lg overflow-hidden flex flex-col h-full bg-purple-500/5">
      <CardHeader className="bg-purple-500 text-white py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Pattern Recall</CardTitle>
          </div>
          <div className="flex items-center gap-2 font-black text-xs">
            <Trophy className="h-4 w-4" />
            <span>Best: {bestScore || '--'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
        <div className="grid grid-cols-4 gap-2 mb-6">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleFlip(tile.id)}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl rounded-xl cursor-pointer transition-all duration-500 transform-gpu preserve-3d",
                tile.flipped || tile.matched ? "bg-white dark:bg-muted shadow-md rotate-y-180" : "bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500/20"
              )}
            >
              {(tile.flipped || tile.matched) ? tile.icon : '?'}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 w-full justify-between px-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Moves</p>
            <p className="text-2xl font-black tabular-nums">{moves}</p>
          </div>
          <Button variant="outline" size="sm" onClick={initGame} className="font-bold border-2 rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" /> REBOOT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
