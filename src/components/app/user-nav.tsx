
'use client';

import { useState, createContext, useContext, ReactNode, useEffect, useMemo } from "react";
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
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import Link from "next/link";
import { CheckCircle, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/provider";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

type UserNavContextType = {
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
  isAdmin: boolean;
};

const UserNavContext = createContext<UserNavContextType | undefined>(undefined);

export function UserNavProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'roles_admin', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: adminDoc } = useDoc(adminDocRef);

  const isAdmin = useMemo(() => !!adminDoc, [adminDoc]);

  return (
    <UserNavContext.Provider value={{ isVerified, setIsVerified, isAdmin }}>
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
  const { user } = useUser();
  const { isVerified } = useUserNav();
  const router = useRouter();
  const auth = useAuth();
  
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase() || 'U';

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error("Error signing out: ", error);
        // Optionally, show a toast message to the user
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/panel/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/panel/verify">
                {isVerified ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Shield className="mr-2 h-4 w-4" />}
                <span>Verificación</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout(); }}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
