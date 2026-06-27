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
  iconStyle = "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))]",
  trend,
  loading = false,
}: StatCardProps) {
  return (
    <Card className="p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 group hover:border-[hsl(var(--color-primary)/0.4)] transition-colors cursor-default">
      <div
        className={`w-10 h-10 md:w-14 md:h-14 rounded-[12px] md:rounded-[14px] flex items-center justify-center text-[18px] md:text-[24px] shadow-sm shrink-0 transition-transform group-hover:scale-105 ${iconStyle}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] md:text-[13px] font-bold text-[hsl(var(--color-text-muted))] truncate mb-0.5 md:mb-1">
          {label}
        </p>
        <div className="flex items-end gap-2">
          <h3 className="text-[18px] md:text-[26px] font-black text-[hsl(var(--color-text))] tracking-tight leading-none">
            {loading ? "—" : value}
          </h3>
          {trend && !loading && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-0.5 ${
                trend.isPositive
                  ? "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]"
                  : "bg-[hsl(var(--color-danger)/0.15)] text-[hsl(var(--color-danger))]"
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
