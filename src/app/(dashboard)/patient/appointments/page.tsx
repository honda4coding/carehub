"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCheck, LuCircleAlert,
  LuClock, LuInfo, LuMapPin, LuChevronLeft, LuChevronRight,
} from "react-icons/lu";

import {
  DoctorListItem, Slot,
  bookAppointment, getApprovedDoctors, getAvailableSlots,
} from "@/services/appointmentService";
import { formatFullDate, initialsOf, slotTimeRangeLabel } from "@/components/appointments/format";

type Step = "slots" | "confirm" | "success";

// ─── Fake clinic locations (frontend-only until backend supports it) ────────────
const CLINIC_LOCATIONS: Record<string, { name: string; address: string }[]> = {
  default: [
    { name: "Main Clinic", address: "15 El-Nasr St, Nasr City, Cairo" },
    { name: "Branch Clinic", address: "7 Port Said Corniche, Damietta" },
  ],
};

function getClinicLocations(doctorId: string) {
  return CLINIC_LOCATIONS[doctorId] ?? CLINIC_LOCATIONS.default;
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({
  availableDates,
  selectedDate,
  onSelect,
}: {
  availableDates: Set<string>; // "YYYY-MM-DD"
  selectedDate: string | null;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] transition-colors">
          <LuChevronLeft className="text-[14px]" />
        </button>
        <p className="text-[12.5px] font-black text-[hsl(var(--color-text))]">{monthLabel}</p>
        <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] transition-colors">
          <LuChevronRight className="text-[14px]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-[hsl(var(--color-text-muted))] py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isAvailable = availableDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = new Date(dateStr) < new Date(today.toDateString());

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelect(dateStr)}
              disabled={!isAvailable || isPast}
              className={`relative h-8 w-full rounded-lg text-[11px] font-bold transition-all duration-150 ${
                isSelected
                  ? "bg-primary text-white shadow-[0_2px_8px_hsl(var(--color-primary)/0.4)]"
                  : isAvailable && !isPast
                    ? "bg-sky-50 text-sky-700 hover:bg-primary/20 hover:text-primary font-black"
                    : "text-[hsl(var(--color-text-muted))] opacity-40 cursor-not-allowed"
              }`}
            >
              {day}
              {/* Dot indicator for available days */}
              {isAvailable && !isPast && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[hsl(var(--color-border))]">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">
          <span className="w-2.5 h-2.5 rounded bg-sky-100 border border-sky-200" />
          Available
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">
          <span className="w-2.5 h-2.5 rounded bg-primary" />
          Selected
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BookAppointmentPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();

  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("slots");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number>(0);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [doctors, availableSlots] = await Promise.all([
          getApprovedDoctors(),
          getAvailableSlots(doctorId),
        ]);
        setDoctor(doctors.find((d) => d.userId._id === doctorId) ?? null);
        setSlots(availableSlots);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load available slots");
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // Build set of available date strings + group slots by date
  const { availableDates, slotsByDate } = useMemo(() => {
    const dates = new Set<string>();
    const byDate: Record<string, Slot[]> = {};
    slots.forEach((s) => {
      const d = new Date(s.startDateTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dates.add(key);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(s);
    });
    // Sort each day's slots by time
    Object.values(byDate).forEach((arr) =>
      arr.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    );
    return { availableDates: dates, slotsByDate: byDate };
  }, [slots]);

  const slotsForDay = selectedDate ? (slotsByDate[selectedDate] ?? []) : [];
  const clinicLocations = getClinicLocations(doctorId);

  const doctorName = doctor ? `Dr. ${doctor.userId.fullName}` : "Doctor";
  const doctorInitials = initialsOf(doctor?.userId.fullName ?? "");
  const doctorSpec = doctor?.specialization ?? "General Medicine";

  async function handleConfirm() {
    if (!selectedSlot) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await bookAppointment(selectedSlot._id);
      setStep("success");
    } catch (err: any) {
      setConfirmError(err.message || "This slot was just booked. Please choose another time.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center gap-3">
        <Link href="/patient/doctors"
          className="w-9 h-9 rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all shrink-0">
          <LuArrowLeft className="text-[14px]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-black text-[hsl(var(--color-text))]">
            {step === "slots" ? "Pick a time" : step === "confirm" ? "Confirm booking" : "Booking confirmed!"}
          </h1>
          <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{doctorName}</p>
        </div>

        {/* Step pills */}
        {step !== "success" && (
          <div className="flex items-center gap-1.5 shrink-0">
            {(["slots","confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border-2 transition-all ${
                  step === s ? "bg-primary border-primary text-white" :
                  (step === "confirm" && s === "slots") ? "bg-primary/15 border-primary text-primary" :
                  "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                }`}>{i + 1}</div>
                {i === 0 && <div className={`w-6 h-0.5 rounded ${step === "confirm" ? "bg-primary" : "bg-[hsl(var(--color-border))]"}`} />}
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-72 rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
            <div className="h-72 rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
          </div>
        ) : loadError ? (
          <div className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
            <LuCircleAlert className="text-[40px] text-[hsl(var(--color-danger))] mb-3" />
            <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">{loadError}</p>
          </div>

        ) : step === "slots" ? (
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Doctor card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-3.5 mb-5 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-white text-[15px] font-black shrink-0 shadow-md">
                {doctorInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{doctorSpec}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">Available on</p>
                <p className="text-[13px] font-black text-[hsl(var(--color-text))]">{availableDates.size} days</p>
              </div>
            </div>

            {availableDates.size === 0 ? (
              <div className="bg-[hsl(var(--color-bg-surface))] border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl py-16 text-center">
                <LuCircleAlert className="text-[32px] text-[hsl(var(--color-text-muted))] mx-auto mb-3" />
                <p className="text-[15px] font-black text-[hsl(var(--color-text))]">No open slots right now</p>
                <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* LEFT — Mini calendar */}
                <div>
                  <MiniCalendar
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                  />

                  {/* Clinic location picker */}
                  <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 mt-4 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-3 flex items-center gap-1.5">
                      <LuMapPin className="text-[13px] text-primary" />Clinic Location
                    </p>
                    <div className="space-y-2">
                      {clinicLocations.map((loc, i) => (
                        <button key={i} onClick={() => setSelectedLocation(i)}
                          className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-150 ${
                            selectedLocation === i
                              ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--color-primary)/0.3)]"
                              : "border-[hsl(var(--color-border))] hover:border-primary/40 hover:bg-[hsl(var(--color-bg-soft))]"
                          }`}>
                          <p className={`text-[12.5px] font-black ${selectedLocation === i ? "text-primary" : "text-[hsl(var(--color-text))]"}`}>
                            {loc.name}
                          </p>
                          <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">{loc.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Slots for selected day */}
                <div>
                  {!selectedDate ? (
                    <div className="bg-[hsl(var(--color-bg-surface))] border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl flex flex-col items-center justify-center py-14 text-center h-full">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <LuClock className="text-primary text-[22px]" />
                      </div>
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))]">Select a day</p>
                      <p className="text-[11.5px] font-medium text-[hsl(var(--color-text-muted))] mt-1">
                        Tap a highlighted date on the calendar
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <p className="text-[14px] font-black text-[hsl(var(--color-text))]">
                            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </p>
                          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                            {slotsForDay.length} slot{slotsForDay.length !== 1 ? "s" : ""} available
                          </p>
                        </div>
                        {selectedSlot && (
                          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                            {slotTimeRangeLabel(selectedSlot)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-0.5">
                        {slotsForDay.map((s) => {
                          const isSelected = selectedSlot?._id === s._id;
                          return (
                            <button key={s._id} onClick={() => setSelectedSlot(s)}
                              className={`py-3.5 px-2 rounded-xl border text-[12.5px] font-bold transition-all duration-200 ${
                                isSelected
                                  ? "bg-primary border-primary text-white shadow-[0_4px_14px_hsl(var(--color-primary)/0.4)] scale-[1.03]"
                                  : "bg-[hsl(var(--color-bg-soft))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-primary hover:text-primary hover:scale-[1.02]"
                              }`}>
                              {slotTimeRangeLabel(s)}
                            </button>
                          );
                        })}
                      </div>

                      {/* Continue */}
                      <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
                        <button
                          disabled={!selectedSlot}
                          onClick={() => setStep("confirm")}
                          className={`relative w-full py-3.5 rounded-xl text-[13.5px] font-black transition-all duration-300 overflow-hidden ${
                            selectedSlot
                              ? "bg-gradient-to-r from-primary to-sky-400 text-white shadow-[0_4px_15px_hsl(var(--color-primary)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--color-primary)/0.5)] hover:scale-[1.01]"
                              : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed"
                          }`}>
                          {selectedSlot && <span className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />}
                          <span className="relative">{selectedSlot ? "Continue to confirm →" : "Select a time slot"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        ) : step === "confirm" ? (
          <div className="p-4 md:p-6 max-w-md mx-auto">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-primary to-sky-400 px-6 py-7 text-center text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-2">Your Appointment</p>
                <p className="text-[24px] font-black">{selectedSlot ? formatFullDate(selectedSlot.startDateTime) : ""}</p>
                <div className="flex items-center justify-center gap-2 mt-2 bg-white/20 rounded-xl px-4 py-2 w-fit mx-auto">
                  <LuClock className="text-[14px]" />
                  <p className="text-[14px] font-bold">{selectedSlot ? slotTimeRangeLabel(selectedSlot) : ""}</p>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-[hsl(var(--color-border))] relative">
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-white text-[14px] font-black shrink-0">
                    {doctorInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                    <p className="text-[12px] font-semibold text-primary">{doctorSpec}</p>
                  </div>
                </div>

                {/* Selected location */}
                <div className="flex items-start gap-2.5 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl p-3">
                  <LuMapPin className="text-primary text-[14px] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] font-black text-[hsl(var(--color-text))]">{clinicLocations[selectedLocation].name}</p>
                    <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))]">{clinicLocations[selectedLocation].address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-xl p-3">
                  <LuInfo className="text-sky-400 text-[14px] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                    You can cancel anytime before the appointment from My Appointments.
                  </p>
                </div>

                {confirmError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-[12px] font-semibold">
                    <LuCircleAlert className="text-[14px] mt-0.5 shrink-0" />{confirmError}
                  </div>
                )}

                <button onClick={handleConfirm} disabled={confirming}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-sky-400 text-white text-[14px] font-black shadow-[0_4px_15px_hsl(var(--color-primary)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--color-primary)/0.5)] hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 transition-all">
                  {confirming ? "Booking…" : "Confirm Booking ✓"}
                </button>
                <button onClick={() => setStep("slots")}
                  className="w-full py-3 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                  ← Change slot
                </button>
              </div>
            </div>
          </div>

        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center mx-auto shadow-[0_8px_25px_hsl(var(--color-primary)/0.4)] animate-bounce">
                <LuCheck className="text-[36px] text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
            <h2 className="text-[26px] font-black text-[hsl(var(--color-text))] mb-2">All booked! 🎉</h2>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] mb-1">
              Your appointment with <strong className="text-[hsl(var(--color-text))]">{doctorName}</strong>
            </p>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] mb-2">
              on <strong className="text-primary">{selectedSlot ? `${formatFullDate(selectedSlot.startDateTime)} · ${slotTimeRangeLabel(selectedSlot)}` : ""}</strong>
            </p>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 mb-8">
              <LuMapPin className="text-primary text-[13px]" />
              {clinicLocations[selectedLocation].name} — {clinicLocations[selectedLocation].address}
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => router.push("/patient/appointments")}
                className="text-[13px] font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-sky-400 text-white shadow-[0_4px_15px_hsl(var(--color-primary)/0.4)] hover:scale-105 transition-all">
                View my appointments
              </button>
              <button onClick={() => router.push("/patient/doctors")}
                className="text-[13px] font-bold px-6 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                Book another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
