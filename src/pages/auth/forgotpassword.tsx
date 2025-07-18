"use client";
import { setTheme, toggleTheme } from '@/redux/features/themeSlice'; // toggleTheme-ə ehtiyac yoxdur bu səhifədə, amma ziyanı yoxdur
import { forgotPasswordUser } from '@/redux/features/userSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { forgotPasswordUserSchema } from '@/schema/auth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod';


const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string }>({});
  const { loading, error } = useSelector((state: RootState) => state.user);
  const { isDarkMode } = useSelector((state: RootState) => state.theme); // isDarkMode-u Redux-dan alırıq

  // Dark mode-u local storage-dan yükləyib Redux state-i set etmək
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      dispatch(setTheme(true)); // Redux state-i dark olaraq set et
    } else {
      dispatch(setTheme(false)); // Redux state-i light olaraq set et
    }
  }, [dispatch]);

  // handleToggleDarkMode funksiyası bu komponentdə lazım deyil, çünki burada tema keçid düyməsi yoxdur.
  // Bu səbəbdən onu silə bilərik.
  // const handleToggleDarkMode = () => {
  //   dispatch(toggleTheme());
  // };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      const validatedData = forgotPasswordUserSchema.parse({ email });
      const resultAction = await dispatch(forgotPasswordUser(validatedData.email));

      if (forgotPasswordUser.fulfilled.match(resultAction)) {
        alert("Emailinizə OTP kodu göndərildi ✅");
        setEmail('');
      } else if (forgotPasswordUser.rejected.match(resultAction)) {
        alert(resultAction.payload || 'Şifrə sıfırlama sorğusu uğursuz oldu.');
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        const newErrors: { email?: string } = {};
        err.errors.forEach(issue => {
          if (issue.path[0] === 'email') {
            newErrors.email = issue.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        console.error("Şifrə sıfırlama xətası:", err);
        alert(err.message || 'Nəsə yanlış getdi!');
      }
    }
  };

  // Dinamik sinifləri təyin edirik
  const containerBgClass = isDarkMode ? "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center bg-black" : "bg-[url('/images/aionbg.png')] bg-no-repeat bg-cover bg-center";
  const titleColorClass = isDarkMode ? "text-white" : "text-black";
  const subtitleColorClass = isDarkMode ? "text-white" : "text-gray-500";
  const formBgClass = isDarkMode ? "bg-gray-800" : "bg-white";
  const formShadowClass = isDarkMode ? "shadow-lg" : "shadow-sm"; // Shadow-lg dark mode-da daha yaxşı görünə bilər
  const labelColorClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  const inputBgClass = isDarkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500";
  const inputBorderFocusClass = isDarkMode ? "border-gray-600 focus:ring-amber-500" : "border-gray-200 focus:ring-yellow-500";
  const buttonBgClass = isDarkMode ? "bg-violet-400 hover:bg-amber-700" : "bg-black hover:bg-violet-600";
  const linkColorClass = isDarkMode ? "text-amber-400 hover:underline" : "text-yellow-600 hover:underline";
  const errorTextColorClass = isDarkMode ? "text-red-400" : "text-red-500";


  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${containerBgClass}`}>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className={`text-3xl font-light text-amber-200 mb-2`}>
            Forgot Password for <span className={`font-bold ${titleColorClass}`}>AION</span>
          </h2>
          <p className={`${subtitleColorClass}`}>Emailinizi daxil edin şifrənizi sıfırlamaq üçün</p>
        </div>

        <div className={`${formBgClass} rounded-lg ${formShadowClass} p-8`}>
          <form className='space-y-5' onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${labelColorClass}`}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Emailinizi daxil edin"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${inputBgClass} ${inputBorderFocusClass} ${formErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.email && (
                <p className={`${errorTextColorClass} text-sm mt-1`}>{formErrors.email}</p>
              )}
            </div>

            <button
              type='submit'
              className={`w-full ${buttonBgClass} text-white py-2.5 rounded-md font-medium transition-colors`}
              disabled={loading === 'loading'}
            >
              {loading === 'loading' ? 'Göndərilir...' : 'Şifrəni Sıfırla'}
            </button>
          </form>

          {error && !formErrors.email && <p className={`${errorTextColorClass} text-center mt-4`}>{error}</p>}

          <div className={`mt-6 text-center text-sm ${subtitleColorClass}`}>
            Şifrənizi xatırladınız?{' '}
            <Link href="/auth/login" className={`font-medium ${linkColorClass}`}>Giriş Səhifəsinə Qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;