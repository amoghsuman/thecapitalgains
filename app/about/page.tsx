import Link from "next/link";

const principles = [
  {
    title: "Process over tips",
    body: "A repeatable framework beats a lucky call every time. We teach you how to think, not what to think.",
  },
  {
    title: "Apply immediately",
    body: "Every concept is paired with a real market exercise. Open your broker terminal, do the thing, then move on.",
  },
  {
    title: "No jargon for its own sake",
    body: "If a term doesn't help you make a better decision, we skip it. Vocabulary is a tool, not a performance.",
  },
  {
    title: "Honest about risk",
    body: "Markets are uncertain. We never pretend otherwise — every lesson is explicit about what can go wrong.",
  },
];

const stats = [
  { num: "3", label: "Courses live" },
  { num: "100%", label: "Text-based" },
  { num: "₹0", label: "To start" },
  { num: "30-day", label: "Refund policy" },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-8 pt-16 pb-10">
        <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-3">
          About
        </div>
        <h1 className="font-serif text-5xl font-bold text-[#1E1245] leading-[1.1] mb-4">
          Built by a practitioner,<br />for practitioners.
        </h1>
        <p className="text-[17px] text-[#3D3D3D] leading-relaxed">
          The Capital Gains was built out of frustration with how financial education works in India — too much theory, too many tips, not enough process.
        </p>
      </section>

      {/* ── STORY ── */}
      <section className="max-w-3xl mx-auto px-8 mt-8">
        <div className="flex flex-col gap-5">
          <p className="text-[16px] text-[#3D3D3D] leading-relaxed">
            Most financial content online falls into one of two traps. Either it&apos;s so basic it insults your intelligence — or it&apos;s so jargon-heavy it&apos;s useless without a finance degree. Neither helps a retail investor make a single better decision.
          </p>
          <p className="text-[16px] text-[#3D3D3D] leading-relaxed">
            This platform was built differently. Every course starts with the real question a retail investor faces — not the textbook version. Every lesson ends with something you can actually do in your broker terminal today.
          </p>
          <p className="text-[16px] text-[#3D3D3D] leading-relaxed">
            We&apos;re not here to give you tips or tell you what to buy. We&apos;re here to give you the frameworks, the vocabulary, and the process to make your own decisions confidently.
          </p>
        </div>
      </section>

      {/* ── PRINCIPLES GRID ── */}
      <section className="max-w-4xl mx-auto px-8 mt-16">
        <h2 className="font-serif text-[28px] font-bold text-[#1E1245] mb-8">
          How we think about financial education
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {principles.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-[rgba(30,18,69,0.1)] rounded-2xl p-6"
            >
              <div className="w-8 h-0.5 bg-[#D4860A] mb-4 rounded-full" />
              <div className="font-serif text-[18px] text-[#1E1245] mb-2 leading-snug">
                {p.title}
              </div>
              <p className="text-[13px] text-[#3D3D3D] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-4xl mx-auto px-8 mt-12">
        <div className="bg-[#F4F1EB] rounded-2xl px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <span className="font-mono text-[28px] font-medium text-[#1E1245] leading-none mb-1">
                {s.num}
              </span>
              <span className="text-[12px] text-[#7A7A8A]">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-8 mt-12 pb-20">
        <div className="bg-[#1E1245] rounded-2xl px-10 py-12 text-center">
          <h2 className="font-serif text-[30px] text-white mb-3">
            Start learning for free
          </h2>
          <p className="text-[rgba(255,255,255,0.55)] text-[15px] mb-8 max-w-sm mx-auto">
            Every course has free preview lessons. No account required to start reading.
          </p>
          <Link
            href="/courses"
            className="inline-block bg-[#D4860A] hover:bg-[#F0A020] text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors"
          >
            Browse all courses →
          </Link>
        </div>
      </section>

    </div>
  );
}
