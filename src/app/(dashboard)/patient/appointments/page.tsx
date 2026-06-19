"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuCalendarDays, LuClock, LuStethoscope, LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function Toast({ message, type = "error", onClose }: { message: string; type?: "error" | "success"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700";
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 border text-[12px] font-bold px-4 py-3 rounded-xl shadow-lg ${bg}`}>
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

interface AppointmentData {
  _id: string;
  doctorId?: { fullName?: string; email?: string } | string;
  slotId?: { startDateTime?: string; endDateTime?: string } | string;
  startDateTime?: string;
  endDateTime?: string;
  appointmentDate?: string;
  reason?: string;
  status: string;
  createdAt: string;
}

function getDisplayStatus(appt: AppointmentData): "upcoming" | "completed" | "cancelled" {
  if (appt.status === "cancelled") return "cancelled";
  if (appt.status === "completed") return "completed";
  const endISO = appt.endDateTime ?? (typeof appt.slotId === "object" ? appt.slotId?.endDateTime : null);
  if (endISO && new Date(endISO).getTime() < Date.now()) return "completed";
  return "upcoming";
}

function getStartDateTime(appt: AppointmentData): Date {
  if (appt.startDateTime) return new Date(appt.startDateTime);
  if (typeof appt.slotId === "object" && appt.slotId?.startDateTime) return new Date(appt.slotId.startDateTime);
  if (appt.appointmentDate) return new Date(appt.appointmentDate);
  return new Date(appt.createdAt);
}

function getDoctorName(appt: AppointmentData): string {
  if (typeof appt.doctorId === "object") {
    return appt.doctorId?.fullName ?? "Doctor";
  }
  return "Doctor";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AppointmentsPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const showToast = useCallback((text: string, type: "error" | "success" = "error") => setToastMsg({ text, type }), []);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const { data } = await axios.get(`${BASE_URL}/appointmens/my-appointments`, {
          headers: authHeaders(),
        });
        setAppointments(data.data ?? data ?? []);
      } catch (err: any) {
        showToast(err?.response?.data?.message ?? "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [showToast]);

  async function handleCancel(appointmentId: string) {
    setCancellingId(appointmentId);
    try {
      await axios.patch(
        `${BASE_URL}/appointmens/cancel/${appointmentId}`,
        {},
        { headers: authHeaders() }
      );
      setAppointments(prev =>
        prev.map(a => a._id === appointmentId ? { ...a, status: "cancelled" } : a)
      );
      showToast("Appointment cancelled successfully", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const hasAppointment = (day: number) =>
    appointments.some(a => {
      const d = getStartDateTime(a);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const selectedAppts = selectedDate
    ? appointments.filter(a => {
        const d = getStartDateTime(a);
        return d.toDateString() === selectedDate.toDateString();
      })
    : [];

  const filtered = appointments.filter(a => {
    const status = getDisplayStatus(a);
    return activeTab === "upcoming" ? status === "upcoming" : (status === "completed" || status === "cancelled");
  }).sort((a, b) => getStartDateTime(b).getTime() - getStartDateTime(a).getTime());

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <Toast message={toastMsg.text} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Appointments
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Manage your upcoming and past appointments
        </p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
            <div className="xl:col-span-2 h-80 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
            <div className="h-60 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
          </div>
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="xl:col-span-2">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] transition-all">
                  <LuChevronLeft className="text-sm" />
                </button>
                <h2 className="text-[14px] font-black text-[hsl(var(--color-text))]">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] transition-all">
                  <LuChevronRight className="text-sm" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;
                  const hasAppt = hasAppointment(day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                      className={`relative aspect-square rounded-xl text-[12px] font-bold flex items-center justify-center transition-all
                        ${isSelected ? "bg-[hsl(var(--color-primary))] text-white" :
                          isToday ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.3)]" :
                          "hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]"}`}
                    >
                      {day}
                      {hasAppt && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[hsl(var(--color-primary))]"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected day appointments */}
              {selectedDate && (
                <div className="mt-5 pt-4 border-t border-[hsl(var(--color-border-soft))]">
                  <p className="text-[11px] font-black text-[hsl(var(--color-text-muted))] uppercase mb-3">
                    {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {selectedAppts.length === 0 ? (
                    <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-bold">No appointments on this day.</p>
                  ) : selectedAppts.map(a => {
                    const startDt = getStartDateTime(a);
                    const displayStatus = getDisplayStatus(a);
                    return (
                    <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center text-sm">
                        <LuStethoscope />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-[hsl(var(--color-text))]">{getDoctorName(a)}</p>
                        <p className="text-[10px] text-[hsl(var(--color-text-muted))]">{formatTime(startDt)}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        displayStatus === "upcoming" ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" :
                        displayStatus === "cancelled" ? "bg-red-50 text-red-500" :
                        "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Appointments list */}
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["upcoming", "past"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all
                    ${activeTab === tab ? "bg-[hsl(var(--color-primary))] text-white" : "bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 text-center shadow-sm">
                  <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-bold">No {activeTab} appointments.</p>
                </div>
              ) : filtered.map(a => {
                const startDt = getStartDateTime(a);
                const displayStatus = getDisplayStatus(a);
                return (
                <div key={a._id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))]">{getDoctorName(a)}</p>
                      {a.reason && (
                        <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase">{a.reason}</p>
                      )}
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      displayStatus === "upcoming" ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" :
                      displayStatus === "cancelled" ? "bg-red-50 text-red-500" :
                      "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--color-text-muted))] font-bold">
                    <span className="flex items-center gap-1"><LuCalendarDays className="text-xs" />{startDt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><LuClock className="text-xs" />{formatTime(startDt)}</span>
                  </div>
                  {displayStatus === "upcoming" && (
                    <button
                      onClick={() => handleCancel(a._id)}
                      disabled={cancellingId === a._id}
                      className="mt-3 w-full py-2 rounded-xl border border-red-200 text-red-500 text-[11px] font-black flex items-center justify-center gap-1.5 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <LuX className="text-xs" />
                      {cancellingId === a._id ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
