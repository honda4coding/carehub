import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Defines the protected routes
const protectedRoutes = ['/(dashboard)', '/patient', '/doctor', '/admin', '/assistant'];
const authRoutes = ['/login', '/register', '/admin-login', '/forgot-password', '/reset-password', '/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route));

  // If trying to access a protected route without a token
  if (isProtectedRoute && !authToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If trying to access auth pages while already logged in
  if (isAuthRoute && authToken) {
    let dashboardPath = '/';
    
    switch (userRole) {
      case 'patient':
        dashboardPath = '/patient';
        break;
      case 'doctor':
        dashboardPath = '/doctor';
        break;
      case 'admin':
        dashboardPath = '/admin/analytics';
        break;
      case 'assistant':
        dashboardPath = '/assistant';
        break;
      default:
        dashboardPath = '/';
    }

    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Role-based route protection
  if (authToken && userRole) {
    // Determine the dashboard path for the current role
    let correctDashboard = '/';
    switch (userRole) {
      case 'patient': correctDashboard = '/patient'; break;
      case 'doctor': correctDashboard = '/doctor'; break;
      case 'admin': correctDashboard = '/admin/analytics'; break;
      case 'assistant': correctDashboard = '/assistant'; break;
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
    if (pathname.startsWith('/doctor') && userRole !== 'doctor') {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
    if (pathname.startsWith('/patient') && userRole !== 'patient') {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
    if (pathname.startsWith('/assistant') && userRole !== 'assistant') {
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json / manifest.ts
     * - images, icons, logos in public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest|icons|images|logos|sw.js).*)',
  ],
};
