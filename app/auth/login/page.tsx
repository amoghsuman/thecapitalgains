"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/courses')
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  return (
    <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center px-8">
      <div className="max-w-sm w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-serif font-bold text-[18px] text-[#1E1245]">
            The Capital Gains
          </div>
        </div>

        <div className="bg-white border border-[rgba(30,18,69,0.1)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(30,18,69,0.06)]">
          <h1 className="font-serif text-[28px] font-bold text-[#1E1245] mb-1">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#5A5A72] mb-6">
            Sign in to access your courses and progress
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[#FAFAF7] border border-[rgba(30,18,69,0.15)] rounded-lg px-4 py-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9494A8] outline-none focus:border-[#1E1245] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#FAFAF7] border border-[rgba(30,18,69,0.15)] rounded-lg px-4 py-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9494A8] outline-none focus:border-[#1E1245] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-[#FDF3E3] border border-[rgba(212,134,10,0.2)] rounded-lg px-4 py-3 text-[13px] text-[#D4860A]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4860A] hover:bg-[#F0A020] disabled:bg-[#D4860A]/60 text-white rounded-lg py-3 text-[14px] font-medium transition-colors mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgba(30,18,69,0.1)]" />
            <span className="font-mono text-[11px] text-[#9494A8]">or</span>
            <div className="flex-1 h-px bg-[rgba(30,18,69,0.1)]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[rgba(30,18,69,0.15)] hover:border-[rgba(30,18,69,0.3)] rounded-lg py-3 text-[14px] text-[#1E1245] font-medium transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-[13px] text-[#5A5A72] mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#D4860A] hover:text-[#F0A020] font-medium transition-colors">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}
