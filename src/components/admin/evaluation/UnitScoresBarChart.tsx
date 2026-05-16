import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UnitImprovementResponse } from "@/models/evaluation.model";

interface UnitScoresBarChartProps {
  units: UnitImprovementResponse[];
}

export function UnitScoresBarChart({ units }: UnitScoresBarChartProps) {
  if (units.length === 0) return null;

  const data = units.map((u) => ({
    name: `Ch.${u.unitNumber}`,
    first: u.firstScore ?? 0,
    last: u.lastScore ?? 0,
    best: u.bestScore ?? 0,
  }));

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Biểu đồ điểm theo chương
      </p>
      <div className="rounded-[4px] border border-slate-200 bg-white p-3">
        <div className="h-[180px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  fontSize: "12px",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
              />
              <Bar dataKey="first" name="Lần đầu" fill="#94a3b8" radius={0} />
              <Bar dataKey="last" name="Lần cuối" fill="#1e3a6e" radius={0} />
              <Bar dataKey="best" name="Cao nhất" fill="#ca8a04" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
