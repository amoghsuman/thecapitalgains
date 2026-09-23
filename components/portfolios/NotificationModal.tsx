"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Shield } from "lucide-react";
import type { Portfolio } from "@/lib/portfolios/types";

interface NotificationModalProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onClose: () => void;
}

// Posts the email to the existing newsletter route tagged "portfolio-alerts".
// No delivery timing is promised anywhere in this modal.
export default function NotificationModal({ portfolio, isOpen, onClose }: NotificationModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, tag: "portfolio-alerts", portfolio: portfolio.slug }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setIsSuccess(true);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-panel border border-hairline rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-surface border border-hairline flex items-center justify-center text-forest">
              <Bell className="w-5 h-5 text-forest" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase">
                Rebalancing updates
              </div>
              <h3 className="text-lg font-bold text-olive">Get rebalancing updates by email</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink text-sm p-1 rounded-md hover:bg-forest-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-forest-surface text-forest flex items-center justify-center mx-auto border border-hairline">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-olive">You&apos;re on the list</h4>
              <p className="text-xs text-ink-dim max-w-xs mx-auto leading-relaxed">
                We&apos;ll email you when <strong>{portfolio.name}</strong> is rebalanced.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-ink-dim leading-relaxed">
              Enter your email and we&apos;ll send a note with the reasoning whenever this portfolio&apos;s weights change.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="portfolio-alert-email" className="block font-mono text-[10px] text-ink-dim uppercase tracking-wider font-bold">
                Email Address
              </label>
              <input
                id="portfolio-alert-email"
                type="email"
                required
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-hairline bg-ivory focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest text-ink"
              />
            </div>

            {errorMsg && <p className="text-[11px] text-red-700 font-mono">{errorMsg}</p>}

            <div className="flex items-center gap-2 text-[10px] font-mono text-ink-dim pt-1">
              <Shield className="w-3.5 h-3.5 text-forest shrink-0" />
              <span>Unsubscribe at any time.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-ink-dim hover:text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-rebalance-alert-btn"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Saving..." : "Email me updates"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
