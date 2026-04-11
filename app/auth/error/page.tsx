import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center px-8">
      <div className="max-w-sm w-full text-center">
        <div className="font-bold text-[18px] text-[#1C0F3F] mb-8">
          The Capital Gains
        </div>
        <div className="bg-white border border-[rgba(124,58,237,0.15)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(124,58,237,0.08)]">
          <div className="w-12 h-12 bg-[#FDF3E3] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-[#D4860A] text-[20px]">⚠</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#1C0F3F] mb-2">
            Authentication error
          </h1>
          <p className="text-[14px] text-[#4B3F6B] leading-relaxed mb-6">
            Something went wrong with authentication. Please try again.
          </p>
          <Link
            href="/auth/login"
            className="block w-full bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg py-3 text-[14px] font-medium text-center transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
