const sections = [
  {
    title: "Information We Collect",
    body: "We collect email address, name, and payment information when you create an account or make a purchase. We also collect usage data such as lessons completed and progress tracking.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to provide course access, track your learning progress, send newsletters (only if you subscribed), process payments, and improve our platform.",
  },
  {
    title: "Data Storage",
    body: "Your data is stored securely using Supabase, a SOC 2 compliant database provider. Payment information is processed by Razorpay and never stored on our servers.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.",
  },
  {
    title: "Third Party Services",
    body: "We use Razorpay for payment processing and Supabase for data storage. These services have their own privacy policies which govern their use of your data.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@thecapitalgains.com. We will respond within 30 days.",
  },
  {
    title: "Contact",
    body: "For privacy-related queries, contact us at hello@thecapitalgains.com",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <div className="max-w-3xl mx-auto px-8 pt-16 pb-20">
        <div className="font-mono text-[11px] text-[#7A7A8A] tracking-widest uppercase mb-3">
          Legal
        </div>
        <h1 className="font-serif text-4xl font-bold text-[#111111] mb-3">
          Privacy Policy
        </h1>
        <div className="font-mono text-[12px] text-[#7A7A8A] mb-10">
          Last updated: April 2025
        </div>
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-serif text-[20px] font-bold text-[#111111] mb-3 mt-8">
              {s.title}
            </h2>
            <p className="text-[15px] text-[#3D3D3D] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
