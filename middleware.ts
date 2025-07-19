// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Cookie-dən 'token'i götürürük.
    // httpOnly cookie-lərə yalnız server tərəfdə (middleware kimi) daxil olmaq mümkündür.
    const token = request.cookies.get('token'); 

    // Qorunmalı olan URL yolları.
    // '/workspace' ilə başlayan bütün yollar qorunacaq.
    const protectedPaths = ['/workspace']; 

    // Cari sorğunun URL-inin qorunan yollardan biri olub-olmadığını yoxlayırıq.
    const isProtectedPath = protectedPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );

    // Əgər istifadəçi qorunan bir yola daxil olmağa çalışırsa
    if (isProtectedPath) {
        // Və əgər token yoxdursa (yəni istifadəçi login olmayıbsa)
        if (!token) {
            // Onu login səhifəsinə yönləndir
            const loginUrl = new URL('/auth/login', request.url);
            // Query parametri əlavə edirik ki, login səhifəsində bildiriş verə bilək
            loginUrl.searchParams.set('alert', 'not-logged-in'); 
            return NextResponse.redirect(loginUrl);
        }
        // Əgər token varsa, Middleware sorğunun davam etməsinə icazə verir.
        // Tokenin etibarlılığını (məsələn, vaxtının bitib-bitmədiyini) burada yoxlamaq olar,
        // lakin bu, hər sorğuda əlavə bir API çağırışı tələb edə bilər.
        // Adətən token validasiyası backend API endpointlərində edilir.
    }

    // Əgər yol qorunmur və ya istifadəçi artıq authenticated-dirsə, sorğunu davam etdir.
    return NextResponse.next();
}

// Middleware-in hansı yollarda işə düşəcəyini müəyyənləşdirən konfiqurasiya.
// "/workspace" ilə başlayan bütün yollar üçün middleware-i aktivləşdirir.
export const config = {
    matcher: ['/workspace/:path*'], 
    // Əgər başqa qorunan səhifələr (məsələn, '/dashboard') varsa, onları da bura əlavə et:
    // matcher: ['/workspace/:path*', '/dashboard/:path*'],
};