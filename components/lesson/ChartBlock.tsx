"use client";

import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type ChartPoint = { label?: string; value?: number };
type ChartSeries = { label?: string; values?: number[] };

export type ChartBlockValue = {
  chartType?: "line" | "bar" | "area";
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data?: ChartPoint[];
  series?: ChartSeries[];
};

// Ivory Ledger palette, cycled across series in declared order. Hardcoded
// hex (not Tailwind classes) because recharts takes real color values as
// props, not className — these mirror the CSS custom properties in
// globals.css (--forest, --gold, --forest-tint, --gold-dark).
const SERIES_COLORS = ["#1B3A2B", "#A9822F", "#98A6A0", "#8A6825"];
const GRID_COLOR = "#DFD9C8";
const AXIS_COLOR = "#6E6A5F";
const CHART_MARGIN = { top: 5, right: 10, left: 0, bottom: 4 };

export default function ChartBlock({ value }: { value: ChartBlockValue }) {
  const chartType = value.chartType ?? "line";
  const data = value.data ?? [];
  const series = value.series ?? [];
  const hasMultiSeries = series.length > 0;

  const chartData = data.map((point, i) => {
    const row: Record<string, string | number> = { label: point.label ?? "" };
    if (hasMultiSeries) {
      series.forEach((s) => {
        row[s.label ?? "Series"] = s.values?.[i] ?? 0;
      });
    } else {
      row.value = point.value ?? 0;
    }
    return row;
  });

  const seriesKeys = hasMultiSeries ? series.map((s) => s.label ?? "Series") : ["value"];

  const axisTick = { fill: AXIS_COLOR, fontSize: 11 };
  const tooltipStyle = { background: "#FFFFFF", border: `1px solid ${GRID_COLOR}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="my-6">
      {(value.title || value.yAxisLabel) && (
        <div className="flex items-baseline justify-between mb-3 gap-3">
          {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide">{value.title}</p>}
          {value.yAxisLabel && <p className="font-mono text-[10px] text-ink-dim/70">{value.yAxisLabel}</p>}
        </div>
      )}
      <div className="border border-hairline rounded-xl bg-panel px-4 py-5">
        <ResponsiveContainer width="100%" height={320}>
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke={AXIS_COLOR} tick={axisTick} />
              <YAxis stroke={AXIS_COLOR} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
              {seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke={AXIS_COLOR} tick={axisTick} />
              <YAxis stroke={AXIS_COLOR} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
              {seriesKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={CHART_MARGIN}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke={AXIS_COLOR} tick={axisTick} />
              <YAxis stroke={AXIS_COLOR} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
              {seriesKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {value.xAxisLabel && (
        <p className="text-center font-mono text-[10px] text-ink-dim/70 mt-2">{value.xAxisLabel}</p>
      )}
    </div>
  );
}
