"use client";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { LuSearch } from "react-icons/lu";
import NotificationBell from "@/components/global/NotificationBell";

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

      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell basePath="/patient/notifications" />
      </div>
    </header>
  );
}
