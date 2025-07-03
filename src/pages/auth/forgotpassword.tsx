import Link from 'next/link'
import React from 'react'

const ForgotPassword = () => {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Forgot Password for <span className='font-bold text-white'>RustBerry</span>
          </h2>
          <p className='text-gray-500'>Enter your email to reset your password</p>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-8'>
          <form className='space-y-5'>
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500'
              />
            </div>

            <button
              type='submit'
              className='w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors'
            >
              Reset Password
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-500'>
            Remember your password?{' '}
            <Link href="/auth/login" className='font-medium text-yellow-600 hover:underline'>Back to Login</Link>
          </div>
          <div className='mt-6 text-center text-sm text-gray-500'>
            Remember your password?{' '}
            <Link href="/auth/resetpassword" className='font-medium text-yellow-600 hover:underline'>Reset Password</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
