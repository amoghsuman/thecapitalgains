const sections = [
  {
    title: "Our Commitment",
    body: "We stand behind the quality of our content. If you are not satisfied with your purchase for any reason, we will refund you in full within 30 days — no questions asked.",
  },
  {
    title: "Course Purchases",
    body: "Individual course purchases are eligible for a full refund within 30 days of purchase. After 30 days, refunds are considered on a case-by-case basis.",
  },
  {
    title: "Subscriptions",
    body: "Monthly subscriptions can be cancelled anytime. You retain access until the end of your current billing period. We do not offer partial month refunds. Annual subscriptions are eligible for a full refund within 30 days of purchase.",
  },
  {
    title: "How to Request a Refund",
    body: "Email us at hello@thecapitalgains.com with your registered email address and order details. We process all refund requests within 5 business days. Refunds are credited back to the original payment method.",
  },
  {
    title: "Contact",
    body: "For refund requests or questions, contact hello@thecapitalgains.com",
  },
];

export default function RefundPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-20">
        <div className="font-mono text-[11px] text-[#8B7BAB] tracking-widest uppercase mb-3">
          Legal
        </div>
        <h1 className="text-4xl font-bold text-[#1C0F3F] mb-3">
          Refund Policy
        </h1>
        <div className="font-mono text-[12px] text-[#8B7BAB] mb-10">
          Last updated: April 2025
        </div>
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-[20px] font-bold text-[#1C0F3F] mb-3 mt-8">
              {s.title}
            </h2>
            <p className="text-[15px] text-[#4B3F6B] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
