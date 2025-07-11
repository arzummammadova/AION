// src/pages/auth/login.tsx
'use client';

import React, { useState, useEffect } from 'react'; // useEffect-i əlavə edin
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // Next.js 13+ App Router üçün 'next/navigation'
import { LoginInput, loginSchema } from '@/schema/auth';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    // --- YENİ ƏLAVƏ EDİLMİŞ HİSSƏ: Query parametrini yoxla ---
    useEffect(() => {
        if (typeof window !== 'undefined') { // Client tərəfində işlədiyindən əmin olun
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('alert') === 'not-logged-in') {
                alert("Zəhmət olmasa daxil olun (login olun)!");
                // Mesaj göstərildikdən sonra URL-i təmizləmək üçün
                router.replace('/auth/login', undefined, { shallow: true });
            }
        }
    }, [router]); // router asılılıq siyahısına əlavə edildi

    const onSubmit = async (data: LoginInput) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // cookie alacaqsansa
                    body: JSON.stringify(data),
                }
            );

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Xəta baş verdi');
            // uğurlu giriş
            router.push('/workspace'); // Login uğurlu olduqda /workspace səhifəsinə yönləndir
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light text-amber-200 mb-2">
                        Login to <span className="font-bold text-white">AION</span>
                    </h2>
                    <p className="text-gray-500">Welcome back to your AI workspace</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email')}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-yellow-500'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('password')}
                                className={`w-full px-4 py-2 border rounded-md pr-10 focus:outline-none focus:ring-1 ${
                                    errors.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:ring-yellow-500'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-yellow-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Loading…' : 'Log In'}
                        </button>
                    </form>

                    <Link
                        className="text-sm flex justify-end mt-3"
                        href="/auth/forgotpassword"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    );
}