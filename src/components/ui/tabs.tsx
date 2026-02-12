
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-16 items-center justify-center rounded-[2.5rem] bg-muted/50 p-2 text-muted-foreground backdrop-blur-2xl border-4 border-primary/10 shadow-[inset_0_2px_20px_rgba(0,0,0,0.1),0_10px_40px_-10px_rgba(0,0,0,0.2)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[1.8rem] px-8 py-2.5 text-base font-bold transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "text-foreground/90 data-[state=active]:text-foreground data-[state=active]:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] data-[state=active]:scale-[1.05] hover:scale-[1.02] active:scale-95 group",
      "data-[state=inactive]:opacity-100 data-[state=inactive]:hover:bg-primary/5",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-8 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in slide-in-from-bottom-6 duration-700 cubic-bezier(0.22, 1, 0.36, 1)",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
