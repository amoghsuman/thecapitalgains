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

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/auth/callback' },
    })

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
      <div className="min-h-screen flex items-center justify-center px-8 py-28">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="font-bold text-[18px] text-ink">
              The Capital Gains
            </div>
          </div>
          <div className="bg-panel border border-hairline rounded-2xl p-8 shadow-[0_4px_32px_rgba(27,58,43,0.08)] text-center">
            <div className="w-12 h-12 bg-forest-surface rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-forest text-[20px]">✓</span>
            </div>
            <h2 className="text-[22px] font-bold text-ink mb-2">
              Check your email
            </h2>
            <p className="text-[14px] text-ink-dim leading-relaxed">
              We've sent a confirmation link to <span className="font-medium text-ink">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <p className="text-center text-[13px] text-ink-dim mt-5">
            Already confirmed?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-dark font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-28">
      <div className="max-w-sm w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-bold text-[18px] text-ink">
            The Capital Gains
          </div>
        </div>

        <div className="bg-panel border border-hairline rounded-2xl p-8 shadow-[0_4px_32px_rgba(27,58,43,0.08)]">
          <h1 className="text-[28px] font-bold text-ink mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-ink-dim mb-6">
            Start learning for free. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[11px] text-ink-dim tracking-widest uppercase block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-panel border border-hairline rounded-lg px-4 py-3 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-forest transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-ink-dim tracking-widest uppercase block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full bg-panel border border-hairline rounded-lg px-4 py-3 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-forest transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-ink-dim tracking-widest uppercase block mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-panel border border-hairline rounded-lg px-4 py-3 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-forest transition-colors"
              />
            </div>

            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[13px] text-amber-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest hover:bg-forest-dark disabled:bg-forest/60 text-white rounded-lg py-3 text-[14px] font-medium transition-colors mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-hairline" />
            <span className="font-mono text-[11px] text-ink-dim">or</span>
            <div className="flex-1 h-px bg-hairline" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-panel border border-hairline hover:border-ink-dim rounded-lg py-3 text-[14px] text-ink font-medium transition-colors"
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

        <p className="text-center text-[13px] text-ink-dim mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
