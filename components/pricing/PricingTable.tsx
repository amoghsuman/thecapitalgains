"use client";

import { useState } from "react";
import SubscribeButton from "@/components/pricing/SubscribeButton";
import {
  TABLE_LAYOUT,
  type BillingCycle,
  type ResolvedService,
  type ServiceKey,
} from "@/lib/plans";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function effectivePrice(service: ResolvedService, billing: BillingCycle): number {
  return billing === "annual" ? service.priceAnnual : service.priceMonthly;
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, free }: { checked: boolean; free?: boolean }) {
  if (free) {
    return (
      <span className="font-mono text-[10px] text-[#D4860A] tracking-widest font-bold uppercase">
        Included
      </span>
    );
  }
  return (
    <div
      className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        checked ? "bg-[#D4860A] border-[#D4860A]" : "border-[#C4B8E0] bg-white"
      }`}
    >
      {checked && (
        <svg width="11" height="11" fill="none" viewBox="0 0 12 12">
          <path
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

// ─── Total display ────────────────────────────────────────────────────────────

function TotalDisplay({
  subTotal,
  oneTimeTotal,
  billing,
}: {
  subTotal: number;
  oneTimeTotal: number;
  billing: BillingCycle;
}) {
  if (subTotal === 0 && oneTimeTotal === 0) {
    return <div className="font-mono text-2xl font-bold text-white">Free</div>;
  }

  if (subTotal > 0 && oneTimeTotal > 0) {
    return (
      <div>
        <div className="font-mono text-lg font-bold text-white leading-tight">
          {fmt(subTotal)}
          <span className="text-sm font-normal text-white/50">/mo</span>
          <span className="text-sm font-normal text-white/40"> + </span>
          {fmt(oneTimeTotal)}
          <span className="text-sm font-normal text-white/50"> one-time</span>
        </div>
        {billing === "annual" && (
          <div className="font-mono text-[10px] text-white/40 text-right mt-0.5">
            billed annually
          </div>
        )}
      </div>
    );
  }

  if (subTotal > 0) {
    return (
      <div>
        <div className="font-mono text-2xl font-bold text-white leading-tight">
          {fmt(subTotal)}
          <span className="text-base font-normal text-white/50">/mo</span>
        </div>
        {billing === "annual" && (
          <div className="font-mono text-[10px] text-white/40 text-right mt-0.5">
            billed annually
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-mono text-2xl font-bold text-white leading-tight">
      {fmt(oneTimeTotal)}
      <span className="text-base font-normal text-white/50"> one-time</span>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export default function PricingTable({ services }: { services: ResolvedService[] }) {
  const serviceMap = Object.fromEntries(services.map((s) => [s.key, s])) as Record<
    ServiceKey,
    ResolvedService
  >;

  const [selected, setSelected] = useState<Set<ServiceKey>>(new Set(["free"]));
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  // Checkout supports one payable item at a time (Razorpay charges one entity
  // per checkout). Selecting any service replaces the previous selection; the
  // free tier is always present and never counts as a payable selection.
  function toggle(key: ServiceKey) {
    if (key === "free") return;
    setSelected((prev) =>
      prev.has(key) ? new Set<ServiceKey>(["free"]) : new Set<ServiceKey>(["free", key])
    );
  }

  const selectedServices = services.filter((s) => selected.has(s.key));
  const subTotal = selectedServices
    .filter((s) => s.billingType === "subscription")
    .reduce((sum, s) => sum + effectivePrice(s, billing), 0);
  const oneTimeTotal = selectedServices
    .filter((s) => s.billingType === "one-time")
    .reduce((sum, s) => sum + s.priceMonthly, 0);

  const selectedPills = selectedServices.filter((s) => s.billingType !== "free");

  return (
    <div className="min-h-screen pb-32">

      {/* ── HERO ── */}
      <header className="pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] rounded-full bg-[rgba(139,92,246,0.08)] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] rounded-full bg-[rgba(99,102,241,0.06)] blur-[100px]" />
        </div>
        <div className="site-container relative z-10">
          <div className="font-mono text-[11px] text-[#A78BFA] tracking-[0.3em] font-bold uppercase mb-4">
            Pricing
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Choose what you need.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Choose the plan that fits. Pay only for what you use.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white/10 border border-white/15 rounded-2xl p-1.5">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-7 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
                billing === "monthly"
                  ? "bg-white text-[#1E1245] shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-7 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
                billing === "annual"
                  ? "bg-white text-[#1E1245] shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Annual, Save 20%
            </button>
          </div>
        </div>
      </header>

      {/* ── PRICING TABLE ── */}
      <div className="site-container pt-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-x-auto border border-[rgba(30,18,69,0.08)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[rgba(30,18,69,0.08)]">
                <th className="text-left py-3 pl-5 pr-4 text-[11px] font-bold text-[#8B7BAB] tracking-[0.15em] uppercase w-[38%]">
                  Service
                </th>
                <th className="hidden md:table-cell text-left py-3 px-4 text-[11px] font-bold text-[#8B7BAB] tracking-[0.15em] uppercase">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-[11px] font-bold text-[#8B7BAB] tracking-[0.15em] uppercase">
                  Price
                </th>
                <th className="text-center py-3 pr-5 pl-2 text-[11px] font-bold text-[#8B7BAB] tracking-[0.15em] uppercase w-16">
                  Select
                </th>
              </tr>
            </thead>
            <tbody>
              {TABLE_LAYOUT.map((row, i) => {
                if (row.kind === "divider") {
                  return (
                    <tr key={`divider-${i}`} className="bg-[#F7F5FF]">
                      <td
                        colSpan={4}
                        className="py-2 px-5 text-xs font-bold text-[#8B7BAB] tracking-widest uppercase"
                      >
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                const service = serviceMap[row.key];
                if (!service) return null;
                const isSelected = selected.has(service.key);
                const isFree = service.billingType === "free";
                const isOneTime = service.billingType === "one-time";
                const displayPrice = effectivePrice(service, billing);
                const showAnnualBadge =
                  billing === "annual" && service.billingType === "subscription";
                const showOneTimeMuted = billing === "annual" && isOneTime;

                return (
                  <tr
                    key={service.key}
                    onClick={() => toggle(service.key)}
                    className={`border-b border-[rgba(30,18,69,0.06)] last:border-0 transition-colors select-none ${
                      isFree ? "cursor-default" : "cursor-pointer"
                    } ${isSelected ? "bg-[#F3F0FF]" : "bg-white hover:bg-[#FAFAF7]"}`}
                  >
                    {/* Name — carries the left border indicator */}
                    <td
                      className={`py-4 pr-4 pl-5 border-l-[3px] transition-colors ${
                        isSelected ? "border-l-[#1E1245]" : "border-l-transparent"
                      }`}
                    >
                      <div className="font-semibold text-[14px] text-[#1E1245] leading-snug">
                        {service.name}
                      </div>
                      {/* Description visible inline on mobile only */}
                      <div className="md:hidden text-[12px] text-[#8B7BAB] mt-0.5 leading-snug font-normal">
                        {service.description}
                      </div>
                    </td>

                    {/* Description — desktop only */}
                    <td className="hidden md:table-cell py-4 px-4 text-[13px] text-[#6B7280] leading-snug">
                      {service.description}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right whitespace-nowrap align-top">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-[15px] font-bold text-[#1E1245]">
                            {service.priceMonthly === 0 ? "Free" : fmt(displayPrice)}
                          </span>
                          {service.billingLabel && (
                            <span className="font-mono text-[11px] text-[#8B7BAB]">
                              {service.billingLabel}
                            </span>
                          )}
                        </div>
                        {showAnnualBadge && (
                          <span className="inline-flex items-center bg-[#E8F5EE] text-[#1A7A4A] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                            Save 20%
                          </span>
                        )}
                        {showOneTimeMuted && (
                          <span className="text-[10px] text-[#8B7BAB] leading-none text-right">
                            One-time · not affected
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Checkbox */}
                    <td className="py-4 pr-5 pl-2 text-center align-middle">
                      <div className="flex items-center justify-center">
                        <Checkbox checked={isSelected} free={isFree} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SEBI disclaimer */}
        <p className="text-sm text-[#C7BEE6] text-center max-w-2xl mx-auto mt-8 mb-8 leading-relaxed">
          ⚖ Research and advisory services are provided under SEBI (Research Analyst) Regulations,
          2014. Registration No: [SEBI_RA_REG_NO]. Individual subscription fees are subject to
          SEBI-prescribed caps (₹1.5L per annum). For institutional or bulk pricing, write to{" "}
          <a
            href="mailto:hello@thecapitalgains.com"
            className="text-[#D4860A] hover:text-[#B8720A] transition-colors"
          >
            hello@thecapitalgains.com
          </a>
        </p>
      </div>

      {/* ── STICKY TOTAL BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1245] border-t border-white/10 px-6 py-4 shadow-2xl">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">

            {/* Pills — full width on mobile, flex-1 on desktop */}
            <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              {selectedPills.length === 0 ? (
                <span className="text-white/40 text-sm italic">No services selected</span>
              ) : (
                selectedPills.map((s) => (
                  <span
                    key={s.key}
                    className="bg-[#D4860A] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                  >
                    {s.name}
                  </span>
                ))
              )}
            </div>

            {/* Price + button — flex-row on both mobile and desktop */}
            <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 flex-shrink-0">
              <div className="text-right">
                <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-0.5">
                  Total
                </div>
                <TotalDisplay
                  subTotal={subTotal}
                  oneTimeTotal={oneTimeTotal}
                  billing={billing}
                />
              </div>
              <SubscribeButton
                selectedPlans={selectedPills.map((s) => ({
                  key: s.key,
                  name: s.name,
                  billingType: s.billingType,
                }))}
                billing={billing}
                totalAmount={subTotal + oneTimeTotal}
              />
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
