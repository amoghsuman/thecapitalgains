"use client";

import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalcInput, CalcOutput, formatINR } from "./CalcShared";

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const { totalInvested, futureValue, estimatedReturns, chartData } = useMemo(() => {
    const r = annualReturn / 100 / 12;
    // Standard SIP future value formula (annuity due — investment at the
    // start of each month, the usual convention for Indian SIPs).
    const computeFV = (months: number) => {
      if (months <= 0) return 0;
      if (r === 0) return monthly * months;
      return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    };
    const totalMonths = Math.max(1, Math.round(years * 12));
    const fv = computeFV(totalMonths);
    const invested = monthly * totalMonths;

    const data = Array.from({ length: Math.max(1, Math.round(years)) + 1 }, (_, yr) => {
      const months = yr * 12;
      return {
        year: `Yr ${yr}`,
        invested: Math.round(monthly * months),
        value: Math.round(computeFV(months)),
      };
    });

    return { totalInvested: invested, futureValue: fv, estimatedReturns: fv - invested, chartData: data };
  }, [monthly, annualReturn, years]);

  return (
    <div className="my-6 border border-hairline rounded-xl bg-panel p-6">
      <div className="font-mono text-[11px] text-ink-dim tracking-widest uppercase mb-5">SIP Calculator</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CalcInput label="Monthly Investment" value={monthly} onChange={setMonthly} suffix="₹" min={500} step={500} />
        <CalcInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} suffix="%" min={1} step={0.5} />
        <CalcInput label="Duration" value={years} onChange={setYears} suffix="years" min={1} step={1} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-hairline">
        <CalcOutput label="Total Invested" value={formatINR(totalInvested)} />
        <CalcOutput label="Estimated Returns" value={formatINR(estimatedReturns)} />
        <CalcOutput label="Total Value" value={formatINR(futureValue)} />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#DFD9C8" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke="#6E6A5F" tick={{ fill: "#6E6A5F", fontSize: 10 }} />
          <YAxis stroke="#6E6A5F" tick={{ fill: "#6E6A5F", fontSize: 10 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #DFD9C8", borderRadius: 8, fontSize: 12 }}
            formatter={(v: unknown) => formatINR(Number(v))}
          />
          <Area type="monotone" dataKey="invested" stroke="#98A6A0" fill="#98A6A0" fillOpacity={0.25} strokeWidth={2} name="Invested" />
          <Area type="monotone" dataKey="value" stroke="#1B3A2B" fill="#1B3A2B" fillOpacity={0.2} strokeWidth={2} name="Total Value" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
