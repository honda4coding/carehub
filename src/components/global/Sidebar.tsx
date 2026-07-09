"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/adminService";
import { fetchClient } from "@/services/fetchClient";
import { LuTrendingUp } from "react-icons/lu";

import {
  LuLayoutDashboard,
  LuStethoscope,
  LuUsers,
  LuCalendarDays,
  LuShieldCheck,
  LuLifeBuoy,
  LuSettings,
  LuUser,
  LuClipboardList,
  LuHeartPulse,
  LuLogOut,
  LuMenu,
  LuX,
  LuChevronDown,
  LuSettings2,
  LuLock,
  LuActivity,
  LuHeart,
  LuBell,
  LuBrainCircuit,
  LuBuilding2,
  LuFileCheck,
  LuCreditCard,
  LuWallet,
} from "react-icons/lu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  subItems?: { label: string; href: string; icon: React.ReactNode }[];
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
        label: "Analytics",
        href: "/admin/analytics",
        icon: <LuTrendingUp />,
      },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Doctors", href: "/admin/doctors", icon: <LuStethoscope /> },
      { label: "Users", href: "/admin/users", icon: <LuUsers /> },
      { label: "Approvals", href: "/admin/approvals", icon: <LuShieldCheck /> },
      { label: "Support", href: "/admin/support-messages", icon: <LuLifeBuoy /> },
      {
        label: "Doctor Licenses",
        href: "/admin/doctors/licenses",
        icon: <LuFileCheck />,
      },
      {
        label: "Finance",
        href: "/admin/finance",
        icon: <LuWallet />,
        subItems: [
          {
            label: "Overview",
            href: "/admin/finance",
            icon: <LuWallet className="text-sm" />,
          },
          {
            label: "Commission Settings",
            href: "/admin/finance/settings",
            icon: <LuSettings2 className="text-sm" />,
          },
        ],
      },
      {
        label: "Payouts",
        href: "/admin/payouts",
        icon: <LuCreditCard />,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: <LuBell />,
      },
    ],
  },
];

const doctorNav: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Workspace", href: "/doctor", icon: <LuLayoutDashboard /> },
      {
        label: "Reports",
        href: "/doctor/reports",
        icon: <LuTrendingUp />,
      },
      {
        label: "Wallet",
        href: "/doctor/wallet",
        icon: <LuWallet />,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Clinics",
        href: "/doctor/clinics",
        icon: <LuBuilding2 />,
        subItems: [
          {
            label: "Appointments",
            href: "/doctor/appointments",
            icon: <LuCalendarDays className="text-sm" />,
          },
          {
            label: "Clinic Schedule",
            href: "/doctor/clinics",
            icon: <LuSettings2 className="text-sm" />,
          },
        ],
      },
      {
        label: "Patient Directory",
        href: "/doctor/patients",
        icon: <LuUsers />,
      },
      {
        label: "Manage Assistant",
        href: "/doctor/staff",
        icon: <LuUsers />,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        label: "My Knowledge Base",
        href: "/doctor/knowledge-base",
        icon: <LuBrainCircuit />,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/doctor/notifications",
        icon: <LuBell />,
      },
    ],
  },
];

const patientNav: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/patient", icon: <LuLayoutDashboard /> },
      {
        label: "Personal Tracking",
        href: "/patient/tracking",
        icon: <LuActivity />,
      },
      {
        label: "Wallet",
        href: "/patient/wallet",
        icon: <LuWallet />,
      },
    ],
  },
  {
    title: "Medical",
    items: [
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
    ],
  },
  {
    title: "Directory",
    items: [
      { label: "Doctors", href: "/patient/doctors", icon: <LuStethoscope /> },
      {
        label: "Notifications",
        href: "/patient/notifications",
        icon: <LuBell />,
      },
    ],
  },
];

// Assistant nav will be dynamically built inside the component based on permissions.
const assistantNav: NavSection[] = [];

const navMap: Record<string, NavSection[]> = {
  admin: adminNav,
  doctor: doctorNav,
  patient: patientNav,
  assistant: assistantNav,
};

////////////////////

// â”€â”€â”€ Expandable Settings group (Profile / Preferences / Security) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const settingsSub: Record<
  string,
  { label: string; href: string; icon: React.ReactNode }[]
