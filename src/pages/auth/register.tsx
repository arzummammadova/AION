"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setTheme } from '@/redux/features/themeSlice';
import {  useToast } from 'arzu-toast-modal';

interface FormData {
  username: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { showToast } = useToast(); // toast funksiyası

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      dispatch(setTheme(true));
    } else {
      dispatch(setTheme(false));
    }
  }, [dispatch]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!form.username.trim()) {
      newErrors.username = 'İstifadəçi adı boş ola bilməz';
    } else if (form.username.length < 3) {
      newErrors.username = 'İstifadəçi adı ən azı 3 simvol olmalıdır';
    } else if (form.username.length > 20) {
      newErrors.username = 'İstifadəçi adı maksimum 20 simvol ola bilər';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email boş ola bilməz';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Düzgün email daxil edin';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/~`]).{8,20}$/;
    if (!form.password.trim()) {
      newErrors.password = 'Şifrə boş ola bilməz';
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        'Şifrə ən azı 1 böyük hərf, 1 rəqəm və 1 simvol içerməli və 8-20 simvol arası olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.id]: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validate()) return;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, form);

      // setMessage(res.data.message);

      showToast({
        type: 'success',
        title: 'Ugurlu',
        message:res.data.message,
        duration: 3000,
        position: 'top-right',
      });
      setForm({ username: '', email: '', password: '' });
    } catch (err: any) {
      // setMessage(err.response?.data?.message || 'Xəta baş verdi');
      showToast({
        type: 'error',
        title: 'error',
        message: err.response?.data?.message,
        duration: 1000,
        position: 'top-right',
      });
    }
  };

  const containerBgClass = "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center";
  const overlayClass = isDarkMode ? "bg-black bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center" : "bg-transparent"; // Dark mode-da overlay əlavə etdim
  const titleColorClass = isDarkMode ? "text-white" : "text-black";
  const subtitleColorClass = isDarkMode ? "text-gray-300" : "text-gray-500";
  const formBgClass = isDarkMode ? "bg-gray-800" : "bg-white"; // Login.tsx-ə uyğun gəlir
  const formShadowClass = isDarkMode ? "shadow-lg" : "shadow-sm";
  const labelColorClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  const inputBgClass = isDarkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500";
  const inputBorderFocusClass = isDarkMode ? "border-gray-600 focus:ring-amber-500" : "border-gray-200 focus:ring-black"; // Login.tsx-ə uyğun gəlir
  const passwordToggleIconColorClass = isDarkMode ? "text-gray-400 hover:text-amber-400" : "text-gray-400 hover:text-black"; // Login.tsx-ə uyğun gəlir
  // Düymə rəngi Login səhifəsinin düymə rənginə uyğunlaşdırıldı
  const buttonBgClass = isDarkMode ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-800 text-white"; 
  const messageColorClass = isDarkMode ? "text-green-400" : "text-green-600";
  // Link rəngi Login səhifəsinin link rənginə uyğunlaşdırıldı
  const linkColorClass = isDarkMode ? "text-amber-400 hover:text-amber-500" : "text-black hover:text-gray-700"; 
  const errorTextColorClass = isDarkMode ? "text-red-400" : "text-red-500";


  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${containerBgClass}`}>
      <div className={`absolute inset-0 ${overlayClass}`}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-light text-violet-400 mb-2`}>
            Sign up to <span className={`font-bold ${titleColorClass}`}>AION</span>
          </h2>
          <p className={`${subtitleColorClass}`}>Your AI workspace</p>
        </div>

        <div className={`${formBgClass} rounded-lg ${formShadowClass} p-8`}>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-1 ${labelColorClass}`}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${inputBgClass} ${inputBorderFocusClass} ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.username && <p className={`text-sm mt-1 ${errorTextColorClass}`}>{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${labelColorClass}`}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${inputBgClass} ${inputBorderFocusClass} ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.email && <p className={`text-sm mt-1 ${errorTextColorClass}`}>{errors.email}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${labelColorClass}`}>
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder='••••••••'
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 pr-10 ${inputBgClass} ${inputBorderFocusClass} ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-9 ${passwordToggleIconColorClass}`}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && <p className={`text-sm mt-1 ${errorTextColorClass}`}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              className={`w-full bg-violet-400 text-white text-lg py-2.5 rounded-md font-medium transition-colors`}
            >
              Register
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-sm font-medium ${messageColorClass}`}>{message}</p>
          )}

          <div className={`mt-6 text-center text-sm ${subtitleColorClass}`}>
            Already have an account?{' '}
            <Link href="/auth/login" className={`font-medium ${linkColorClass}`}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;