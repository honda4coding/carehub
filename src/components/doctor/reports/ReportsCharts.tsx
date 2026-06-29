import React from "react";
import { LuActivity, LuFileChartPie } from "react-icons/lu";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";

interface ReportsChartsProps {
  visitTrends?: { date: string; visits: number }[];
  ageDemographics?: { name: string; count: number }[];
}

const DEMO_COLORS = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7"];

export default function ReportsCharts({
  visitTrends,
  ageDemographics,
}: ReportsChartsProps) {
  const t = useTranslations("doctor.reports");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visit Trends Area Chart */}
      <div className="lg:col-span-2 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuActivity className="text-[hsl(var(--color-primary))]" /> {t("visitTrends")}
            </h3>
            <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
              {t("visitTrendsDesc")}
            </p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={visitTrends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--color-primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--color-primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--color-border))"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fontWeight: "bold",
                  fill: "hsl(var(--color-text-muted))",
                }}
                dy={10}
                tickFormatter={(val) => val.split("-").slice(1).join("/")}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fontWeight: "bold",
                  fill: "hsl(var(--color-text-muted))",
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--color-bg-surface))",
                  border: "1px solid hsl(var(--color-border))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "hsl(var(--color-text))",
                }}
                itemStyle={{
                  fontWeight: "bold",
                  color: "hsl(var(--color-primary))",
                }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="hsl(var(--color-primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVisits)"
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--color-primary))",
                  stroke: "hsl(var(--color-bg-surface))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Demographics Pie Chart */}
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] p-5 shadow-sm">
        <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-1">
          <LuFileChartPie className="text-[hsl(var(--color-primary))]" />{" "}
          {t("patientDemographics")}
        </h3>
        <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mb-4">
          {t("patientDemographicsDesc")}
        </p>

        <div className="h-[250px] w-full">
          {ageDemographics &&
          ageDemographics.length > 0 &&
          ageDemographics.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageDemographics.filter((d) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {ageDemographics
                    .filter((d) => d.count > 0)
                    .map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DEMO_COLORS[index % DEMO_COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    backgroundColor: "hsl(var(--color-bg-surface))",
                    border: "1px solid hsl(var(--color-border))",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  itemStyle={{
                    color: "hsl(var(--color-text))",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))]">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[hsl(var(--color-text-muted))] text-sm font-bold bg-[hsl(var(--color-bg-soft))] rounded-xl border border-dashed border-[hsl(var(--color-border))]">
              {t("noDemographicsData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
