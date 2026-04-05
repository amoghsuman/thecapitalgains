const sections = [
  {
    title: "Acceptance of Terms",
    body: "Using The Capital Gains platform means you agree to these terms. If you disagree, please do not use the platform.",
  },
  {
    title: "Educational Purpose Only",
    body: "All content on this platform is strictly for educational purposes. Nothing constitutes investment advice, trading recommendations, or research under SEBI regulations. You are solely responsible for your investment decisions.",
  },
  {
    title: "User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. We reserve the right to terminate accounts that violate these terms.",
  },
  {
    title: "Payments and Refunds",
    body: "Course purchases are one-time payments with lifetime access. Subscriptions are billed monthly or annually. We offer a 30-day refund on all purchases — no questions asked. Refund requests must be submitted within 30 days of purchase.",
  },
  {
    title: "Intellectual Property",
    body: "All course content, materials, and platform design are the intellectual property of The Capital Gains. You may not reproduce, distribute, or resell any content without written permission.",
  },
  {
    title: "Limitation of Liability",
    body: "The Capital Gains is not liable for any financial losses arising from the use of our educational content. Markets are inherently unpredictable and past illustrative performance does not guarantee future results.",
  },
  {
    title: "Changes to Terms",
    body: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
  },
  {
    title: "Contact",
    body: "For any questions about these terms, contact us at hello@thecapitalgains.com",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-20">
        <div className="font-mono text-[11px] text-[#9494A8] tracking-widest uppercase mb-3">
          Legal
        </div>
        <h1 className="font-serif text-4xl font-bold text-[#1E1245] mb-3">
          Terms of Service
        </h1>
        <div className="font-mono text-[12px] text-[#9494A8] mb-10">
          Last updated: April 2025
        </div>
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-serif text-[20px] font-bold text-[#1E1245] mb-3 mt-8">
              {s.title}
            </h2>
            <p className="text-[15px] text-[#5A5A72] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
