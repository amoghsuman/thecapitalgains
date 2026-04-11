"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/premium-theme.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const useDarkNav = (isHomePage && !scrolled) || scrolled;
  
  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-[rgba(15,7,32,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)] py-3" 
          : isHomePage 
            ? "bg-transparent py-6" 
            : "bg-white border-b border-slate-200 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] group-hover:scale-125 transition-transform" />
          <span className={`font-black text-sm tracking-[0.15em] transition-colors uppercase ${
            useDarkNav ? "text-white" : "text-[#1C0F3F]"
          }`}>
            THE CAPITAL GAINS
          </span>
        </Link>

        {/* Desktop nav links - Fixed Pill Style */}
        <div className="hidden lg:flex items-center p-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full backdrop-blur-xl">
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
                className={`px-6 py-2 text-[12px] font-bold tracking-wider rounded-full transition-all ${
                  isActive
                    ? "bg-white text-[#1C0F3F] shadow-lg"
                    : useDarkNav
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-[#1C0F3F]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/auth/login" 
            className={`text-[12px] font-bold tracking-widest uppercase transition-colors ${
              useDarkNav ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-[#1C0F3F]"
            }`}
          >
            Sign In
          </Link>
          <Link href="/auth/signup" className="premium-button-primary !py-2.5 !px-6 text-[12px] font-extrabold tracking-widest uppercase">
            Join Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden transition-colors ${
            useDarkNav ? "text-white" : "text-[#1C0F3F]"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full border-t p-10 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
          useDarkNav 
            ? "bg-[#0F0720] border-[rgba(255,255,255,0.05)]" 
            : "bg-white border-slate-100"
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
              className={`text-xl font-black tracking-tight ${
                useDarkNav ? "text-white" : "text-[#1C0F3F]"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
            <Link href="/auth/login" className="premium-button-outline text-center !py-3">Sign In</Link>
            <Link href="/auth/signup" className="premium-button-primary text-center !py-3">Join Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
