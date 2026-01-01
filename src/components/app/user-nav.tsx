
'use client';

import { useState, createContext, useContext, ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { user as mockUser } from "@/lib/data";
import Link from "next/link";
import { CheckCircle, Shield, User } from "lucide-react";

type UserNavContextType = {
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
};

const UserNavContext = createContext<UserNavContextType | undefined>(undefined);

export function UserNavProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(true);
  return (
    <UserNavContext.Provider value={{ isVerified, setIsVerified }}>
      {children}
    </UserNavContext.Provider>
  );
}

export function useUserNav() {
  const context = useContext(UserNavContext);
  if (!context) {
    throw new Error("useUserNav must be used within a UserNavProvider");
  }
  return context;
}

export function UserNav() {
  const user = mockUser;
  const { isVerified } = useUserNav();
  
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || user.email || 'User'} />}
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/verify">
                {isVerified ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Shield className="mr-2 h-4 w-4" />}
                <span>Verificación</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
