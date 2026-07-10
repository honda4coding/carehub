import { useState, useRef, useEffect } from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";

export default function SelectDropdown({ value, onChange, options, icon }: {
  value: string; onChange: (v: string) => void;
  options: string[]; icon: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border bg-[hsl(var(--color-bg-surface))] cursor-pointer transition-all ${
          isOpen ? "border-[hsl(var(--color-primary))] ring-2 ring-[hsl(var(--color-primary)/0.15)]" : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.5)]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[hsl(var(--color-text-muted))] text-[15px] shrink-0">{icon}</span>
          <span className="text-[13.5px] font-semibold text-[hsl(var(--color-text))] truncate">{value}</span>
        </div>
        <LuChevronDown className={`text-[hsl(var(--color-text-muted))] text-[15px] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[hsl(var(--color-primary))]" : ""}`} />
      </div>

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-50 top-full left-0 right-0 mt-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl shadow-lg shadow-black/5 overflow-hidden transition-all duration-200 origin-top ${
          isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-h-[250px] overflow-y-auto p-1">
          {options.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-medium cursor-pointer transition-colors ${
                value === o 
                  ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]" 
                  : "text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface-hover))]"
              }`}
            >
              <span className="truncate">{o}</span>
              {value === o && <LuCheck className="text-[14px] shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
