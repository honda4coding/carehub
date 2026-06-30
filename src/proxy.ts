import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from './constants/auth';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const localeMatch = pathname.match(/^\/(ar|en)(\/|$)/);
  const localePrefix = localeMatch ? localeMatch[1] : '';
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/';

  // Handle protected route access control
  const protectedPaths = ['/admin', '/doctor', '/patient', '/assistant'];
  const isProtectedRoute = protectedPaths.some(path => 
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  if (isProtectedRoute) {
    if (!token) {
      const loginPath = pathWithoutLocale.startsWith('/admin') ? '/admin-login' : '/login';
      const redirectUrl = localePrefix ? `/${localePrefix}${loginPath}` : loginPath;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (role && !pathWithoutLocale.startsWith(`/${role}`)) {
      const redirectUrl = localePrefix ? `/${localePrefix}/${role}` : `/${role}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  const authPaths = ['/login', '/register', '/admin-login'];
  const isAuthRoute = authPaths.some(path => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`));
  
  if (isAuthRoute && token) {
    const redirectRole = role || 'patient';
    const redirectUrl = localePrefix ? `/${localePrefix}/${redirectRole}` : `/${redirectRole}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
