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
    <header
      id="main-navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ivory/95 backdrop-blur-md border-b border-hairline shadow-xs py-3"
          : "bg-ivory/80 backdrop-blur-sm border-b border-hairline/70 py-4"
      }`}
    >
      <div className="site-container flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          id="nav-brand-logo"
          className="flex items-center gap-2.5 group flex-shrink-0 rounded-lg py-1 px-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-forest shadow-[0_0_8px_rgba(27,58,43,0.5)] ring-2 ring-forest/20 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm tracking-[0.16em] transition-colors uppercase text-olive group-hover:text-forest">
            THE CAPITAL GAINS
          </span>
        </Link>

        {/* Desktop nav links - Fixed Pill Style with High Contrast */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center p-1 bg-olive-surface/80 border border-hairline rounded-full shadow-2xs"
        >
          {[
            { label: "Courses", href: "/courses" },
            { label: "Portfolios", href: "/portfolios" },
            { label: "Pricing", href: "/pricing" },
            { label: "Newsletter", href: "/newsletter" },
          ].map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-5 py-1.5 text-[13px] font-bold tracking-tight rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-panel text-forest shadow-xs border border-hairline/80 font-extrabold"
                    : "text-olive/80 hover:text-olive hover:bg-white/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 text-[12px] font-bold tracking-wider uppercase text-olive hover:text-forest hover:bg-olive-surface/60 rounded-lg transition-colors"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3.5 py-1.5 rounded-lg border border-hairline bg-panel text-olive hover:bg-olive-surface text-[12px] font-bold tracking-wider uppercase transition-colors shadow-2xs"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-[12px] font-bold tracking-wider uppercase text-olive hover:text-forest hover:bg-olive-surface/60 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-[12px] font-bold tracking-wider uppercase shadow-xs hover:shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open navigation menu"}
          className="lg:hidden p-2 rounded-xl border border-hairline bg-panel text-olive hover:bg-olive-surface transition-colors shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest/40"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
        <div className="lg:hidden absolute top-full left-0 w-full border-b border-hairline p-6 flex flex-col gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 bg-panel/98 backdrop-blur-xl">
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Courses", href: "/courses" },
              { label: "Portfolios", href: "/portfolios" },
              { label: "Pricing", href: "/pricing" },
              { label: "Newsletter", href: "/newsletter" },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl text-sm font-bold tracking-tight flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-forest text-white"
                      : "text-olive hover:bg-olive-surface"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs opacity-60">→</span>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-hairline">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl border border-hairline bg-panel text-olive text-center text-xs font-bold tracking-wider uppercase hover:bg-olive-surface transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 rounded-xl bg-forest text-white text-center text-xs font-bold tracking-wider uppercase hover:bg-forest-dark transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 rounded-xl border border-hairline bg-panel text-olive text-center text-xs font-bold tracking-wider uppercase hover:bg-olive-surface transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2.5 rounded-xl bg-forest text-white text-center text-xs font-bold tracking-wider uppercase hover:bg-forest-dark transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
