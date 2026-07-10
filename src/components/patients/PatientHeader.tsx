"use client";
import { useRouter } from "next/navigation";
import { LuCircleHelp, LuChevronLeft } from "react-icons/lu";
import { LuSearch } from "react-icons/lu";
import NotificationBell from "@/components/global/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  fullName: string;
  searchTerm: string;
  onSearch: (val: string) => void;
}

export default function PatientHeader({ fullName, searchTerm, onSearch }: Props) {
  const router = useRouter();

  return (
    <header className="bg-[hsl(var(--color-bg-surface))/80] backdrop-blur-xl border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[var(--shadow-sm)] transition-all duration-300">
      <div className="flex items-center gap-4 pl-11 md:pl-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-all duration-200 border border-[hsl(var(--color-border))] shrink-0 active:scale-95"
        >
          <LuChevronLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-[hsl(var(--color-text))] tracking-tight">
            Welcome back, {fullName.split(" ")[0]}!
          </h1>
          <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mt-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · CareHub Medical Record
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <NotificationBell basePath="/patient/notifications" />
      </div>
    </header>
  );
}
