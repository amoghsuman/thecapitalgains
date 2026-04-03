import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen flex items-center justify-center px-8">
      <div className="max-w-sm w-full text-center">
        <div className="font-serif font-bold text-[18px] text-[#0F2348] mb-8">
          The Capital Gains
        </div>
        <div className="bg-white border border-[rgba(15,35,72,0.1)] rounded-2xl p-8 shadow-[0_4px_32px_rgba(15,35,72,0.06)]">
          <div className="w-12 h-12 bg-[#FDF3E3] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-[#D4860A] text-[20px]">⚠</span>
          </div>
          <h1 className="font-serif text-[22px] font-bold text-[#0F2348] mb-2">
            Authentication error
          </h1>
          <p className="text-[14px] text-[#5A5A72] leading-relaxed mb-6">
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
