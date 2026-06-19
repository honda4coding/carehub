"use client";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { LuBell, LuSearch } from "react-icons/lu";

interface Props {
  fullName: string;
  searchTerm: string;
  onSearch: (val: string) => void;
}

export default function PatientHeader({ fullName, searchTerm, onSearch }: Props) {
  return (
    <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Welcome back, {fullName.split(" ")[0]}!
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · CareHub Medical Record
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex">
          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[12px] rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none w-[200px] focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
          />
        </div>
        <button className="w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center relative hover:bg-[hsl(var(--color-bg-soft))] transition-all">
          <LuBell className="text-[15px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))]" />
        </button>
        <button className="hidden sm:flex w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] transition-all">
          <IoIosHelpCircleOutline className="text-[15px]" />
        </button>
      </div>
    </header>
  );
}
