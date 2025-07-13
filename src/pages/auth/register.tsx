import React, { useState, ChangeEvent, FormEvent } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

interface FormData {
  username: string
  email: string
  password: string
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [message, setMessage] = useState<string>('')

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!form.username.trim()) {
      newErrors.username = 'İstifadəçi adı boş ola bilməz'
    } else if (form.username.length < 3) {
      newErrors.username = 'İstifadəçi adı ən azı 3 simvol olmalıdır'
    } else if (form.username.length > 20) {
      newErrors.username = 'İstifadəçi adı maksimum 20 simvol ola bilər'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email boş ola bilməz'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Düzgün email daxil edin'
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/~`]).{8,20}$/
    if (!form.password.trim()) {
      newErrors.password = 'Şifrə boş ola bilməz'
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        'Şifrə ən azı 1 böyük hərf, 1 rəqəm və 1 simvol içerməli və 8-20 simvol arası olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.id]: '' })) // Clear specific error
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!validate()) return

    try {
     const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, form)

      setMessage(res.data.message)
      setForm({ username: '', email: '', password: '' })
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/images/aionbg.png')]
        bg-no-repeat bg-cover bg-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-amber-200 mb-2">
            Sign up to <span className="font-bold text-white">AION</span>
          </h2>
          <p className="text-gray-500">Your AI workspace</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-yellow-500'
                }`}
              />
              {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-yellow-500'
                }`}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder='••••••••'
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 pr-10 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-yellow-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-yellow-600"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-yellow-600 text-white py-2.5 rounded-md font-medium transition-colors"
            >
              Register
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-green-600 font-medium">{message}</p>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-yellow-600 hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
