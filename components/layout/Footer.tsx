import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F0720] border-t border-[rgba(255,255,255,0.05)] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              <span className="font-black text-sm tracking-[0.15em] text-white uppercase">
                THE CAPITAL GAINS
              </span>
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              Playbook-style courses for Indian retail investors. 
              No fluff, no videos, just high-signal reading for long-term edge.
            </p>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">Curriculum</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
              <li><Link href="/portfolios" className="hover:text-white transition-colors">Portfolios</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Footer */}
        <div className="pt-10 border-t border-[rgba(255,255,255,0.05)] text-center">
          <div className="bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.1)] rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <p className="text-[#94A3B8] font-mono text-[11px] leading-relaxed uppercase tracking-wider">
              Educational content only · Not investment advice · Trading involves risk of loss
              <br />
              <span className="block mt-2 opacity-60">
                Please consult a SEBI-registered investment advisor or a research analyst before trading or investing
              </span>
            </p>
          </div>
          <p className="text-[#64748B] text-[12px] font-mono">
            &copy; {new Date().getFullYear()} The Capital Gains. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}