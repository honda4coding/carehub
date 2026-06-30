import { LuChevronDown } from "react-icons/lu";

export default function SelectDropdown({ value, onChange, options, icon, getLabel }: {
  value: string; onChange: (v: string) => void;
  options: string[]; icon: React.ReactNode; getLabel?: (v: string) => string;
}) {
  return (
    <div className="relative">
      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full ps-10 pe-9 py-2.5 text-[13.5px] font-semibold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{getLabel ? getLabel(o) : o}</option>)}
      </select>
      <LuChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px] pointer-events-none" />
    </div>
  );
}
