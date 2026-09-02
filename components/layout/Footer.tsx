import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-panel border-t border-hairline pt-20 pb-10">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-2 h-2 rounded-full bg-forest shadow-[0_0_10px_rgba(27,58,43,0.8)]" />
              <span className="font-black text-sm tracking-[0.15em] text-ink uppercase">
                THE CAPITAL GAINS
              </span>
            </Link>
            <p className="text-ink-dim text-sm leading-relaxed max-w-sm">
              Playbook-style courses for Indian retail investors.
              No fluff, no videos, just high-signal reading for long-term edge.
            </p>
          </div>

          <div>
            <h4 className="text-ink text-xs font-bold tracking-[0.2em] uppercase mb-6">Curriculum</h4>
            <ul className="space-y-4 text-sm text-ink-dim">
              <li><Link href="/courses" className="hover:text-ink transition-colors">All Courses</Link></li>
              <li><Link href="/portfolios" className="hover:text-ink transition-colors">Portfolios</Link></li>
              <li><Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-ink text-xs font-bold tracking-[0.2em] uppercase mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-ink-dim">
              <li><Link href="/about" className="hover:text-ink transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-ink transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Footer */}
        <div className="pt-10 border-t border-hairline text-center">
          <div className="bg-forest-surface border border-hairline rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <p className="text-ink-dim text-[13px] leading-relaxed">
              Educational content only · Not investment advice · Trading involves risk of loss
              <br />
              <span className="block mt-2 opacity-60">
                Please consult a SEBI-registered investment advisor or a research analyst before trading or investing
              </span>
            </p>
          </div>
          <p className="text-ink-dim text-[12px] font-mono">
            &copy; {new Date().getFullYear()} The Capital Gains. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}