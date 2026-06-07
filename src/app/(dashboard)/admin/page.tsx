"use client";

import { useEffect, useState } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuUsers, LuStethoscope, LuCalendarDays, LuClock,
  LuBell, LuSearch,
  LuCheck, LuX, LuEye, LuTriangleAlert, LuUserPlus, LuUserX,
} from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface DoctorRequest {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: ApprovalStatus;
  address?: string;
  createdAt: string;
  specialty?: string;
  licenseUrl?: string;
}



const CHART_MONTHS = [
  { month: "Jan", pct: 55 }, { month: "Feb", pct: 68 },
  { month: "Mar", pct: 58 }, { month: "Apr", pct: 83 },
  { month: "May", pct: 92 },
];

const ACTIVITY = [
  { icon: <LuUserPlus />,      style: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",     text: "New doctor registration — Dr. Mohaned Ahmed",  time: "2 min ago · Cardiology" },
  { icon: <LuTriangleAlert />, style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",      text: "Patient complaint submitted — case #1042",      time: "18 min ago" },
  { icon: <LuCheck />,         style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",      text: "Dr. Khaled taha request approved",               time: "1 hour ago · Dermatology" },
  { icon: <LuUserX />,         style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",        text: "Doctor account deactivated — Dr. Mona S.",      time: "Yesterday · Pediatrics" },
];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const statusConfig: Record<ApprovalStatus, { style: string; label: string; icon: React.ReactNode }> = {
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

export default function AdminDashboard() {
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const { token } = useAuth();
  const router = useRouter();


  const pendingCount = requests.length;

    const STATS = [
  { label: "Total Patients",   value: "2,847", trend: "+12% this month", up: true,  icon: <LuUsers />,        iconStyle: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]" },
  { label: "Active Doctors",   value: "134",   trend: "+4 this month",   up: true,  icon: <LuStethoscope />,  iconStyle: "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]" },
  { label: "Appointments",     value: "491",   trend: "+8% this week",   up: true,  icon: <LuCalendarDays />, iconStyle: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" },
  { label: "Pending Requests", value: `${pendingCount}`, trend: "Needs review",    up: false, icon: <LuClock />,        iconStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]" },
];

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/doctors/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setRequests(json.data || []);
      } catch (err) {
        console.error("Failed to fetch pending doctors", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPending();
  }, [token]);



  const filtered = requests.filter(
    (r) =>
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
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">Tuesday, 12 May 2026</p>
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
                  <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full hidden sm:inline-flex ${s.up ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"}`}>
                    {s.up ? "↑" : "⚠"} {s.trend}
                  </span>
                </div>
                <p className="text-[20px] md:text-[24px] font-black text-[hsl(var(--color-text))] tracking-tight leading-none">{s.value}</p>
                <p className="text-[11px] md:text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">{s.label}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-flex sm:hidden ${s.up ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"}`}>
                  {s.up ? "↑" : "⚠"} {s.trend}
                </span>
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
                  { val: "341", lbl: "New Patients", dotClass: "bg-primary" },
                  { val: "8",   lbl: "New Doctors",  dotClass: "bg-secondary" },
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
                {ACTIVITY.map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 py-2.5 ${i < ACTIVITY.length - 1 ? "border-b border-[hsl(var(--color-border-soft))]" : ""}`}>
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] shrink-0 ${a.style}`}>
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[hsl(var(--color-text))] leading-snug">{a.text}</p>
                      <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                <span onClick={() => router.push("/admin/approvals")} className="text-[12px] font-bold text-primary cursor-pointer whitespace-nowrap">View all ›</span>
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
