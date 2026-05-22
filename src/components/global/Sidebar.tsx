"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LuLayoutDashboard,
  LuStethoscope,
  LuUsers,
  LuCalendarDays,
  LuShieldCheck,
  LuSettings,
  LuUser,
  LuClipboardList,
  LuLogOut,
  LuMenu,
  LuX,
} from "react-icons/lu";
import { FaSquarePollVertical } from "react-icons/fa6";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNav: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: <LuLayoutDashboard /> },
      {
        label: "Doctors",
        href: "/admin/doctors",
        icon: <LuStethoscope />,
        badge: 3,
      },
      { label: "Patients", href: "/admin/patients", icon: <LuUsers /> },
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: <LuCalendarDays />,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Approvals",
        href: "/admin/approvals",
        icon: <LuShieldCheck />,
        badge: 5,
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: <FaSquarePollVertical />,
      },
      { label: "Settings", href: "/admin/settings", icon: <LuSettings /> },
    ],
  },
];

const doctorNav: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/doctor", icon: <LuLayoutDashboard /> },
      {
        label: "Appointments",
        href: "/doctor/appointments",
        icon: <LuCalendarDays />,
      },
      { label: "Patients", href: "/doctor/patients", icon: <LuUsers /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/doctor/profile", icon: <LuUser /> },
      { label: "Settings", href: "/doctor/settings", icon: <LuSettings /> },
    ],
  },
];

const patientNav: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/patient", icon: <LuLayoutDashboard /> },
      {
        label: "Appointments",
        href: "/patient/appointments",
        icon: <LuCalendarDays />,
      },
      {
        label: "Medical History",
        href: "/patient/history",
        icon: <LuClipboardList />,
      },
      { label: "Doctors", href: "/patient/doctors", icon: <LuStethoscope /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/patient/profile", icon: <LuUser /> },
      { label: "Settings", href: "/patient/settings", icon: <LuSettings /> },
    ],
  },
];

const navMap: Record<string, NavSection[]> = {
  admin: adminNav,
  doctor: doctorNav,
  patient: patientNav,
};

function SidebarContent({
  role,
  onClose,
}: {
  role: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const sections = navMap[role] ?? [];
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : role.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-[18px] border-b border-[hsl(var(--color-border))]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center text-white text-lg font-black shadow-[0_4px_12px_hsl(var(--color-primary)/0.35)]">
            +
          </div>
          <div>
            <p className="text-[15px] font-black text-[hsl(var(--color-text))] tracking-tight">
              Care<span className="text-primary">Hub</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))]">
              {role} Portal
            </p>
          </div>
        </div>
        {/* Close btn — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
          >
            <LuX className="text-xl" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <p className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--color-text-muted)/0.55)]">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === `/${role}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] font-semibold mb-0.5 transition-all duration-150 ${
                    isActive
                      ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]"
                      : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]"
                  }`}
                >
                  <span
                    className={`text-base ${isActive ? "text-primary" : "text-[hsl(var(--color-text-muted)/0.7)]"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-2.5 py-3 border-t border-[hsl(var(--color-border))] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-[11px] font-black shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[hsl(var(--color-text))] truncate">
            {user?.name ?? "Admin"}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-80">
            {role}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-7 h-7 rounded-lg bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center hover:opacity-80 transition-opacity"
          title="Sign out"
        >
          <LuLogOut className="text-[13px]" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ role }: { role: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-[228px] shrink-0 flex-col bg-[hsl(var(--color-bg-surface))] border-r border-[hsl(var(--color-border))] min-h-screen">
        <SidebarContent role={role} />
      </aside>

      {open ? null : (
        <button
          id="sidebar-toggle"
          onClick={() => setOpen(true)}
          className="md:hidden fixed top-[76px] left-4 z-40 w-9 h-9 flex items-center justify-center rounded-[10px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] shadow-sm"
          aria-label="Open menu"
        >
          <LuMenu className="text-lg" />
        </button>
      )}

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-[hsl(var(--color-bg-surface))] border-r border-[hsl(var(--color-border))] shadow-2xl">
            <SidebarContent role={role} onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
