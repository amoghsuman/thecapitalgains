"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  selectedPlans: { key: string; name: string }[];
  billing: "monthly" | "annual";
  totalAmount: number;
}

export default function SubscribeButton({ selectedPlans, billing, totalAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubscribe() {
    if (selectedPlans.length === 0) return;
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

      // Use first subscription plan (handle multiple plans later)
      const planKey = `${selectedPlans[0].key}_${billing}`;

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
        description: selectedPlans.map(p => p.name).join(" + "),
        theme: { color: "#1E1245" },
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
      disabled={loading || selectedPlans.length === 0}
      className="bg-[#D4860A] hover:bg-[#B8720A] disabled:opacity-50 text-white font-bold rounded-xl px-6 py-3 text-sm tracking-tight transition-colors whitespace-nowrap"
    >
      {loading ? "Processing..." : "Confirm Selection →"}
    </button>
  );
}