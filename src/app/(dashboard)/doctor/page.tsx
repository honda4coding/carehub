"use client";

import { useState } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuUsers,
  LuCalendarDays,
  LuClock3,
  LuBell,
  LuSearch,
  LuCheck,
  LuEye,
  LuFileText,
  LuActivity,
  LuHeartPulse,
  LuClipboardList,
} from "react-icons/lu";

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: number;
  patient: string;
  age: number;
  issue: string;
  time: string;
  status: AppointmentStatus;
  initials: string;
  avatarStyle: string;
}

const STATS = [
  {
    label: "Today's Patients",
    value: "24",
    trend: "+4 from yesterday",
    up: true,
    icon: <LuUsers />,
    iconStyle:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  },
  {
    label: "Appointments",
    value: "18",
    trend: "6 remaining",
    up: true,
    icon: <LuCalendarDays />,
    iconStyle:
      "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  },
  {
    label: "Emergency Cases",
    value: "3",
    trend: "Requires attention",
    up: false,
    icon: <LuHeartPulse />,
    iconStyle:
      "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
  },
  {
    label: "Reports Pending",
    value: "11",
    trend: "To be reviewed",
    up: false,
    icon: <LuClipboardList />,
    iconStyle:
      "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  },
];

const CHART_DATA = [
  { day: "Mon", pct: 45 },
  { day: "Tue", pct: 70 },
  { day: "Wed", pct: 58 },
  { day: "Thu", pct: 82 },
  { day: "Fri", pct: 90 },
];

const ACTIVITY = [
  {
    icon: <LuCheck />,
    style:
      "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    text: "Prescription submitted for Ahmed Hassan",
    time: "5 min ago",
  },
  {
    icon: <LuActivity />,
    style:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    text: "New lab results uploaded",
    time: "20 min ago",
  },
  {
    icon: <LuFileText />,
    style:
      "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    text: "Medical report awaiting review",
    time: "1 hour ago",
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patient: "Ahmed Ali",
    age: 32,
    issue: "Chest Pain",
    time: "09:30 AM",
    status: "upcoming",
    initials: "AA",
    avatarStyle:
      "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  },
  {
    id: 2,
    patient: "Sara Mohamed",
    age: 27,
    issue: "Headache",
    time: "10:00 AM",
    status: "completed",
    initials: "SM",
    avatarStyle:
      "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  },
  {
    id: 3,
    patient: "Mona Tarek",
    age: 41,
    issue: "Diabetes Follow-up",
    time: "11:15 AM",
    status: "upcoming",
    initials: "MT",
    avatarStyle:
      "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  },
  {
    id: 4,
    patient: "Khaled Samy",
    age: 36,
    issue: "Fever",
    time: "01:45 PM",
    status: "cancelled",
    initials: "KS",
    avatarStyle:
      "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
  },
];

const statusConfig: Record<
  AppointmentStatus,
  { style: string; label: string }
> = {
  upcoming: {
    style:
      "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Upcoming",
  },
  completed: {
    style:
      "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    label: "Completed",
  },
  cancelled: {
    style:
      "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
    label: "Cancelled",
  },
};

export default function DoctorDashboard() {
  const [appointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);

  const [filter, setFilter] = useState("");

  const filtered = appointments.filter(
    (a) =>
      a.patient.toLowerCase().includes(filter.toLowerCase()) ||
      a.issue.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
            Doctor Dashboard
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
            Friday, 22 May 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:flex">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[hsl(var(--color-text-muted))]" />

            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none"
            />
          </div>

          <button className="w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center relative">
            <LuBell className="text-[15px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          <button className="hidden sm:flex w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] items-center justify-center">
            <IoIosHelpCircleOutline className="text-[15px]" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.iconStyle}`}
                >
                  {s.icon}
                </div>
              </div>

              <p className="text-[24px] font-black text-[hsl(var(--color-text))]">
                {s.value}
              </p>

              <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">
                {s.label}
              </p>

              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full mt-2 inline-flex ${
                  s.up
                    ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
                    : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                }`}
              >
                {s.trend}
              </span>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* Chart */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black uppercase">
                Weekly Patients
              </p>

              <span className="text-[12px] font-bold text-primary">
                This Week
              </span>
            </div>

            <div className="flex items-end gap-2 h-24">
              {CHART_DATA.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-md bg-gradient-doctor"
                    style={{ height: `${d.pct}%` }}
                  />

                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))]">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black uppercase">
                Recent Activity
              </p>

              <span className="text-[12px] font-bold text-primary">
                View all
              </span>
            </div>

            <div className="flex flex-col">
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-3 ${
                    i !== ACTIVITY.length - 1
                      ? "border-b border-[hsl(var(--color-border-soft))]"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${a.style}`}
                  >
                    {a.icon}
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold">
                      {a.text}
                    </p>

                    <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1">
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-[13px] font-black uppercase">
              Today's Appointments
            </p>

            <div className="relative">
              <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px]" />

              <input
                type="text"
                placeholder="Filter..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-[11px] rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  {[
                    "Patient",
                    "Issue",
                    "Time",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className="pb-3 text-[10px] font-black uppercase tracking-[.08em] text-left"
                      style={{
                        textAlign: i === 4 ? "right" : "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => {
                  const sc = statusConfig[a.status];

                  return (
                    <tr
                      key={a.id}
                      className="border-b border-[hsl(var(--color-border-soft))]"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${a.avatarStyle}`}
                          >
                            {a.initials}
                          </div>

                          <div>
                            <p className="text-[12px] font-bold">
                              {a.patient}
                            </p>

                            <p className="text-[10px] text-[hsl(var(--color-text-muted))]">
                              {a.age} years old
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-[12px] font-medium">
                        {a.issue}
                      </td>

                      <td className="py-3 text-[12px] font-medium">
                        {a.time}
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${sc.style}`}
                        >
                          {sc.label}
                        </span>
                      </td>

                      <td className="py-3">
                        <div className="flex justify-end">
                          <button className="text-[10px] font-bold px-3 py-1 rounded-lg border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-1">
                            <LuEye className="text-[11px]" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}