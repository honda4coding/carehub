"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuSettings2, LuUsers } from "react-icons/lu";

const TABS = [
  { href: "/doctor/appointments/appointments", label: "Appointments", icon: LuUsers },
  {
    href: "/doctor/appointments/schedule",
    label: "My Schedule",
    icon: LuSettings2,
  },
];

export default function SectionToggle() {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))]">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-[9px] text-[12.5px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isActive
                ? "bg-primary text-white shadow-[0_2px_8px_hsl(var(--color-primary)/0.35)]"
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))]"
            }`}
          >
            <Icon className="text-[13px]" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
