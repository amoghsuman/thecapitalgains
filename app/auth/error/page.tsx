import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-28">
      <div className="max-w-sm w-full text-center">
        <div className="font-bold text-[18px] text-ink mb-8">
          The Capital Gains
        </div>
        <div className="bg-panel border border-hairline rounded-2xl p-8 shadow-[0_4px_32px_rgba(27,58,43,0.08)]">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-amber-800 text-[20px]">⚠</span>
          </div>
          <h1 className="text-[22px] font-bold text-ink mb-2">
            Authentication error
          </h1>
          <p className="text-[14px] text-ink-dim leading-relaxed mb-6">
            Something went wrong with authentication. Please try again.
          </p>
          <Link
            href="/auth/login"
            className="block w-full bg-forest hover:bg-forest-dark text-white rounded-lg py-3 text-[14px] font-medium text-center transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
