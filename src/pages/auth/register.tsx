import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className='min-h-screen flex items-center  justify-center p-4 bg-[var(--bg)]'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-light text-amber-200 mb-2'>
            Sign up to <span className='font-bold text-white'>RustBerry</span>
          </h2>
          <p className='text-gray-500'>Your AI workspace</p>
        </div>
        
        <div className='bg-white rounded-lg shadow-sm p-8'>
          <form className='space-y-5'>
            <div>
              <label htmlFor="username" className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
              <input 
                id="username"
                type="text" 
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-white' 
              />
            </div>

            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input 
                id="email"
                type="email" 
                className='w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500' 
              />
            </div>

            <div className='relative'>
              <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
              <input 
                id="password"
                type={showPassword ? 'text' : 'password'} 
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

            <div className='relative'>
              <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
              <input 
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'} 
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
              Register
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-500'>
            Already have an account?{' '}
            <a href="/auth/login" className='font-medium text-yellow-600 hover:underline'>Login</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register