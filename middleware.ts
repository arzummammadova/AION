import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware işə düşdü, path:', request.nextUrl.pathname);

  // Test üçün sadə redirect: /workspace-dən hər zaman /auth/login-ə yönləndir
  if (request.nextUrl.pathname.startsWith('/workspace')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace/:path*', '/workspace'],
};
