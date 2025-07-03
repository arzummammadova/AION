import Link from 'next/link';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const EmailVerifiedSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email təsdiq olundu ✅</h1>
        <p className="text-gray-600 mb-6">
          Hesabınız uğurla aktivləşdirildi. İndi daxil ola bilərsiniz.
        </p>
        <Link href="/auth/login" className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
          Daxil ol
        </Link>
      </div>
    </div>
  );
};

export default EmailVerifiedSuccess;
