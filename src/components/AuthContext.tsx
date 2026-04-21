"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Role } from "@/core/auth/auth.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasRole: (roles: Role[]) => boolean;
  toggleRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial mock login
    const mockUser: User = {
      id: "usr_123",
      name: "Dr. User",
      email: "user@medpulse.io",
      role: Role.STUDENT,
    };
    
    // eslint-disable-next-line
    setUser(mockUser);
    document.cookie = `user-role=${mockUser.role}; path=/`; 
    setIsLoading(false);
  }, []);

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const toggleRole = (role: Role) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, role };
      document.cookie = `user-role=${role}; path=/`;
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, hasRole, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
