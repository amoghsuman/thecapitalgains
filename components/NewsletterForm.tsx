"use client";

import { useState } from 'react'

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <p className={`text-[14px] font-medium text-center ${dark ? 'text-[#6EE7A0]' : 'text-[#1A7A4A]'}`}>
        You&apos;re subscribed! Check your inbox.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto w-full">
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={`flex-1 rounded-lg px-4 py-3 text-[14px] outline-none transition-colors ${
            dark
              ? 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(255,255,255,0.4)]'
              : 'bg-white border border-[rgba(17,17,17,0.15)] text-[#111111] placeholder:text-[#7A7A8A] focus:border-[rgba(17,17,17,0.35)]'
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#D4860A] hover:bg-[#F0A020] disabled:bg-[#D4860A]/60 text-white rounded-lg px-6 py-3 text-[14px] font-medium transition-colors whitespace-nowrap"
        >
          {loading ? 'Subscribing…' : 'Subscribe free'}
        </button>
      </div>
      {error && (
        <p className={`text-[13px] ${dark ? 'text-[#FCA5A5]' : 'text-[#DC2626]'}`}>
          {error}
        </p>
      )}
    </form>
  )
}
