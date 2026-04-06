"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#FAFAF7] border-b border-[rgba(17,17,17,0.1)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 h-[60px] flex items-center gap-0">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif font-bold text-[17px] text-[#111111] tracking-wide mr-12 flex-shrink-0"
        >
          The Capital Gains
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-1 flex-1">
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-[14px] text-[#3D3D3D] hover:text-[#111111] hover:bg-[#F4F1EB] rounded-md transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link href="/auth/login" className="border border-[rgba(17,17,17,0.25)] rounded-lg px-5 py-2 text-[13px] text-[#3D3D3D] hover:border-[#111111] hover:text-[#111111] transition-all">
            Sign In
          </Link>
          <Link href="/auth/signup" className="bg-[#111111] text-white rounded-lg px-5 py-2 text-[13px] font-medium hover:bg-[#333333] transition-all border border-[#111111]">
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto text-[#111111]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path d="M4 4l14 14M4 18L18 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[rgba(17,17,17,0.1)] px-8 py-4 flex flex-col gap-2 bg-[#FAFAF7]">
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="py-2 text-[14px] text-[#3D3D3D] hover:text-[#111111]"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-[rgba(17,17,17,0.08)]">
            <Link href="/auth/login" className="flex-1 text-center border border-[rgba(17,17,17,0.2)] rounded-lg px-4 py-2 text-[13px] text-[#3D3D3D]">
              Sign in
            </Link>
            <Link href="/auth/signup" className="flex-1 text-center bg-[#111111] text-white rounded-lg px-4 py-2 text-[13px] font-medium">
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}