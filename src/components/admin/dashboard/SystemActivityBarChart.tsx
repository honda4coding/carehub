import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LuActivity } from "react-icons/lu";

interface ActivityItem {
  name: string;
  value: number;
}

interface SystemActivityBarChartProps {
  data: ActivityItem[];
  colors: string[];
}

export default function SystemActivityBarChart({ data, colors }: SystemActivityBarChartProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] flex items-center justify-center">
          <LuActivity className="text-[16px]" />
        </div>
        <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">System Activity Total</h2>
      </div>

      <div className="flex-1 w-full min-h-[250px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
            <RechartsTooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
