"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/use-auth";
import Link from "next/link";
import { GraduationCap, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserNav() {
  const { user, userProfile, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border">
          <Avatar className="h-full w-full">
            <AvatarFallback className="bg-primary/5 text-primary">
              {userProfile?.profession === 'teacher' ? (
                <UserCheck className="h-5 w-5" />
              ) : (
                <GraduationCap className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {userProfile && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userProfile.firstName} {userProfile.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/main/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href="/main/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
