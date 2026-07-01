'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

import { User, AuthContextType } from '@/types/auth';
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME, USER_STORAGE_KEY } from '@/constants/auth';
import { subscribeToPushNotifications } from '@/services/pushNotificationService';
import { fetchClient } from '@/services/fetchClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sync state with cookies and storage on mount
    try {
      const savedToken = Cookies.get(AUTH_COOKIE_NAME);
      const savedRole = Cookies.get(ROLE_COOKIE_NAME);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (savedToken && savedRole && savedUser && savedUser !== 'undefined') {
        setToken(savedToken);
        setRole(savedRole);
        setUser(JSON.parse(savedUser));
        // Subscribe to push notifications on mount if authenticated
        subscribeToPushNotifications().catch(err => console.error("Push subscribe error on mount:", err));
        
        // Background fetch to update user permissions (without blocking hydration)
        fetchClient.get('/users/profile')
          .then(res => {
            if (res.data) {
              const updatedUser = { ...JSON.parse(savedUser), ...res.data };
              // Ensure backend 'fullName' maps correctly to frontend 'name'
              if (res.data.fullName) {
                updatedUser.name = res.data.fullName;
              }
              setUser(updatedUser);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            }
          })
          .catch(err => {
            console.error("Failed to fetch updated profile:", err);
            if (err.message.includes("jwt") || err.message.includes("expired") || err.message.includes("401")) {
              Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
              Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });
              localStorage.removeItem(USER_STORAGE_KEY);
              setToken(null);
              setRole(null);
              setUser(null);
              router.push('/login');
            }
          });
      }
    } catch (error) {
      console.error("Auth hydration error:", error);
      // Fallback: clear bad data
      Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
      Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newRole: string, newUser: User) => {
    setToken(newToken);
    setRole(newRole);
    setUser(newUser);

    Cookies.set(AUTH_COOKIE_NAME, newToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
    Cookies.set(ROLE_COOKIE_NAME, newRole, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    // Request push notification subscription upon login
    subscribeToPushNotifications().catch(err => console.error("Push subscribe error on login:", err));

    router.replace(`/${newRole}`);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
    Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });
    localStorage.removeItem(USER_STORAGE_KEY);

    // Clear Service Worker runtime caches but keep precaches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (!name.includes('precache')) {
            caches.delete(name);
          }
        });
      });
    }

    // Clear IndexedDB for offline tracking
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('carehub-db');
    }

    router.replace('/login');
  };

  // Client-side route guard for cached back-navigations
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && token && role) {
      const authPaths = ['/login', '/register', '/admin-login'];
      if (authPaths.includes(pathname)) {
        router.replace(`/${role}`);
      }
    }
  }, [pathname, token, role, isLoading, router]);

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
