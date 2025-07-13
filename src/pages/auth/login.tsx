'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { LoginInput, loginSchema } from '@/schema/auth';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // Add dark mode state

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    // Load user theme from localStorage on component mount
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }

        // Check for alert query parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('alert') === 'not-logged-in') {
            alert("Zəhmət olmasa daxil olun (login olun)!");
            router.replace('/auth/login', undefined, { shallow: true });
        }
    }, [router]);

    const onSubmit = async (data: LoginInput) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            );

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Xəta baş verdi');
            router.push('/workspace');
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Define dynamic classes based on dark mode state
    const bgColorClass = isDarkMode ? "bg-black" : "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center";
    const textColorClass = isDarkMode ? "text-white" : "text-black";
    const titleTextColorClass = isDarkMode ? "text-white" : "text-black";
    const formBgClass = isDarkMode ? "bg-gray-800" : "bg-white";
    const formShadowClass = isDarkMode ? "shadow-lg" : "shadow-sm";
    const labelTextColorClass = isDarkMode ? "text-gray-300" : "text-gray-700";
    const inputBorderClass = isDarkMode ? "border-gray-600 focus:ring-yellow-600" : "border-gray-200 focus:ring-yellow-500";
    const buttonBgClass = isDarkMode ? "bg-amber-600 hover:bg-amber-700" : "bg-black hover:bg-yellow-600";
    const linkTextColorClass = isDarkMode ? "text-amber-400 hover:text-amber-500" : "text-black hover:text-yellow-600";
    const placeholderColorClass = isDarkMode ? "placeholder-gray-400" : "placeholder-gray-500";


    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${bgColorClass} ${textColorClass}`}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light mb-2">
                        <span className="text-amber-200">Login to</span>
                        <span className={`font-bold ml-1 ${titleTextColorClass}`}>AION</span>
                    </h2>
                    <p className="text-gray-500">Welcome back to your AI workspace</p>
                </div>

                <div className={`${formBgClass} rounded-lg ${formShadowClass} p-8`}>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className={`block text-sm font-medium mb-1 ${labelTextColorClass}`}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email')}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${inputBorderClass} ${textColorClass} ${formBgClass} ${placeholderColorClass}
                                    ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                                `}
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
                                className={`block text-sm font-medium mb-1 ${labelTextColorClass}`}
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('password')}
                                className={`w-full px-4 py-2 border rounded-md pr-10 focus:outline-none focus:ring-1 ${inputBorderClass} ${textColorClass} ${formBgClass} ${placeholderColorClass}
                                    ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                                `}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className={`absolute right-3 top-9 text-gray-400 ${isDarkMode ? 'hover:text-amber-400' : 'hover:text-yellow-600'}`}
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
                            className={`w-full ${buttonBgClass} text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-50`}
                        >
                            {isSubmitting ? 'Loading…' : 'Log In'}
                        </button>
                    </form>

                    <Link
                        className={`text-sm flex justify-end mt-3 ${linkTextColorClass}`}
                        href="/auth/forgotpassword"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    );
}