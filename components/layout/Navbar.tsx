"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "@/app/premium-theme.css";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // Hydrate initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    // Keep in sync on login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const useDarkNav = true;

  // The lesson reader (app/learn/[course]/[lesson]/page.tsx) renders its own
  // sticky, condensed header (back-to-courses link, reading progress bar,
  // account/sign-out) tailored for reading. Rendering this full navbar there
  // too produced two stacked, redundant sticky headers. Hide this one on that
  // route so there's exactly one persistent header while reading a lesson.
  if (pathname?.startsWith("/learn/")) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(247,244,236,0.85)] backdrop-blur-xl py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="site-container flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="w-2 h-2 rounded-full bg-forest shadow-[0_0_10px_rgba(27,58,43,0.8)] group-hover:scale-125 transition-transform" />
          <span className={`font-black text-sm tracking-[0.15em] transition-colors uppercase ${
            useDarkNav ? "text-ink" : "text-ink"
          }`}>
            THE CAPITAL GAINS
          </span>
        </Link>

        {/* Desktop nav links - Fixed Pill Style */}
        <div className="hidden lg:flex items-center p-1 bg-[rgba(26,26,24,0.04)] border border-hairline rounded-full backdrop-blur-xl">
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
                    ? "bg-panel text-ink shadow-lg"
                    : useDarkNav
                      ? "text-ink-dim hover:text-ink"
                      : "text-ink-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-[12px] font-bold tracking-widest uppercase transition-colors ${
                  useDarkNav ? "text-ink-dim hover:text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                My Account
              </Link>
              <button
                onClick={handleSignOut}
                className={`text-[12px] font-bold tracking-widest uppercase transition-colors ${
                  useDarkNav ? "text-ink-dim hover:text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`text-[12px] font-bold tracking-widest uppercase transition-colors ${
                  useDarkNav ? "text-ink-dim hover:text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                Sign In
              </Link>
              <Link href="/auth/signup" className="premium-button-primary !py-2.5 !px-6 text-[12px] font-extrabold tracking-widest uppercase">
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden transition-colors text-ink"
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
        <div className="lg:hidden absolute top-full left-0 w-full border-t p-10 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-panel border-hairline">
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xl font-black tracking-tight text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-hairline">
            {user ? (
              <>
                <Link href="/dashboard" className="premium-button-outline text-center !py-3" onClick={() => setMenuOpen(false)}>My Account</Link>
                <button onClick={handleSignOut} className="premium-button-primary text-center !py-3">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="premium-button-outline text-center !py-3">Sign In</Link>
                <Link href="/auth/signup" className="premium-button-primary text-center !py-3">Join Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
