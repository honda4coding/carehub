"use client";

import { useState } from "react";
import { LuCalendarDays, LuClock, LuStethoscope, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const MOCK_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Sarah Ahmed", specialty: "Cardiology", date: new Date(2026, 5, 18), time: "10:00 AM", status: "upcoming" },
  { id: 2, doctor: "Dr. Mohamed Ali", specialty: "General Practice", date: new Date(2026, 5, 22), time: "02:30 PM", status: "upcoming" },
  { id: 3, doctor: "Dr. Nour Hassan", specialty: "Dermatology", date: new Date(2026, 4, 10), time: "11:00 AM", status: "completed" },
  { id: 4, doctor: "Dr. Ahmed Karim", specialty: "Orthopedics", date: new Date(2026, 4, 2), time: "09:00 AM", status: "completed" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AppointmentsPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

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
    MOCK_APPOINTMENTS.some(a =>
      a.date.getDate() === day &&
      a.date.getMonth() === currentMonth &&
      a.date.getFullYear() === currentYear
    );

  const selectedAppts = selectedDate
    ? MOCK_APPOINTMENTS.filter(a =>
        a.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  const filtered = MOCK_APPOINTMENTS.filter(a =>
    activeTab === "upcoming" ? a.status === "upcoming" : a.status === "completed"
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="xl:col-span-2">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
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
                  ) : selectedAppts.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center text-sm">
                        <LuStethoscope />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-[hsl(var(--color-text))]">{a.doctor}</p>
                        <p className="text-[10px] text-[hsl(var(--color-text-muted))]">{a.specialty} · {a.time}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${a.status === "upcoming" ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
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
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 text-center">
                  <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-bold">No {activeTab} appointments.</p>
                </div>
              ) : filtered.map(a => (
                <div key={a.id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))]">{a.doctor}</p>
                      <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase">{a.specialty}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${a.status === "upcoming" ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--color-text-muted))] font-bold">
                    <span className="flex items-center gap-1"><LuCalendarDays className="text-xs" />{a.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><LuClock className="text-xs" />{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
