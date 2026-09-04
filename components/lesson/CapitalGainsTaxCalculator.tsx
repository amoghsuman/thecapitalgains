"use client";

import { useMemo, useState } from "react";
import { CalcInput, CalcOutput, formatINR } from "./CalcShared";

// Indian capital gains tax rules — last reviewed against the rates
// introduced in the July 2024 Union Budget (effective for equity/real
// estate transactions from 23 July 2024) and the Finance Act 2023 change to
// debt mutual fund taxation (effective 1 April 2023). Tax rules change with
// nearly every Union Budget — review and update these constants
// periodically rather than trusting them indefinitely.
const EQUITY_STCG_RATE = 0.20;
const EQUITY_LTCG_RATE = 0.125;
const EQUITY_LTCG_EXEMPTION = 125000; // ₹1.25L, up from ₹1L pre-July 2024
const EQUITY_LTCG_THRESHOLD_MONTHS = 12;

const REAL_ESTATE_LTCG_THRESHOLD_MONTHS = 24;
// Post-July 2024, real estate LTCG offers a choice: 12.5% without
// indexation, or 20% with indexation (for property acquired before
// 23 July 2024), whichever is more beneficial. Only the no-indexation
// option is modeled here — indexation depends on the Cost Inflation Index
// for the specific purchase/sale years, which is out of scope for a quick
// illustrative calculator.
const REAL_ESTATE_LTCG_RATE_NO_INDEXATION = 0.125;

type AssetType = "equity" | "debt" | "realEstate";

export default function CapitalGainsTaxCalculator() {
  const [assetType, setAssetType] = useState<AssetType>("equity");
  const [purchasePrice, setPurchasePrice] = useState(100000);
  const [salePrice, setSalePrice] = useState(150000);
  const [holdingMonths, setHoldingMonths] = useState(18);
  const [slabRate, setSlabRate] = useState(30);

  const needsSlabRate =
    assetType === "debt" || (assetType === "realEstate" && holdingMonths <= REAL_ESTATE_LTCG_THRESHOLD_MONTHS);

  const result = useMemo(() => {
    const gain = salePrice - purchasePrice;
    if (gain <= 0) {
      return { classification: "No gain", tax: 0, gain, note: "No capital gains tax applies — sale price is at or below purchase price." };
    }

    if (assetType === "equity") {
      const isLongTerm = holdingMonths > EQUITY_LTCG_THRESHOLD_MONTHS;
      if (isLongTerm) {
        const taxableGain = Math.max(0, gain - EQUITY_LTCG_EXEMPTION);
        const tax = taxableGain * EQUITY_LTCG_RATE;
        return {
          classification: "Long-Term (LTCG)",
          tax,
          gain,
          note: `First ₹${EQUITY_LTCG_EXEMPTION.toLocaleString("en-IN")} of gains is exempt; ${EQUITY_LTCG_RATE * 100}% on the rest.`,
        };
      }
      return {
        classification: "Short-Term (STCG)",
        tax: gain * EQUITY_STCG_RATE,
        gain,
        note: `${EQUITY_STCG_RATE * 100}% flat on the full gain (equity, holding period ≤ ${EQUITY_LTCG_THRESHOLD_MONTHS} months).`,
      };
    }

    if (assetType === "debt") {
      // Since 1 April 2023, specified debt mutual funds lost indexation and
      // LTCG treatment entirely — gains are added to income and taxed at
      // the investor's slab rate, regardless of holding period.
      return {
        classification: "Taxed at slab rate (no LTCG benefit)",
        tax: gain * (slabRate / 100),
        gain,
        note: "Since April 2023, debt mutual funds no longer get indexation or long-term treatment — gains are added to your income and taxed at your slab rate.",
      };
    }

    // realEstate
    const isLongTerm = holdingMonths > REAL_ESTATE_LTCG_THRESHOLD_MONTHS;
    if (isLongTerm) {
      return {
        classification: "Long-Term (LTCG)",
        tax: gain * REAL_ESTATE_LTCG_RATE_NO_INDEXATION,
        gain,
        note: `${REAL_ESTATE_LTCG_RATE_NO_INDEXATION * 100}% without indexation shown here. You may instead be able to elect 20% with indexation if that works out lower for property bought before 23 July 2024 — consult a tax advisor to compare.`,
      };
    }
    return {
      classification: "Short-Term (STCG)",
      tax: gain * (slabRate / 100),
      gain,
      note: `Taxed at your income tax slab rate (real estate, holding period ≤ ${REAL_ESTATE_LTCG_THRESHOLD_MONTHS} months).`,
    };
  }, [assetType, purchasePrice, salePrice, holdingMonths, slabRate]);

  return (
    <div className="my-6 border border-hairline rounded-xl bg-panel p-6">
      <div className="font-mono text-[11px] text-ink-dim tracking-widest uppercase mb-5">Capital Gains Tax Calculator</div>

      <div className="flex flex-col gap-1.5 mb-4">
        <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">Asset Type</span>
        <div className="flex gap-2">
          {(["equity", "debt", "realEstate"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAssetType(t)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                assetType === t ? "bg-forest text-white border-forest" : "border-hairline text-ink-dim hover:border-gold"
              }`}
            >
              {t === "equity" ? "Equity" : t === "debt" ? "Debt" : "Real Estate"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <CalcInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} suffix="₹" min={0} step={1000} />
        <CalcInput label="Sale Price" value={salePrice} onChange={setSalePrice} suffix="₹" min={0} step={1000} />
        <CalcInput label="Holding Period" value={holdingMonths} onChange={setHoldingMonths} suffix="months" min={0} step={1} />
      </div>

      {needsSlabRate && (
        <div className="mb-4 max-w-xs">
          <CalcInput label="Your Income Tax Slab Rate" value={slabRate} onChange={setSlabRate} suffix="%" min={0} step={1} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 pb-4 border-t border-hairline">
        <CalcOutput label="Capital Gain" value={formatINR(result.gain)} />
        <CalcOutput label="Classification" value={result.classification} />
        <CalcOutput label="Estimated Tax" value={formatINR(result.tax)} />
      </div>
      <p className="text-[12px] text-ink-dim leading-relaxed">{result.note}</p>
      <p className="text-[11px] text-ink-dim/70 mt-2 italic">
        Illustrative estimate only, not tax advice. Rates shown reflect rules as of the July 2024 Union Budget and
        change frequently — verify current rates before relying on this for real decisions.
      </p>
    </div>
  );
}