> = {
  doctor: [
    {
      label: "Profile",
      href: "/doctor/profile",
      icon: <LuUser className="text-sm" />,
    },

    {
      label: "Security",
      href: "/doctor/security",
      icon: <LuLock className="text-sm" />,
    },
  ],
  patient: [
    {
      label: "Profile",
      href: "/patient/profile",
      icon: <LuUser className="text-sm" />,
    },
    {
      label: "Security",
      href: "/patient/security",
      icon: <LuLock className="text-sm" />,
    },
  ],
  admin: [
    {
      label: "Profile",
      href: "/admin/profile",
      icon: <LuUser className="text-sm" />,
    },
    {
      label: "Security",
      href: "/admin/security",
      icon: <LuLock className="text-sm" />,
    },
  ],
  assistant: [
    {
      label: "Profile",
      href: "/assistant/profile",
      icon: <LuUser className="text-sm" />,
    },
    {
      label: "Security",
      href: "/assistant/security",
      icon: <LuLock className="text-sm" />,
    },
  ],
};

function SettingsGroup({
  role,
  onClose,
}: {
  role: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const subItems = settingsSub[role] ?? [];
  // const anyActive = subItems.some((i) => pathname.startsWith(i.href));
  const anyActive = subItems.some((i) =>
    i.href === "/patient/profile" ||
    i.href === "/doctor/profile" ||
    i.href === "/admin/profile"
      ? pathname === i.href
      : pathname.startsWith(i.href),
  );

  const [open, setOpen] = useState(anyActive);

  return (
    <div className="mb-0.5">
      {/* Parent row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-150 ${
          anyActive
            ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]"
            : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]"
        }`}
      >
        <span
          className={`text-base ${anyActive ? "text-primary" : "text-[hsl(var(--color-text-muted)/0.7)]"}`}
        >
          <LuSettings />
        </span>
        <span className="flex-1 text-left">Settings</span>
        <LuChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Sub-items */}
      {open && (
        <div className="ml-4 mt-0.5 border-l border-[hsl(var(--color-border))] pl-3 space-y-0.5">
          {subItems.map((item) => {
            // const isActive = pathname.startsWith(item.href);
            const isActive =
              item.href === "/patient/profile" ||
              item.href === "/doctor/profile" ||
              item.href === "/admin/profile"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary-strong))]"
                    : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-primary"
                      : "text-[hsl(var(--color-text-muted)/0.6)]"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavGroup({ item, onClose }: { item: NavItem; onClose?: () => void }) {
  const pathname = usePathname();
  const subItems = item.subItems ?? [];
  const anyActive = subItems.some((i) =>
    i.href === item.href ? pathname === i.href : pathname.startsWith(i.href),
  );

  const [open, setOpen] = useState(anyActive);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-150 ${
          anyActive
            ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]"
            : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]"
        }`}
      >
        <span
          className={`text-base ${anyActive ? "text-primary" : "text-[hsl(var(--color-text-muted)/0.7)]"}`}
        >
          {item.icon}
        </span>
        <span className="flex-1 text-left">{item.label}</span>
        <LuChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="ml-4 mt-0.5 border-l border-[hsl(var(--color-border))] pl-3 space-y-0.5">
          {subItems.map((sub) => {
            const isActive =
              sub.href === item.href
                ? pathname === sub.href
                : pathname.startsWith(sub.href);
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onClose}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary-strong))]"
                    : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-primary"
                      : "text-[hsl(var(--color-text-muted)/0.6)]"
                  }
                >
                  {sub.icon}
                </span>
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

//////////////////

function SidebarContent({
  role,
  onClose,
  pendingApprovals,
  unreadNotifications,
  pendingLicenses,
}: {
  role: string;
  onClose?: () => void;
  pendingApprovals: number | null;
  unreadNotifications: number | null;
  pendingLicenses: number | null;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  let sections = navMap[role] ?? [];

  // Filter doctorNav based on subscription
  if (role === "doctor") {
    const isFree = user?.subscriptionPlan?.toLowerCase().includes("free") ?? true;
    const hasStaff = user?.subscriptionFeatures?.some(f => f.code === 'staff' && f.enabled) ?? !isFree;
    const hasAI = user?.subscriptionFeatures?.some(f => f.code === 'ai' && f.enabled) ?? false;
    const clinicLimit = user?.clinicLimit ?? (isFree ? 0 : 1);

    const hiddenLabels: string[] = [];

    // Clinics requires at least 1 clinic limit
    if (clinicLimit === 0) hiddenLabels.push("Clinics");

    // Staff requires staff feature
    if (!hasStaff) hiddenLabels.push("Staff & Logs");

    // AI requires AI feature
    if (!hasAI) hiddenLabels.push("My Knowledge Base");

    // Free users can't see Patient Directory
    if (isFree) hiddenLabels.push("Patient Directory");

    sections = sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => !hiddenLabels.includes(item.label)),
    })).filter((section) => section.items.length > 0);
  }

  if (role === "assistant" && user) {
    const assistantDynamicNav: NavSection[] = [
      {
        title: "Workspace",
        items: [
          { label: "Dashboard", href: "/assistant", icon: <LuLayoutDashboard /> },
          ...(user.permissions?.canManageAppointments ? [{ 
            label: "Appointments", 
            href: "/assistant/appointments", 
            icon: <LuCalendarDays />,
            subItems: [
              { label: "Appointments", href: "/assistant/appointments", icon: <LuCalendarDays className="text-sm" /> },
              { label: "My Schedule", href: "/assistant/appointments/schedule", icon: <LuSettings2 className="text-sm" /> },
            ],
          }] : []),
        ],
      },
      {
        title: "Patient Care",
        items: [
          ...(user.permissions?.canManagePatientsVitals || user.permissions?.canManagePatients ? [{ label: "Vitals Queue", href: "/assistant/vitals", icon: <LuHeartPulse /> }] : []),
          ...(user.permissions?.canManagePatientsFull ? [{ label: "Clinical Queue", href: "/assistant/assessment", icon: <LuStethoscope /> }] : []),
          ...(user.permissions?.canManagePatientsVitals || user.permissions?.canManagePatientsFull || user.permissions?.canManagePatients ? [{ label: "Patient Directory", href: "/assistant/patients", icon: <LuUsers /> }] : []),
        ],
      },
      {
        title: "Operations",
        items: [
          ...(user.permissions?.canManageBilling ? [{ label: "Billing", href: "/assistant/billing", icon: <LuWallet /> }] : []),
          ...(user.permissions?.canManageReports ? [{ label: "Reports & Analytics", href: "/assistant/reports", icon: <LuTrendingUp /> }] : []),
        ],
      },
    ];
    sections = assistantDynamicNav;
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : role.slice(0, 2).toUpperCase();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (user as any)?.profilepicture?.secure_url || null,
  );



  useEffect(() => {
    if (!avatarUrl) {
      const fetchAvatar = async () => {
        try {
          const route = role === 'assistant' ? '/users/profile' : `/${role}/profile`;
          const res = await fetchClient.get(route);
          const pic =
            res?.data?.profilepicture?.secure_url ||
            res?.data?.user?.profilepicture?.secure_url;
          if (pic) setAvatarUrl(pic);
        } catch {
          // ignore
        }
      };
      fetchAvatar();
    }
  }, [role, avatarUrl]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-[73px] shrink-0 flex items-center justify-between gap-3 px-5 border-b border-[hsl(var(--color-border))]">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
        >
          <LuActivity className="w-8 h-8 text-[hsl(var(--color-primary))] group-hover:scale-110 transition-transform shrink-0" />
          <div className="flex flex-col justify-center mt-0.5">
            <span className="text-[19px] font-bold text-[hsl(var(--color-text))] tracking-tight leading-none mb-[3px]">
              CareHub
            </span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] leading-none">
              {role} Portal
            </p>
          </div>
        </Link>
        {/* Close btn â€” mobile only */}
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
              if (item.subItems && item.subItems.length > 0) {
                return (
                  <NavGroup key={item.href} item={item} onClose={onClose} />
                );
              }

              const isActive =
                item.href === `/${role}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const badgeValue =
                role === "admin" && item.href === "/admin/approvals"
                  ? pendingApprovals
                  : role === "admin" && item.href === "/admin/doctors/licenses"
                    ? pendingLicenses
                    : item.href.endsWith("/notifications")
                      ? unreadNotifications
                      : item.badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] font-semibold mb-0.5 transition-all duration-150 ${
                    isActive ? "bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary-strong))] font-medium shadow-[var(--shadow-card)] translate-x-1" : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] hover:translate-x-0.5"
                  }`}
                >
                  <span
                    className={`text-base ${isActive ? "text-primary" : "text-[hsl(var(--color-text-muted)/0.7)]"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {!!badgeValue && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-[6px] bg-[hsl(var(--color-secondary))] text-white ml-auto">
                      {badgeValue}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Account â€” Settings expandable */}
        {role !== "assistant" && (
          <div className="mb-2">
            <p className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--color-text-muted)/0.55)]">
              Account
            </p>
            <SettingsGroup role={role} onClose={onClose} />
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-[hsl(var(--color-border))] mt-auto shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-[12px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] hover:border-[hsl(var(--color-border))] transition-colors group cursor-pointer">
          <div className="relative w-10 h-10 rounded-[8px] bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-primary))] text-[14px] font-black shrink-0 overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[hsl(var(--color-text))] truncate leading-tight mb-0.5">
              {user?.name ? user.name.split(" ")[0] : "Admin"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--color-primary))] leading-tight">
              {role}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] flex items-center justify-center hover:bg-[hsl(var(--color-danger)/0.2)] transition-all shrink-0"
            title="Sign out"
          >
            <LuLogOut className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number | null>(
    null,
  );
  const [pendingLicenses, setPendingLicenses] = useState<number | null>(null);

  // â”€â”€ Pending approvals badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (role !== "admin") return;

    const fetchPendingDoctors = async () => {
      try {
        const res = await adminService.getPendingDoctors();
        setPendingApprovals(res?.data.length || null);
      } catch {
        setPendingApprovals(null);
      }
    };

    fetchPendingDoctors();
    window.addEventListener("pending-approvals-changed", fetchPendingDoctors);
    return () =>
      window.removeEventListener(
        "pending-approvals-changed",
        fetchPendingDoctors,
      );
  }, [role]);

  // â”€â”€ Pending license updates badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (role !== "admin") return;

    const fetchPendingLicenses = async () => {
      try {
        const res = await adminService.getPendingLicenseDoctors();
        setPendingLicenses(res?.data?.length || null);
      } catch {
        setPendingLicenses(null);
      }
    };

    fetchPendingLicenses();
    window.addEventListener("pending-licenses-changed", fetchPendingLicenses);
    return () =>
      window.removeEventListener(
        "pending-licenses-changed",
        fetchPendingLicenses,
      );
  }, [role]);

  // â”€â”€ Unread notifications badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchUnreadCount = useCallback(async () => {
    if (role !== "admin" && role !== "patient" && role !== "doctor") return;
    try {
      const res = await fetchClient.get("/notifications", {
        params: { limit: "100" },
      });
      const notifications = res.data?.notifications ?? [];
      const count = notifications.filter(
        (n: { isRead: boolean }) => !n.isRead,
      ).length;
      setUnreadNotifications(count > 0 ? count : null);
    } catch {
      setUnreadNotifications(null);
    }
  }, [role]);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30s as a fallback (mirrors NotificationBell's polling interval)
    const interval = setInterval(fetchUnreadCount, 30_000);

    const handleNotificationsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setUnreadNotifications(customEvent.detail > 0 ? customEvent.detail : null);
    };

    // Also re-fetch instantly whenever NotificationBell or the notifications
    // page emits "notifications-changed" after a mark-as-read action
    window.addEventListener("notifications-changed", fetchUnreadCount);
    window.addEventListener("notifications-updated", handleNotificationsUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-changed", fetchUnreadCount);
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [fetchUnreadCount]);

  return (
    <>
      {/* â”€â”€ Desktop sidebar â”€â”€ */}
      <aside className="hidden md:flex w-[228px] shrink-0 flex-col bg-transparent border-r border-[hsl(var(--color-border))] h-screen sticky top-0">
        <SidebarContent
          role={role}
          pendingApprovals={pendingApprovals}
          unreadNotifications={unreadNotifications}
          pendingLicenses={pendingLicenses}
        />
      </aside>

      {open ? null : (
        <button
          id="sidebar-toggle"
          onClick={() => setOpen(true)}
          className="md:hidden print:hidden fixed top-3.5 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-[10px] bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
          aria-label="Open menu"
        >
          <LuMenu className="text-lg" />
        </button>
      )}

      {/* â”€â”€ Mobile drawer â”€â”€ */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-[hsl(var(--color-bg-surface))] border-r border-[hsl(var(--color-border))]">
            <SidebarContent
              role={role}
              onClose={() => setOpen(false)}
              pendingApprovals={pendingApprovals}
              unreadNotifications={unreadNotifications}
              pendingLicenses={pendingLicenses}
            />
          </aside>
        </>
      )}
    </>
  );
}
