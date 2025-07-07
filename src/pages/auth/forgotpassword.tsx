
"use client";
import { forgotPasswordUser } from '@/redux/features/userSlice';
import { AppDispatch, RootState } from '@/redux/store/store';
import { forgotPasswordUserSchema } from '@/schema/auth';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ZodError } from 'zod'; 


const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string }>({}); // Forma xətaları üçün state
  const { loading, error } = useSelector((state: RootState) => state.user);

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

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Forgot Password for <span className='font-bold text-white'>AION</span>
          </h2>
          <p className='text-gray-500'>Emailinizi daxil edin şifrənizi sıfırlamaq üçün</p> 
        </div>

        <div className='bg-white rounded-lg shadow-sm p-8'>
          <form className='space-y-5' onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Emailinizi daxil edin" 
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500'
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p> 
              )}
            </div>

            <button
              type='submit'
              className='w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors'
              disabled={loading === 'loading'}
            >
              {loading === 'loading' ? 'Göndərilir...' : 'Şifrəni Sıfırla'}
            </button>
          </form>

          {error && !formErrors.email && <p className="text-red-500 text-center mt-4">{error}</p>}

          <div className='mt-6 text-center text-sm text-gray-500'>
            Şifrənizi xatırladınız?{' '} 
            <Link href="/auth/login" className='font-medium text-yellow-600 hover:underline'>Giriş Səhifəsinə Qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;