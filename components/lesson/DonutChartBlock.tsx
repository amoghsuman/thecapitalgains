"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DonutSlice = { label?: string; value?: number };

export type DonutChartValue = { title?: string; data?: DonutSlice[] };

// Distinguishable tints/shades derived from the two brand colors (forest
// #1B3A2B and gold #A9822F), varying lightness rather than introducing new
// hues, so a donut with more than 2 slices still reads as on-brand.
const DONUT_COLORS = ["#1B3A2B", "#A9822F", "#173224", "#8A6825", "#4C6B5A", "#C9A54D", "#0F241A", "#6E5620"];

export default function DonutChartBlock({ value }: { value: DonutChartValue }) {
  const data = (value.data ?? []).map((d) => ({ name: d.label ?? "", value: d.value ?? 0 }));

  return (
    <div className="mt-8">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">{value.title}</p>}
      <div className="border border-hairline border-t-4 border-t-gold rounded-xl bg-panel px-4 py-5">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #DFD9C8", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
