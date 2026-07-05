"use client";
import { LuCircleHelp } from "react-icons/lu";
import { LuSearch } from "react-icons/lu";
import NotificationBell from "@/components/global/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  fullName: string;
  searchTerm: string;
  onSearch: (val: string) => void;
}

export default function PatientHeader({ fullName, searchTerm, onSearch }: Props) {
  return (
    <header className="bg-[hsl(var(--color-bg-surface))/80] backdrop-blur-xl border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[var(--shadow-sm)] transition-all duration-300">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
          Welcome back, {fullName.split(" ")[0]}!
        </h1>
        <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · CareHub Medical Record
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <NotificationBell basePath="/patient/notifications" />
      </div>
    </header>
  );
}
