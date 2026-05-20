import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from './constants/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register', '/admin-login'];
  if (authPaths.includes(pathname) && token && role) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // Handle protected route access control
  const protectedPaths = ['/admin', '/doctor', '/patient'];
  const isProtectedRoute = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedRoute) {
    // Redirect unauthenticated users to login
    if (!token) {
      const loginPath = pathname.startsWith('/admin') ? '/admin-login' : '/login';
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    // Role-based access control: Redirect to assigned dashboard if unauthorized
    if (role && !pathname.startsWith(`/${role}`)) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

// Middleware path configuration
export const config = {
  matcher: [
    
    '/doctor/:path*',
    '/patient/:path*',
    '/login',
    '/register',
    '/admin-login',
  ],
};
