"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuSettings2, LuUsers } from "react-icons/lu";

const TABS = [
  { href: "/doctor/appointments", label: "Appointments", icon: LuUsers },
  {
    href: "/doctor/appointments/schedule",
    label: "My Schedule",
    icon: LuSettings2,
  },
];

export default function SectionToggle() {
  const pathname = usePathname();

  return (
    <div className="relative inline-flex items-center p-1.5 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border))]">
      {TABS.map((tab) => {
        const isActive = tab.href === "/doctor/appointments" 
          ? pathname === "/doctor/appointments" 
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative z-10 px-4 sm:px-6 py-2 rounded-[9px] text-[13px] font-bold transition-all duration-300 flex items-center gap-2 ${
              isActive
                ? "bg-[hsl(var(--color-bg-surface))] text-primary "
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
            }`}
          >
            <Icon className="text-[15px]" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
