"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type SelectedPlan = {
  key: string;
  name: string;
  billingType: "free" | "subscription" | "one-time";
};

interface Props {
  selectedPlans: SelectedPlan[];
  billing: "monthly" | "annual";
  totalAmount: number;
}

const ENQUIRY_EMAIL = "hello@thecapitalgains.com";

export default function SubscribeButton({ selectedPlans, billing, totalAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Checkout handles exactly one payable item at a time.
  const plan = selectedPlans[0] ?? null;
  const isOneTime = plan?.billingType === "one-time";

  async function handleSubscribe() {
    if (!plan) return;

    // One-time services (Doubt Session, Portfolio Review) are scheduled, not
    // sold through the subscription checkout — route to an enquiry.
    if (isOneTime) {
      const subject = encodeURIComponent(`Booking request: ${plan.name}`);
      window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${subject}`;
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });

      const planKey = `${plan.key}_${billing}`;

      const res = await fetch("/api/payments/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const { subscriptionId, error } = await res.json();
      if (error) throw new Error(error);

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "The Capital Gains",
        description: plan.name,
        theme: { color: "#1B3A2B" },
        handler: function () {
          router.push("/dashboard?payment=success");
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || !plan}
      className="bg-forest hover:bg-forest-dark disabled:opacity-50 text-white font-bold rounded-xl px-6 py-3 text-sm tracking-tight transition-colors whitespace-nowrap"
    >
      {loading ? "Processing..." : isOneTime ? "Enquire →" : "Confirm Selection →"}
    </button>
  );
}