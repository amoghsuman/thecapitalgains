"use client";

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center px-8">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="font-serif font-bold text-[18px] text-[#0F2348]">
              The Capital Gains
            </div>
          </div>
          <div className="bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(15,35,72,0.06)] text-center">
            <div className="w-12 h-12 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-[#1A7A4A] text-[20px]">✓</span>
            </div>
            <h2 className="font-serif text-[22px] font-bold text-[#0F2348] mb-2">
              Check your email
            </h2>
            <p className="text-[14px] text-[#5A5A72] leading-relaxed">
              We&apos;ve sent a confirmation link to <span className="font-medium text-[#0F2348]">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <p className="text-center text-[13px] text-[#5A5A72] mt-5">
            Already confirmed?{' '}
            <Link href="/auth/login" className="text-[#D4860A] hover:text-[#F0A020] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center px-8">
      <div className="max-w-sm w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-serif font-bold text-[18px] text-[#0F2348]">
            The Capital Gains
          </div>
        </div>

        <div className="bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(15,35,72,0.06)]">
          <h1 className="font-serif text-[28px] font-bold text-[#0F2348] mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-[#5A5A72] mb-6">
            Start learning for free. No credit card required.
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
                className="w-full bg-[#FAFAF7] border border-[rgba(15,35,72,0.15)] rounded-lg px-4 py-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9494A8] outline-none focus:border-[#0F2348] transition-colors"
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
                placeholder="Min. 8 characters"
                required
                className="w-full bg-[#FAFAF7] border border-[rgba(15,35,72,0.15)] rounded-lg px-4 py-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9494A8] outline-none focus:border-[#0F2348] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase block mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#FAFAF7] border border-[rgba(15,35,72,0.15)] rounded-lg px-4 py-3 text-[14px] text-[#1A1A2E] placeholder:text-[#9494A8] outline-none focus:border-[#0F2348] transition-colors"
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#5A5A72] mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#D4860A] hover:text-[#F0A020] font-medium transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
