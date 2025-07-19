// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // httpOnly cookie-lərə yalnız server tərəfindən daxil olmaq mümkündür.
    // Middleware server tərəfdə işlədiyi üçün cookie-yə birbaşa daxil ola bilirik.
    const token = request.cookies.get('token'); 

    // Qorunmalı olan yollar
    const protectedPaths = ['/workspace']; 

    // Əgər istifadəçi qorunan bir yola daxil olmağa çalışırsa
    if (protectedPaths.includes(request.nextUrl.pathname)) {
        // Və əgər token yoxdursa
        if (!token) {
            // Onu login səhifəsinə yönləndir
            return NextResponse.redirect(new URL('/auth/login?alert=not-logged-in', request.url));
        }
        // Əlavə olaraq, burada tokenin etibarlılığını (validliyini) yoxlamaq üçün
        // bir API çağırışı da edə bilərsən. Bu, tokenin saxta olub-olmadığını yoxlayacaq.
        // Məsələn:
        // const isValid = await verifyToken(token.value); // Backend-də tokeni yoxlayan funksiya
        // if (!isValid) {
        //     return NextResponse.redirect(new URL('/auth/login?alert=invalid-token', request.url));
        // }
    }

    // Hər şey qaydasındadırsa, sorğunu davam etdir (səhifənin yüklənməsinə icazə ver)
    return NextResponse.next();
}

// Middleware-in hansı yollarda aktiv olacağını müəyyənləşdir
export const config = {
    matcher: [
        '/workspace/:path*', // /workspace və bütün alt yolları qoru
        // '/api/:path*',     // Əgər API yollarını da middleware ilə qorumaq istəyirsənsə, bunu əlavə et
    ],
};