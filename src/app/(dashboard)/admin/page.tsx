"use client";

import { useEffect, useState } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuUsers, LuStethoscope, LuCalendarDays, LuClock, LuBell, LuSearch,
  LuCheck, LuX, LuTriangleAlert, LuUserPlus,
} from "react-icons/lu";

import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { DoctorApprovalStatus, PendingDoctorRequest } from "@/types/doctor";
import Link from "next/link";

// CHART_MONTHS remains static placeholder data: no backend endpoint currently
// exposes monthly registration trends. See report for the proposed
// `/admin/stats/monthly-overview` endpoint.
const CHART_MONTHS = [
  { month: "Jan", pct: 55 }, { month: "Feb", pct: 68 },
  { month: "Mar", pct: 58 }, { month: "Apr", pct: 83 },
  { month: "May", pct: 92 }, { month: "Jun", pct: 78 },
];

const statusConfig: Record<DoctorApprovalStatus, { style: string; label: string; icon: React.ReactNode }> = {
  pending:  { style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",  label: "Pending",  icon: <LuClock className="text-[10px]" /> },
  approved: { style: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]", label: "Approved", icon: <LuCheck className="text-[10px]" /> },
  rejected: { style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",    label: "Rejected", icon: <LuX className="text-[10px]" /> },
};

const avatarStyles = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
];

/* Format ISO date string as a short time, e.g. "2 min ago", "Yesterday" */
function formatRelativeTime(iso: string){
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60)); 
  const hours = Math.floor(diffMs / (1000 * 60 * 60)); 
  const days = Math.floor(diffMs / (1000 * 60 * 60 *24)); 

  if (minutes < 1) return "Just Now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours===1 ? "" : "s" } ago`;
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const router = useRouter();

  const pendingCount = requests.length;

    const STATS = [
  { 
    label: "Total Patients",   
    value: statsLoading ? "—" : totalPatients !== null ? totalPatients.toLocaleString() : "—" , 
    icon: <LuUsers />, 
    iconStyle: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]" },
  { 
    label: "Active Doctors",   
    value: statsLoading ? "—" : activeDoctors !== null ? activeDoctors.toLocaleString() : "—",   
    icon: <LuStethoscope />,  
    iconStyle: "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]" },
  { 
    label: "Appointments",     
    value: "491",   
    icon: <LuCalendarDays />, 
    iconStyle: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" },
  { 
    label: "Pending Requests", 
    value: loading ? "—" : `${pendingCount}`, 
    icon: <LuClock />,        
    iconStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]" },
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

  useEffect(()=>{
    const fetchStats = async () =>
    {  
      setStatsLoading(true);
      setStatsError(null);
      try{
          const dashboard = await adminService.getDashboard();

          setTotalPatients(dashboard.data.totalPatients);
          setTotalDoctors(dashboard.data.totalDoctors);
          setActiveDoctors(dashboard.data.totalDoctors - dashboard.data.pendingDoctors - ((dashboard.data as any).rejectedDoctors || 0));
      }
      catch(err: any){
        console.error("Dashboard stats error:", err);
        setStatsError(err?.message ?? "Failed to load dashboard statistics.");
      }
      finally{
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [])

  const filtered = requests.filter((r) =>
      (r.fullName ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (r.specialty ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col flex-1 min-h-screen">

        {/* ── Topbar ── */}
        <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="md:block">
            <h1 className="text-[15px] md:text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">Dashboard</h1>
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
            <div className="relative items-center hidden sm:flex">
              <LuSearch className="absolute left-2.5 text-[13px] text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-[12px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-[140px] outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-white))] transition-colors"
              />
            </div>
            <button className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] relative transition-colors">
              <LuBell className="text-[15px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-secondary-strong))] border-2 border-[hsl(var(--color-bg-surface))]" />
            </button>
            <button className="hidden sm:flex w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
              <IoIosHelpCircleOutline className="text-[15px]" />
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-[10px] flex items-center justify-center text-base md:text-[17px] ${s.iconStyle}`}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-[20px] md:text-[24px] font-black text-[hsl(var(--color-text))] tracking-tight leading-none">{s.value}</p>
                <p className="text-[11px] md:text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

            {/* Chart */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">Monthly Overview</p>
                <span className="text-[12px] font-bold text-primary cursor-pointer">2026 ▾</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {CHART_MONTHS.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-[5px] bg-gradient-doctor hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ height: `${m.pct}%` }}
                    />
                    <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))]">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4 pt-3 border-t border-[hsl(var(--color-border))]">
                {[
                  { val: statsLoading ? "—" : totalPatients !== null ? totalPatients.toLocaleString() : "—", lbl: "Total Patients", dotClass: "bg-primary" },
                  { val: statsLoading ? "—" : totalDoctors !== null ? totalDoctors.toLocaleString() : "—",   lbl: "Total Doctors",  dotClass: "bg-secondary" },
                  { val: "491", lbl: "Appointments", dotClass: "bg-[hsl(var(--color-success))]" },
                ].map((s) => (
                  <div key={s.lbl} className="flex-1">
                    <p className="text-[16px] font-black text-[hsl(var(--color-text))]">{s.val}</p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${s.dotClass}`} />
                      {s.lbl}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">Recent Activity</p>
                <span className="text-[12px] font-bold text-primary cursor-pointer">View all</span>
              </div>
               <div className="flex flex-col">
                {loading ? (
                  <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">Loading...</p>
                ) : requestsError ? (
                  <p className="text-center text-[12px] text-[hsl(var(--color-danger))] py-6">{requestsError}</p>
                ) : requests.length === 0 ? (
                  <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">No recent activity</p>
                ) : (
                  [...requests]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4)
                    .map((r, i, arr) => (
                      <div key={r._id} className={`flex items-start gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-[hsl(var(--color-border-soft))]" : ""}`}>
                        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] shrink-0 bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                          <LuUserPlus />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-[hsl(var(--color-text))] leading-snug">
                            New doctor registration — {r.fullName}
                          </p>
                          <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                            {formatRelativeTime(r.createdAt)}{r.specialty ? ` · ${r.specialty}` : ""}
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
              <p className="text-[13px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.04em]">Pending Doctor Approvals</p>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-[120px] outline-none focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
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
                <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">No pending requests</p>
              ) : (
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--color-border))]">
                      {["Doctor", "Specialty", "Submitted", "Status"].map((h, i) => (
                        <th
                          key={h}
                          className="pb-2.5 text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-[.07em] text-left"
                          style={{ textAlign: i === 4 ? "right" : "left" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((req, index) => {
                      const sc = statusConfig[req.status];
                      const initials = (req.fullName ?? "??").slice(0, 2).toUpperCase();
                      const avatarStyle = avatarStyles[index % avatarStyles.length];
                      return (
                        <tr
                            key={req._id}
                            onClick={() => router.push("/admin/approvals")}
                            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                          >
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarStyle}`}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">{req.fullName}</p>
                                <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{req.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {req.specialty ?? "—"}
                          </td>
                          <td className="py-2.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.style}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
