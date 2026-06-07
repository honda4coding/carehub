'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import { User, AuthContextType } from '@/types/auth';
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME, USER_STORAGE_KEY } from '@/constants/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sync state with cookies and storage on mount
    const savedToken = Cookies.get(AUTH_COOKIE_NAME);
    const savedRole = Cookies.get(ROLE_COOKIE_NAME);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (savedToken && savedRole && savedUser) {
      setToken(savedToken);
      setRole(savedRole);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newRole: string, newUser: User) => {
    setToken(newToken);
    setRole(newRole);
    setUser(newUser);

    Cookies.set(AUTH_COOKIE_NAME, newToken, { expires: 7, secure: true, sameSite: 'strict', path: '/' });
    Cookies.set(ROLE_COOKIE_NAME, newRole, { expires: 7, secure: true, sameSite: 'strict', path: '/' });
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    router.push(`/${newRole}`);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
    Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });
    localStorage.removeItem(USER_STORAGE_KEY);

    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      token, 
      isAuthenticated: !!token, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
