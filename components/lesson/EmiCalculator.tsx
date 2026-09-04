"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalcInput, CalcOutput, formatINR } from "./CalcShared";

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(9);
  const [years, setYears] = useState(20);
  const [showSchedule, setShowSchedule] = useState(false);

  const { emi, totalPayment, totalInterest, yearlyBreakdown, monthlySchedule } = useMemo(() => {
    const r = interestRate / 100 / 12;
    const n = Math.max(1, Math.round(years * 12));
    // Standard reducing-balance EMI formula.
    const monthlyEmi = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // Amortize month by month once, aggregated into a year-by-year
    // principal vs interest split for the chart, and kept in full for the
    // expandable schedule below — computed from these same inputs, not
    // separately authored content.
    let balance = loanAmount;
    const yearly: { year: string; principal: number; interest: number }[] = [];
    const monthly: { month: number; principal: number; interest: number; balance: number }[] = [];
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
        monthly.push({
          month: y * 12 + m + 1,
          principal: Math.round(principalForMonth),
          interest: Math.round(interestForMonth),
          balance: Math.round(Math.max(balance, 0)),
        });
      }
      yearly.push({ year: `Yr ${y + 1}`, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest) });
    }

    const total = monthlyEmi * n;
    return { emi: monthlyEmi, totalPayment: total, totalInterest: total - loanAmount, yearlyBreakdown: yearly, monthlySchedule: monthly };
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

      <div className="mt-6 pt-6 border-t border-hairline">
        <button
          onClick={() => setShowSchedule((s) => !s)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={showSchedule}
        >
          <span className="font-mono text-[11px] text-ink tracking-widest uppercase">View Full Amortization Schedule</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className={`flex-shrink-0 text-ink-dim transition-transform duration-200 ${showSchedule ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showSchedule && (
          <div className="mt-4 max-h-80 overflow-y-auto border border-hairline rounded-lg">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-ivory">
                <tr>
                  <th className="text-left font-mono text-[10px] text-ink-dim uppercase tracking-wide px-3 py-2 border-b border-hairline">Month</th>
                  <th className="text-right font-mono text-[10px] text-ink-dim uppercase tracking-wide px-3 py-2 border-b border-hairline">Principal</th>
                  <th className="text-right font-mono text-[10px] text-ink-dim uppercase tracking-wide px-3 py-2 border-b border-hairline">Interest</th>
                  <th className="text-right font-mono text-[10px] text-ink-dim uppercase tracking-wide px-3 py-2 border-b border-hairline">Balance</th>
                </tr>
              </thead>
              <tbody>
                {monthlySchedule.map((row) => (
                  <tr key={row.month} className="border-b border-hairline last:border-b-0">
                    <td className="px-3 py-1.5 text-ink-dim">{row.month}</td>
                    <td className="px-3 py-1.5 text-right text-ink">{formatINR(row.principal)}</td>
                    <td className="px-3 py-1.5 text-right text-ink">{formatINR(row.interest)}</td>
                    <td className="px-3 py-1.5 text-right text-ink-dim">{formatINR(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
