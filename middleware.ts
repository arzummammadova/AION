// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("🛡 Middleware işə düşdü:", request.nextUrl.pathname);

  const token = request.cookies.get("token");

  if (!token && request.nextUrl.pathname.startsWith("/workspace")) {
    console.log("⛔ Token yoxdur, yönləndirilir!");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*"], // ✅ matcher tam olsun
};
