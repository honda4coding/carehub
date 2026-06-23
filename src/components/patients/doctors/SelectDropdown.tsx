import { LuChevronDown } from "react-icons/lu";

export default function SelectDropdown({ value, onChange, options, icon }: {
  value: string; onChange: (v: string) => void;
  options: string[]; icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-10 pr-9 py-2.5 text-[13.5px] font-semibold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px] pointer-events-none" />
    </div>
  );
}
