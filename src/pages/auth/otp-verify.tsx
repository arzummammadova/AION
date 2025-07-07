'use client';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { otpVerify } from '@/redux/features/userSlice';
import { useRouter } from 'next/navigation'; 

const OtpVerify = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const email = searchParams.get('email'); 
  const router = useRouter(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);

    // Növbəti inputa keç
    if (value.length === 1 && index < 5) inputRefs.current[index + 1]?.focus();
    // Əvvəlki inputa keç (silmə zamanı)
    if (value.length === 0 && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => { // Make handleSubmit async
    e.preventDefault();
    const otp = otpValues.join(''); // OTP rəqəmlərini birləşdir

    if (!email) {
      alert('Email tapılmadı. Zəhmət olmasa səhifəni yeniləyin və ya düzgün keçiddən gəlin.');
      return;
    }

    if (otp.length !== 6) {
      alert('Zəhmət olmasa 6 rəqəmli OTP kodunu daxil edin.');
      return;
    }

    // Redux action-u dispatch et
    const resultAction = await dispatch(otpVerify({ email, otp }) as any);

    // Check if OTP verification was successful
    if (otpVerify.fulfilled.match(resultAction)) {
      // Redirect to the reset-password page with the email
      router.push(`/auth/reset-password?email=${email}`);
    } else {
      // Handle unsuccessful OTP verification (e.g., show an error message)
      alert('OTP təsdiqlənməsi uğursuz oldu. Zəhmət olmasa kodu yenidən yoxlayın.');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center text-white p-4 bg-[var(--bg)]'>
      <div className="text-center flex justify-center items-center flex-col">
        <h1 className='text-3xl font-bold text-center'>OTP Verification</h1>
        <p className='text-center text-sm'>Emailinizə göndərilən OTP kodunu daxil edin</p>
        <form onSubmit={handleSubmit} className=''>
          <div className='mt-4 w-[60%] mx-auto flex gap-4 justify-center items-center '>
            {
              [...Array(6)].map((_, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  onChange={(e) => handleChange(e, i)}
                  type="text"
                  inputMode='numeric'
                  maxLength={1}
                  value={otpValues[i]}
                  className='border w-12 h-12 rounded-2xl border-white text-center text-black font-bold text-lg'
                />
              ))
            }
          </div>
          <button
            type='submit'
            className='cursor-pointer w-40 h-12 bg-[var(--bg)] border mt-7 border-amber-200 rounded-2xl text-white font-bold text-sm'
          >
            Təsdiqlə
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerify;