import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { LuFileChartPie } from "react-icons/lu";
import { useTranslations } from "next-intl";

interface SpecialtyData {
  name: string;
  value: number;
}

interface SpecialtyPieChartProps {
  data: SpecialtyData[];
  colors: string[];
}

export default function SpecialtyPieChart({ data, colors }: SpecialtyPieChartProps) {
    const t = useTranslations("auto");
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))] flex items-center justify-center">
          <LuFileChartPie className="text-[16px]" />
        </div>
        <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">{t('doctorsBySpecialty')}</h2>
      </div>

      <div className="flex-1 w-full min-h-[250px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {(data || []).slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <span className="text-[hsl(var(--color-text-muted))] truncate">{item.name}</span>
            </div>
            <span className="text-[hsl(var(--color-text))]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
