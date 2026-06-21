"use client";

import { useEffect, useState } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuUsers,
  LuStethoscope,
  LuCalendarDays,
  LuClock,
  LuSearch,
  LuCheck,
  LuX,
  LuTriangleAlert,
  LuUserPlus,
} from "react-icons/lu";

import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { DoctorApprovalStatus, PendingDoctorRequest } from "@/types/doctor";
import { DailyStats } from "@/types/admin";
import { fetchClient } from "@/services/fetchClient";
import Link from "next/link";
import NotificationBell from "@/components/admin/notifications/NotificationBell";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip as RechartsTooltip } from "recharts";

// Max years logic
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

const statusConfig: Record<
  DoctorApprovalStatus,
  { style: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Pending",
    icon: <LuClock className="text-[10px]" />,
  },
  approved: {
    style:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    label: "Approved",
    icon: <LuCheck className="text-[10px]" />,
  },
  rejected: {
    style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
    label: "Rejected",
    icon: <LuX className="text-[10px]" />,
  },
};

const avatarStyles = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
];

/* Format ISO date string as a short time, e.g. "2 min ago", "Yesterday" */
function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just Now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  // Pending doctor approval requests (used for the approvals table + activity feed + stat card)
  const [requests, setRequests] = useState<PendingDoctorRequest[]>([]);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Dashboard summary counts (Total Patients / Active Doctors / Total Doctors)
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [activeDoctors, setActiveDoctors] = useState<number | null>(null);
  const [totalDoctors, setTotalDoctors] = useState<number | null>(null);
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const router = useRouter();

  const pendingCount = requests.length;

  const STATS = [
    {
      label: "Total Patients",
      value: statsLoading
        ? "—"
        : totalPatients !== null
          ? totalPatients.toLocaleString()
          : "—",
      icon: <LuUsers />,
      iconStyle:
        "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    },
    {
      label: "Active Doctors",
      value: statsLoading
        ? "—"
        : activeDoctors !== null
          ? activeDoctors.toLocaleString()
          : "—",
      icon: <LuStethoscope />,
      iconStyle:
        "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
    },
    {
      label: "Appointments",
      value: statsLoading
        ? "—"
        : totalAppointments !== null
          ? totalAppointments.toLocaleString()
          : "—",
      icon: <LuCalendarDays />,
      iconStyle:
        "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    },
    {
      label: "Pending Requests",
      value: loading ? "—" : `${pendingCount}`,
      icon: <LuClock />,
      iconStyle:
        "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    },
  ];

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setRequestsError(null);
      try {
        const res = await adminService.getPendingDoctors();
        setRequests(res.data || []);
      } catch (err: any) {
        console.error("Failed to fetch pending doctors", err);
        setRequestsError(err?.message ?? "Failed to fetch pending doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const dashboard = await adminService.getDashboard();

        setTotalPatients(dashboard.data.totalPatients);
        setTotalDoctors(dashboard.data.totalDoctors);
        setTotalAppointments(dashboard.data.totalAppointments);
        setActiveDoctors(
          dashboard.data.totalDoctors -
            dashboard.data.pendingDoctors -
            ((dashboard.data as any).rejectedDoctors || 0),
        );
      } catch (err: any) {
        console.error("Dashboard stats error:", err);
        setStatsError(err?.message ?? "Failed to load dashboard statistics.");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await adminService.getDailyStats();
        setDailyStats(res.data);
      } catch (err) {
        console.error("Failed to fetch daily stats", err);
      }
    };
    fetchDaily();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const res = await fetchClient.get("/notifications", { params: { limit: "5" } });
        setRecentActivities(res.data?.notifications ?? []);
      } catch (err) {
        console.error("Failed to fetch activities", err);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filtered = requests.filter(
    (r) =>
      (r.fullName ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (r.specialty ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <>
      <div className="flex flex-col flex-1 min-h-screen">
        {/* ── Topbar ── */}
        <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="md:block">
            <h1 className="text-[15px] md:text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Dashboard
            </h1>
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-3 md:p-4"
              >
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-[10px] flex items-center justify-center text-base md:text-[17px] ${s.iconStyle}`}
                  >
                    {s.icon}
                  </div>
                </div>
                <p className="text-[20px] md:text-[24px] font-black text-[hsl(var(--color-text))] tracking-tight leading-none">
                  {s.value}
                </p>
                <p className="text-[11px] md:text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Chart */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">
                  Activity - Last 30 Days
                </p>
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <XAxis dataKey="date" hide />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '8px', border: '1px solid hsl(var(--color-border))', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      labelStyle={{ color: 'hsl(var(--color-text-muted))', marginBottom: '2px' }}
                    />
                    <Line type="monotone" name="Users" dataKey="usersCount" stroke="#6C5DD3" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" name="Appointments" dataKey="appointmentsCount" stroke="#00BFA6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-auto pt-3 border-t border-[hsl(var(--color-border))]">
                {[
                  {
                    val: statsLoading
                      ? "—"
                      : totalPatients !== null
                        ? totalPatients.toLocaleString()
                        : "—",
                    lbl: "Total Patients",
                    dotClass: "bg-primary",
                  },
                  {
                    val: statsLoading
                      ? "—"
                      : totalDoctors !== null
                        ? totalDoctors.toLocaleString()
                        : "—",
                    lbl: "Total Doctors",
                    dotClass: "bg-secondary",
                  },
                  {
                    val: statsLoading
                      ? "—"
                      : totalAppointments !== null
                        ? totalAppointments.toLocaleString()
                        : "—",
                    lbl: "Appointments",
                    dotClass: "bg-[hsl(var(--color-success))]",
                  },
                ].map((s) => (
                  <div key={s.lbl} className="flex-1">
                    <p className="text-[16px] font-black text-[hsl(var(--color-text))]">
                      {s.val}
                    </p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full inline-block shrink-0 ${s.dotClass}`}
                      />
                      {s.lbl}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">
                  Recent Activity
                </p>
              </div>
              <div className="flex flex-col">
                {activitiesLoading ? (
                  <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">
                    Loading activities...
                  </p>
                ) : recentActivities.length === 0 ? (
                  <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">
                    No recent activity
                  </p>
                ) : (
                  recentActivities.slice(0, 4).map((n, i, arr) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-[hsl(var(--color-border-soft))]" : ""}`}
                    >
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] shrink-0 bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                         <LuClock />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--color-text))] leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                          {formatRelativeTime(n.createdAt)}
                          {n.type ? ` · ${n.type}` : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Stats error banner */}
          {statsError && (
            <div className="mb-4 flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-3.5 py-2.5">
              <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[14px] shrink-0" />
              <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))] flex-1">
                {statsError}
              </p>
            </div>
          )}

          {/* Approvals table */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">
                Pending Doctor Approvals
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="relative flex items-center flex-1 sm:flex-none">
                  <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full sm:w-[120px] outline-none focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
                  />
                </div>
                <Link
                  href="/admin/approvals"
                  className="text-[12px] font-bold text-primary whitespace-nowrap"
                >
                  View all ›
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              {loading ? (
                <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">
                  Loading...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">
                  No pending requests
                </p>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <table className="w-full min-w-full hidden lg:table">
                    <thead>
                      <tr className="border-b border-[hsl(var(--color-border))]">
                        {["Doctor", "Specialty", "Submitted", "Status"].map(
                          (h, i) => (
                            <th
                              key={h}
                              className="pb-3 text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-[.07em] text-left"
                              style={{ textAlign: i === 3 ? "right" : "left" }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((req, index) => {
                        const sc = statusConfig[req.status];
                        const initials = (req.fullName ?? "??")
                          .slice(0, 2)
                          .toUpperCase();
                        const avatarStyle =
                          avatarStyles[index % avatarStyles.length];
                        return (
                          <tr
                            key={req._id}
                            onClick={() => router.push("/admin/approvals")}
                            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                          >
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${avatarStyle}`}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">
                                    {req.fullName}
                                  </p>
                                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                                    {req.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 pr-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                              {req.specialty ?? "—"}
                            </td>
                            <td className="py-3.5 pr-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                              >
                                {sc.icon} {sc.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="lg:hidden flex flex-col gap-3 py-2">
                    {filtered.map((req, index) => {
                      const sc = statusConfig[req.status];
                      const initials = (req.fullName ?? "??").slice(0, 2).toUpperCase();
                      const avatarStyle = avatarStyles[index % avatarStyles.length];
                      
                      return (
                        <div 
                          key={req._id} 
                          onClick={() => router.push("/admin/approvals")}
                          className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${avatarStyle}`}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">{req.fullName}</p>
                                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{req.email}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${sc.style}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--color-border-soft))] text-[12px]">
                            <div>
                              <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mr-2">Specialty:</span>
                              <span className="font-semibold text-[hsl(var(--color-text))]">{req.specialty ?? "—"}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
