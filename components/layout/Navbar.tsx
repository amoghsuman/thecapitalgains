"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/premium-theme.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if we are on a page that should have a dark navbar by default (like Home)
  const isHomePage = pathname === "/";
  
  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "premium-glass-nav py-3" 
          : isHomePage 
            ? "bg-transparent py-5" 
            : "bg-white border-b border-slate-200 py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group flex-shrink-0"
        >
          <div className="premium-glow-dot group-hover:scale-125 transition-transform" />
          <span className={`font-bold text-lg tracking-tight transition-colors ${
            (isHomePage && !scrolled) || (scrolled) ? "text-white" : "text-[#1C0F3F]"
          }`}>
            THE CAPITAL GAINS
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full px-1 py-1 backdrop-blur-md">
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-5 py-2 text-[13px] font-semibold tracking-wide rounded-full transition-all ${
                  isActive
                    ? "bg-white text-[#1C0F3F] shadow-sm"
                    : (isHomePage && !scrolled) || scrolled
                      ? "text-[#94A3B8] hover:text-white"
                      : "text-[#4B3F6B] hover:text-[#1C0F3F] hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className={`text-[13px] font-bold tracking-wide transition-colors ${
              (isHomePage && !scrolled) || scrolled ? "text-[#94A3B8] hover:text-white" : "text-[#4B3F6B] hover:text-[#1C0F3F]"
            }`}
          >
            Sign In
          </Link>
          <Link href="/auth/signup" className="premium-button-primary !py-2 !px-5 text-[13px] font-bold tracking-tight">
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden transition-colors ${
            (isHomePage && !scrolled) || scrolled ? "text-white" : "text-[#1C0F3F]"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full border-t p-8 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-300 ${
          (isHomePage && !scrolled) || scrolled 
            ? "premium-glass-nav border-[rgba(255,255,255,0.1)]" 
            : "bg-white border-slate-200 text-[#1C0F3F]"
        }`}>
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-lg font-bold tracking-tight ${
                (isHomePage && !scrolled) || scrolled ? "text-white hover:text-[#A78BFA]" : "text-[#1C0F3F] hover:text-violet-600"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <Link href="/auth/signup" className="w-full text-center premium-button-primary font-bold">
              Get Started Free
            </Link>
            <Link href="/auth/login" className="w-full text-center py-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-bold text-[#94A3B8]">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
