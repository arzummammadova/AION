import Link from 'next/link'
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Reset Your Password for <span className='font-bold text-white'>AION</span>
          </h2>
          <p className='text-gray-500'>Enter your new password below</p>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-8'>
          <form className='space-y-5'>
            <div className='relative'>
              <label htmlFor="newPassword" className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-10'
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
              <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700 mb-1'>Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-10'
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
            >
              Set New Password
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-500'>
            Remember your password?{' '}
            <Link href="/auth/login" className='font-medium text-yellow-600 hover:underline'>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
