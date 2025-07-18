'use client'; // Bu direktivi yadda saxlayın, client side render üçün vacibdir

import Link from 'next/link';
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'; // Redux üçün
import { useSearchParams, useRouter } from 'next/navigation'; // Next.js yönləndirmə və URL parametrləri üçün
import { resetPassword } from '@/redux/features/userSlice'; // Reset password thunk-u
import { RootState } from '@/redux/store'; // RootState tipini import edin (əgər Redux store-unuzda varsa)

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState(''); // Yeni şifrənin state-i
  const [confirmPassword, setConfirmPassword] = useState(''); // Şifrə təsdiqinin state-i

  const dispatch = useDispatch();
  const searchParams = useSearchParams(); // URL parametrlərini almaq üçün
  const router = useRouter(); // Səhifələr arasında yönləndirmək üçün

  // const email = searchParams.get('email'); // URL-dən email parametrisini alırıq
  const email = searchParams ? searchParams.get('email') : null;

  const { loading, error } = useSelector((state: RootState) => state.user); // Redux store-dan loading və error state-lərini alırıq

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Emailin URL-dən gəldiyini yoxlayın
    if (!email) {
      alert('Email tapılmadı. Zəhmət olmasa OTP doğrulama prosesini yenidən başladın.');
      router.push('/auth/forgot-password'); // Unutulmuş şifrə səhifəsinə yönləndirə bilərsiniz
      return;
    }

    // Şifrə validasiyaları
    if (password.length < 6) {
      alert('Şifrə ən azı 6 simvol olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Daxil etdiyiniz şifrələr uyğun gəlmir.');
      return;
    }

    // Redux thunk-u dispatch et
    const resultAction = await dispatch(resetPassword({ email, password, confirmPassword }) as any);

    // Əgər şifrə sıfırlama uğurlu olarsa
    if (resetPassword.fulfilled.match(resultAction)) {
      alert('Şifrəniz uğurla sıfırlandı. İndi yeni şifrənizlə daxil ola bilərsiniz.');
      router.push('/auth/login'); // Giriş səhifəsinə yönləndir
    }
    // Xəta halı Redux slice-dakı `rejected` hissəsi tərəfindən idarə olunacaq
    // və alert ilə istifadəçiyə göstəriləcək.
  };

  return (
    <div className="min-h-screen flex items-center justify-center
     p-4
      // bg-[var(--bg)]

    bg-[url('/images/aionbg.png')]
        bg-no-repeat bg-cover bg-center
    ">
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Şifrəni Sıfırla <span className='font-bold text-white'>AION</span> üçün
          </h2>
          <p className='text-gray-500'>Aşağıda yeni şifrənizi daxil edin</p>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-8'>
          <form className='space-y-5' onSubmit={handleSubmit}>
            <div className='relative'>
              <label htmlFor="newPassword" className='block text-sm font-medium text-gray-700 mb-1'>Yeni Şifrə</label>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-10 text-black'
                required
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-9 text-gray-400 hover:text-yellow-600'
                tabIndex={-1}
              >
                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className='relative'>
              <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700 mb-1'>Yeni Şifrəni Təsdiqlə</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-10 text-black'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-9 text-gray-400 hover:text-yellow-600'
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button
              type='submit'
              className='w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors'
              disabled={loading === 'loading'} // Yükləmə zamanı düyməni deaktiv et
            >
              {loading === 'loading' ? 'Yüklənir...' : 'Yeni Şifrəni Təyin Et'}
            </button>

            {/* Xəta mesajını göstər */}
            {error && <p className='text-red-500 text-sm mt-3 text-center'>{error}</p>}
          </form>

          <div className='mt-6 text-center text-sm text-gray-500'>
            Şifrənizi xatırladınız?{' '}
            <Link href="/auth/login" className='font-medium text-yellow-600 hover:underline'>Giriş səhifəsinə qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;