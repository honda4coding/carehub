'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

import { User, AuthContextType } from '@/types/auth';
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/constants/auth';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/services/pushNotificationService';
import { fetchClient } from '@/services/fetchClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sync state with cookies on mount
    const loadAuth = async () => {
      try {
        const savedToken = Cookies.get(AUTH_COOKIE_NAME);
        const savedRole = Cookies.get(ROLE_COOKIE_NAME);

        if (savedToken && savedRole) {
          setToken(savedToken);
          setRole(savedRole);

          // Fetch user profile securely via API using HTTP-only/secure cookies or the token
          const res = await fetchClient.get('/users/profile');
          if (res.data) {
            const fetchedUser = { ...res.data };
            // Ensure backend 'fullName' maps correctly to frontend 'name'
            if (res.data.fullName) {
              fetchedUser.name = res.data.fullName;
            }
            setUser(fetchedUser);
            // Subscribe to push notifications if authenticated
            subscribeToPushNotifications().catch(err => console.error("Push subscribe error on mount:", err));
          }
        } else {
          // No token or role means not authenticated
          setToken(null);
          setRole(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error("Auth hydration error:", error);
        // Fallback: clear bad data
        Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
        Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });
        setToken(null);
        setRole(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = (newToken: string, newRole: string, newUser: User, rememberMe: boolean = true) => {
    setToken(newToken);
    setRole(newRole);
    setUser(newUser);

    const cookieOptions: Cookies.CookieAttributes = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };

    if (rememberMe) {
      cookieOptions.expires = 7;
    }

    Cookies.set(AUTH_COOKIE_NAME, newToken, cookieOptions);
    Cookies.set(ROLE_COOKIE_NAME, newRole, cookieOptions);

    // Request push notification subscription upon login
    subscribeToPushNotifications().catch(err => console.error("Push subscribe error on login:", err));

    router.replace(`/${newRole}`);
  };

  const logout = async () => {
    // Unsubscribe from push notifications before clearing user data
    try {
      await unsubscribeFromPushNotifications();
    } catch (err) {
      console.error("Push unsubscribe error on logout:", err);
    }

    setToken(null);
    setRole(null);
    setUser(null);

    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
    Cookies.remove(ROLE_COOKIE_NAME, { path: '/' });

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

    window.location.href = '/login';
  };

  const updateUser = (partialUser: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...partialUser };
    });
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
      logout,
      updateUser
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
