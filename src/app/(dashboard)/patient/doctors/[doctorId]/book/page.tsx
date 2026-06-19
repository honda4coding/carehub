"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCheck, LuCircleAlert, LuClock, LuCalendarDays, LuInfo,
  LuChevronLeft, LuChevronRight, LuPhone, LuPhoneCall, LuMapPin, LuBuilding2,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";

import {
  DoctorListItem, Slot,
  bookAppointment, getApprovedDoctors, getAvailableSlots, getMyAppointments,
} from "@/services/appointmentService";
import {
  formatFullDate, groupSlotsByDate, initialsOf, slotTimeRangeLabel,
} from "@/components/appointments/format";
import EmptyState from "@/components/appointments/EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "clinic" | "calendar" | "confirm" | "success";
type BookingMode = "online" | "contact" | null;
type DoctorContact = { phone?: string; whatsapp?: string; landline?: string };

// Static clinic data — replace with a real API call when the backend is ready.
// Each clinic can eventually carry its own slotFilter (e.g. by clinicId) so the
// calendar only shows slots for the chosen location.
type Clinic = {
  id: string;
  name: string;
  address: string;
  days: string;
  hours: string;
};

const STATIC_CLINICS: Clinic[] = [
  {
    id: "clinic-main",
    name: "Main Clinic",
    address: "Cairo Medical Center, Tahrir Square",
    days: "Sun – Thu",
    hours: "9:00 AM – 3:00 PM",
  },
  {
    id: "clinic-branch",
    name: "Branch Clinic",
    address: "Damietta Health Center, Corniche St.",
    days: "Mon, Wed, Fri",
    hours: "4:00 PM – 9:00 PM",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildMonthCells(monthStart: Date) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  return cells;
}

// Returns "9:00 AM – 5:30 PM" using the earliest start and latest end of the day.
function dayHoursLabel(slotsForDay: Slot[]): string {
  if (slotsForDay.length === 0) return "—";
  const sorted = [...slotsForDay].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return `${fmt(first.startDateTime)} – ${fmt(last.endDateTime)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();

  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dates the patient already has a non-cancelled appointment on
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  const [step, setStep] = useState<Step>("clinic");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [viewMonth, setViewMonth] = useState<Date | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<BookingMode>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [doctors, availableSlots, myAppts] = await Promise.all([
          getApprovedDoctors(),
          getAvailableSlots(doctorId),
          getMyAppointments(),
        ]);
        setDoctor(doctors.find((d) => d.userId._id === doctorId) ?? null);
        setSlots(availableSlots);

        // Build set of date keys the patient is already booked on
        const booked = new Set(
          (myAppts as any[])
            .filter((a) => a.status !== "cancelled")
            .map((a) => localDateKey(new Date(a.startDateTime)))
        );
        setBookedDates(booked);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load available slots");
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const dateGroups = useMemo(() => groupSlotsByDate(slots), [slots]);

  const groupsByLocalKey = useMemo(() => {
    const map = new Map<string, (typeof dateGroups)[number]>();
    dateGroups.forEach((g) => map.set(localDateKey(g.dateObj), g));
    return map;
  }, [dateGroups]);

  useEffect(() => {
    if (!viewMonth && dateGroups.length > 0) {
      const first = dateGroups[0].dateObj;
      setViewMonth(new Date(first.getFullYear(), first.getMonth(), 1));
    }
  }, [dateGroups, viewMonth]);

  const monthCells = useMemo(() => (viewMonth ? buildMonthCells(viewMonth) : []), [viewMonth]);
  const selectedGroup = selectedDateKey ? groupsByLocalKey.get(selectedDateKey) ?? null : null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  function goToMonth(offset: number) {
    setViewMonth((prev) => (prev ? new Date(prev.getFullYear(), prev.getMonth() + offset, 1) : prev));
    setSelectedDateKey(null);
    setBookingMode(null);
    setSelectedSlot(null);
  }

  function handlePickDay(date: Date) {
    const key = localDateKey(date);
    if (!groupsByLocalKey.has(key)) return;
    if (bookedDates.has(key)) return; // already booked on this day
    setSelectedDateKey(key);
    setBookingMode(null);
    setSelectedSlot(null);
  }

  function handleBookOnline() {
    if (!selectedGroup || selectedGroup.slots.length === 0) return;
    const earliest = [...selectedGroup.slots].sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    )[0];
    setSelectedSlot(earliest);
    setStep("confirm");
  }

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

  // ── Doctor info ────────────────────────────────────────────────────────────

  const doctorName = doctor ? `Dr. ${doctor.userId.fullName}` : "Doctor";
  const doctorInitials = initialsOf(doctor?.userId.fullName ?? "");
  const doctorSpec = doctor?.specialization ?? "General Medicine";
  const contact: DoctorContact =
    (doctor as (DoctorListItem & { contact?: DoctorContact }) | null)?.contact ?? {};
  const hasContact = Boolean(contact.phone || contact.whatsapp || contact.landline);

  // ── Step count (clinic + calendar + confirm) ───────────────────────────────

  const ALL_STEPS: Step[] = ["clinic", "calendar", "confirm"];
  const stepIndex = ALL_STEPS.indexOf(step);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">

      {/* ── Header ── */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center gap-3">
        <Link
          href="/patient/doctors"
          className="w-9 h-9 rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-all shrink-0"
        >
          <LuArrowLeft className="text-[14px]" />
        </Link>
        <div>
          <h1 className="text-[17px] font-black text-[hsl(var(--color-text))]">
            {step === "clinic" ? "Choose a clinic"
              : step === "calendar" ? "Pick a day"
              : step === "confirm" ? "Confirm booking"
              : "Booking confirmed!"}
          </h1>
          <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
            {step === "success" ? "You're all set" : doctorName}
          </p>
        </div>

        {/* Step indicators */}
        {step !== "success" && (
          <div className="ml-auto flex items-center gap-2">
            {ALL_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                  i < stepIndex
                    ? "bg-sky-700 border-sky-800 text-white"
                    : step === s
                    ? "bg-sky-200 border-sky-500 text-sky-800"
                    : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                }`}>{i + 1}</div>
                {i < ALL_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 rounded ${i < stepIndex ? "bg-sky-700" : "bg-[hsl(var(--color-border))]"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">

        {loading ? (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="h-[280px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
          </div>

        ) : loadError ? (
          <div className="p-6">
            <EmptyState icon={<LuCircleAlert />} title="Something went wrong" description={loadError} />
          </div>

        ) : step === "clinic" ? (
          /* ── Step 1: clinic selector ── */
          <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mb-5">
              {doctorName} operates from multiple clinics. Choose one to see its availability.
            </p>
            <div className="space-y-3">
              {STATIC_CLINICS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClinic(c); setStep("calendar"); }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:border-sky-500 hover:bg-sky-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <LuBuilding2 className="text-white text-[17px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-[hsl(var(--color-text))] group-hover:text-sky-700 transition-colors">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))]">
                        <LuMapPin className="text-[12px] shrink-0" /> {c.address}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11.5px] font-bold text-sky-700">
                        <span>{c.days}</span>
                        <span className="opacity-40">·</span>
                        <span>{c.hours}</span>
                      </div>
                    </div>
                    <LuChevronRight className="text-[hsl(var(--color-text-muted))] group-hover:text-sky-600 transition-colors mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        ) : step === "calendar" ? (
          /* ── Step 2: calendar ── */
          <div className="flex flex-col h-full">
            {/* Doctor + clinic mini bar */}
            <div className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center text-white text-[13px] font-black shrink-0">
                {doctorInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                <p className="text-[11px] font-bold text-sky-600 truncate">
                  {selectedClinic?.name} · {selectedClinic?.address}
                </p>
              </div>
              <button
                onClick={() => setStep("clinic")}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition-colors shrink-0"
              >
                Change
              </button>
            </div>

            {dateGroups.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<LuCircleAlert />} title="No open slots" description="This doctor hasn't published any availability yet." />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 w-full justify-center items-start">

                {/* Calendar */}
                <div className="w-full md:w-[40vw] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => goToMonth(-1)}
                      aria-label="Previous month"
                      className="w-8 h-8 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-sky-700 hover:border-sky-500 transition-all"
                    >
                      <LuChevronLeft className="text-[14px]" />
                    </button>
                    <p className="text-[14px] font-black text-[hsl(var(--color-text))]">
                      {viewMonth ? `${MONTHS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}` : ""}
                    </p>
                    <button
                      onClick={() => goToMonth(1)}
                      aria-label="Next month"
                      className="w-8 h-8 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-sky-700 hover:border-sky-500 transition-all"
                    >
                      <LuChevronRight className="text-[14px]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((w) => (
                      <div key={w} className="text-center text-[10px] font-bold text-[hsl(var(--color-text-muted))]">{w}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-3">
                    {monthCells.map((date, idx) => {
                      if (!date) return <div key={idx} />;
                      const key = localDateKey(date);
                      const isAvailable = groupsByLocalKey.has(key);
                      const isSelected = key === selectedDateKey;
                      const isAlreadyBooked = bookedDates.has(key);

                      return (
                        <div key={idx} className="flex items-center justify-center">
                          <button
                            disabled={!isAvailable || isAlreadyBooked}
                            onClick={() => handlePickDay(date)}
                            title={isAlreadyBooked ? "You already have an appointment this day" : undefined}
                            className={`w-11 h-11 rounded-full text-[13.5px] font-bold transition-all flex items-center justify-center border-2 ${
                              isSelected
                                ? "bg-sky-700 border-sky-800 text-white"
                                : isAlreadyBooked
                                ? "border-amber-400 bg-amber-50 text-amber-600 cursor-not-allowed"
                                : isAvailable
                                ? "border-sky-500 text-sky-700 bg-[hsl(var(--color-bg-surface))] hover:bg-sky-50"
                                : "border-transparent text-[hsl(var(--color-text-muted))] cursor-default"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[hsl(var(--color-border))]">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                      <span className="w-4 h-4 rounded-full border-2 border-sky-500 inline-block" />
                      Available day
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                      <span className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-50 inline-block" />
                      Already booked
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="w-full md:w-[40vw] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 md:sticky md:top-6">
                  {!selectedGroup ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <LuCalendarDays className="text-[26px] text-[hsl(var(--color-text-muted))] mb-3" />
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))]">Select a day</p>
                      <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mt-1 max-w-[220px]">
                        Pick a highlighted day on the calendar to see availability and booking options.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))] mb-4">
                        {formatFullDate(selectedGroup.dateObj)}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[hsl(var(--color-text-muted))] mb-1">
                            <LuClock className="text-[12px]" /> Hours
                          </div>
                          <p className="text-[12px] font-black text-[hsl(var(--color-text))]">
                            {dayHoursLabel(selectedGroup.slots)}
                          </p>
                        </div>
                        <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[hsl(var(--color-text-muted))] mb-1">
                            <LuCalendarDays className="text-[12px]" /> Available
                          </div>
                          <p className="text-[13px] font-black text-[hsl(var(--color-text))]">
                            {selectedGroup.slots.length} slots
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[hsl(var(--color-border))] pt-4">
                        {!bookingMode && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              onClick={handleBookOnline}
                              className="py-3 rounded-xl border border-sky-500 bg-sky-50 text-sky-700 text-[12.5px] font-bold hover:bg-sky-100 hover:border-sky-600 transition-all"
                            >
                              Book online
                            </button>
                            <button
                              onClick={() => setBookingMode("contact")}
                              className="py-3 rounded-xl border border-sky-400 bg-sky-50 text-sky-700 text-[12.5px] font-bold hover:bg-sky-100 hover:border-sky-500 transition-all"
                            >
                              Contact to confirm
                            </button>
                          </div>
                        )}

                        {bookingMode === "contact" && (
                          <div>
                            {hasContact ? (
                              <div className="flex flex-col gap-2 mb-4">
                                {contact.phone && (
                                  <a href={`tel:${contact.phone}`}
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <LuPhone className="text-[15px]" /> Call: {contact.phone}
                                  </a>
                                )}
                                {contact.whatsapp && (
                                  <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <FaWhatsapp className="text-[15px]" /> WhatsApp: {contact.whatsapp}
                                  </a>
                                )}
                                {contact.landline && (
                                  <a href={`tel:${contact.landline}`}
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <LuPhoneCall className="text-[15px]" /> Landline: {contact.landline}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-300 rounded-xl p-3 mb-4">
                                <LuInfo className="text-sky-600 text-[14px] mt-0.5 shrink-0" />
                                <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                                  Contact details aren't available for this doctor yet.
                                </p>
                              </div>
                            )}
                            <button
                              onClick={() => setBookingMode(null)}
                              className="w-full py-3 rounded-xl border border-[hsl(var(--color-border))] text-[12.5px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all"
                            >
                              ← Back
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        ) : step === "confirm" ? (
          /* ── Step 3: confirm ── */
          <div className="p-4 md:p-6 max-w-md mx-auto">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-lg">
              {/* Ticket header */}
              <div className="bg-gradient-to-r from-sky-800 to-sky-600 px-6 py-7 text-center text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-2">Your Appointment</p>
                <p className="text-[26px] font-black">{selectedSlot ? formatFullDate(selectedSlot.startDateTime) : ""}</p>
                <div className="flex items-center justify-center gap-2 mt-2 bg-white/20 rounded-xl px-4 py-2 w-fit mx-auto">
                  <LuClock className="text-[14px]" />
                  <p className="text-[14px] font-bold">{selectedSlot ? slotTimeRangeLabel(selectedSlot) : ""}</p>
                </div>
              </div>

              {/* Ticket tear */}
              <div className="border-t-2 border-dashed border-[hsl(var(--color-border))] relative">
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center text-white text-[14px] font-black shrink-0">
                    {doctorInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                    <p className="text-[12px] font-semibold text-sky-600">{doctorSpec}</p>
                  </div>
                </div>

                {selectedClinic && (
                  <div className="flex items-center gap-2.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                    <LuMapPin className="text-sky-600 text-[14px] shrink-0" />
                    {selectedClinic.name} — {selectedClinic.address}
                  </div>
                )}

                <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-300 rounded-xl p-3">
                  <LuInfo className="text-sky-600 text-[14px] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                    You can cancel this appointment anytime before the scheduled time from My Appointments.
                  </p>
                </div>

                {confirmError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-[12px] font-semibold">
                    <LuCircleAlert className="text-[14px] mt-0.5 shrink-0" />{confirmError}
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-800 to-sky-600 text-white text-[14px] font-black shadow-[0_4px_15px_rgba(2,132,199,0.4)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.5)] hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 transition-all"
                >
                  {confirming ? "Booking…" : "Confirm Booking ✓"}
                </button>
                <button
                  onClick={() => setStep("calendar")}
                  className="w-full py-3 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                >
                  ← Change day
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── Step 4: success ── */
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center mx-auto shadow-[0_8px_25px_rgba(2,132,199,0.4)] animate-bounce">
                <LuCheck className="text-[36px] text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-sky-600/20 animate-ping" />
            </div>
            <h2 className="text-[26px] font-black text-[hsl(var(--color-text))] mb-2">All booked! 🎉</h2>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] mb-1">
              Your appointment with <strong className="text-[hsl(var(--color-text))]">{doctorName}</strong>
            </p>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] mb-8">
              is confirmed for{" "}
              <strong className="text-sky-700">
                {selectedSlot ? `${formatFullDate(selectedSlot.startDateTime)} · ${slotTimeRangeLabel(selectedSlot)}` : ""}
              </strong>
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => router.push("/patient/appointments")}
                className="text-[13px] font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-sky-800 to-sky-600 text-white shadow-[0_4px_15px_rgba(2,132,199,0.4)] hover:scale-105 transition-all"
              >
                View my appointments
              </button>
              <button
                onClick={() => router.push("/patient/doctors")}
                className="text-[13px] font-bold px-6 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
              >
                Book another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}