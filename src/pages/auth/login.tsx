import Link from 'next/link'
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Login to <span className='font-bold text-white'>RustBerry</span>
          </h2>
          <p className='text-gray-500'>Welcome back to your AI workspace</p>
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

            <div className='relative'>
              <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-9 text-gray-400 hover:text-yellow-600'
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button
              type='submit'
              className='w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors'
            >
              Log In
            </button>
          </form>
          <Link className='text-sm flex justify-end mt-3' href="/auth/forgotpassword">
            Forgot password?
          </Link>


          <div className='mt-6 text-center text-sm text-gray-500'>
            Don't have an account?{' '}
            <a href="/auth/register" className='font-medium text-yellow-600 hover:underline'>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
