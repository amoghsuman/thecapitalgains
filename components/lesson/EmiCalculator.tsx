"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalcInput, CalcOutput, formatINR } from "./CalcShared";

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(9);
  const [years, setYears] = useState(20);

  const { emi, totalPayment, totalInterest, yearlyBreakdown } = useMemo(() => {
    const r = interestRate / 100 / 12;
    const n = Math.max(1, Math.round(years * 12));
    // Standard reducing-balance EMI formula.
    const monthlyEmi = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // Amortize month by month, aggregated into a year-by-year principal vs
    // interest split — a full month-by-month table would be huge and isn't
    // useful for a "simple breakdown."
    let balance = loanAmount;
    const yearly: { year: string; principal: number; interest: number }[] = [];
    const wholeYears = Math.max(1, Math.round(years));
    for (let y = 0; y < wholeYears && balance > 0.01; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12 && balance > 0.01; m++) {
        const interestForMonth = balance * r;
        const principalForMonth = Math.min(monthlyEmi - interestForMonth, balance);
        balance -= principalForMonth;
        yearPrincipal += principalForMonth;
        yearInterest += interestForMonth;
      }
      yearly.push({ year: `Yr ${y + 1}`, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest) });
    }

    const total = monthlyEmi * n;
    return { emi: monthlyEmi, totalPayment: total, totalInterest: total - loanAmount, yearlyBreakdown: yearly };
  }, [loanAmount, interestRate, years]);

  return (
    <div className="my-6 border border-hairline rounded-xl bg-panel p-6">
      <div className="font-mono text-[11px] text-ink-dim tracking-widest uppercase mb-5">EMI Calculator</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CalcInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} suffix="₹" min={10000} step={10000} />
        <CalcInput label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" min={1} step={0.1} />
        <CalcInput label="Tenure" value={years} onChange={setYears} suffix="years" min={1} step={1} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-hairline">
        <CalcOutput label="Monthly EMI" value={formatINR(emi)} />
        <CalcOutput label="Total Interest" value={formatINR(totalInterest)} />
        <CalcOutput label="Total Payment" value={formatINR(totalPayment)} />
      </div>

      <p className="font-mono text-[10px] text-ink-dim tracking-widest uppercase mb-3">Yearly Principal vs Interest</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={yearlyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#DFD9C8" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke="#6E6A5F" tick={{ fill: "#6E6A5F", fontSize: 10 }} />
          <YAxis stroke="#6E6A5F" tick={{ fill: "#6E6A5F", fontSize: 10 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid #DFD9C8", borderRadius: 8, fontSize: 12 }}
            formatter={(v: unknown) => formatINR(Number(v))}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="principal" stackId="a" fill="#1B3A2B" name="Principal" />
          <Bar dataKey="interest" stackId="a" fill="#A9822F" name="Interest" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
