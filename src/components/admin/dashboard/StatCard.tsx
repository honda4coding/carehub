import { Card } from "@/components/ui/Card";
import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconStyle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  iconStyle = "bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary-strong))]",
  trend,
  loading = false,
}: StatCardProps) {
  return (
    <Card className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 group hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)] cursor-default">
      <div
        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] truncate mb-1">
          {label}
        </p>
        <div className="flex items-end gap-2">
          <h3 className="text-2xl md:text-3xl font-bold text-[hsl(var(--color-text))] tracking-tight leading-none">
            {loading ? "—" : value}
          </h3>
          {trend && !loading && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md mb-0.5 ${
                trend.isPositive
                  ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
                  : "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
