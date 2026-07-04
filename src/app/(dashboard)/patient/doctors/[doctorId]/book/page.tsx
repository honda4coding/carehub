"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCheck, LuCircleAlert, LuClock, LuCalendarDays, LuInfo,
  LuChevronLeft, LuChevronRight, LuPhone, LuPhoneCall, LuMapPin, LuBuilding2, LuStar,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";

import {
  DoctorListItem, Slot,
  bookAppointment, getApprovedDoctors, getAvailableSlots, getMyAppointments, releaseReservation, holdSlot
} from "@/services/appointmentService";
import { walletService, Wallet } from "@/services/walletService";
import { createCheckout, payWithWallet } from "@/services/paymentService";
import { getDoctorClinics, Clinic } from "@/services/clinicService";
import {
  formatFullDate, groupSlotsByDate, initialsOf, slotTimeRangeLabel,
} from "@/components/appointments/format";
import EmptyState from "@/components/appointments/EmptyState";
import DashboardHeader from "@/components/global/DashboardHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "clinic" | "calendar" | "confirm" | "success";
type BookingMode = "online" | "contact" | null;
type DoctorContact = { phone?: string; whatsapp?: string; landline?: string };

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

function byStartTime(a: Slot, b: Slot) {
  return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  const [step, setStep] = useState<Step>("clinic");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [viewMonth, setViewMonth] = useState<Date | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<BookingMode>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [isEligibleForFollowUpDiscount, setIsEligibleForFollowUpDiscount] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [doctors, doctorClinics, myAppts, myWallet] = await Promise.all([
          getApprovedDoctors(),
          getDoctorClinics(doctorId),
          getMyAppointments(),
          walletService.getMyWallet().catch(() => null), // If no wallet, ignore
        ]);
        setDoctor(doctors.find((d) => d.userId._id === doctorId) ?? null);
        setClinics(doctorClinics);
        setWallet(myWallet);

        const urlClinicId = searchParams.get("clinicId");
        if (urlClinicId) {
          const matchedClinic = doctorClinics.find((c: any) => c._id === urlClinicId);
          if (matchedClinic) {
            setSelectedClinic(matchedClinic);
            setStep("calendar");
            fetchCalendar(matchedClinic._id);
          }
        }

        // Only block days where the patient already has a non-cancelled
        // appointment with THIS SAME doctor — other doctors are unaffected.
        const booked = new Set(
          (myAppts.data || [])
            .filter((a) => {
              const apptDoctorId = typeof a.doctorId === "string" ? a.doctorId : a.doctorId?._id;
              return apptDoctorId === doctorId && a.status === "booked";
            })
            .map((a) => localDateKey(new Date(a.startDateTime)))
        );
        setBookedDates(booked);

        const hasFollowUp = (myAppts.data || []).some(a => {
          const apptDoctorId = typeof a.doctorId === "string" ? a.doctorId : a.doctorId?._id;
          return apptDoctorId === doctorId && 
                 a.status === "completed" && 
                 (
                   a.followUpStatus === "overridden" ||
                   (a.followUpStatus === "scheduled" && a.followUpDeadline && new Date(a.followUpDeadline) >= new Date())
                 );
        });
        setIsEligibleForFollowUpDiscount(hasFollowUp);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load doctor information");
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // Abort reservation on page unload
  useEffect(() => {
    const unloadHandler = async (e: BeforeUnloadEvent) => {
      if (selectedSlot) {
        await releaseReservation(selectedSlot._id);
      }
    };
    window.addEventListener('beforeunload', unloadHandler);
    return () => window.removeEventListener('beforeunload', unloadHandler);
  }, [selectedSlot]);

  // When a clinic is selected, load its slots
  useEffect(() => {
    if (!selectedClinic) return;
    (async () => {
      try {
        const data = await getAvailableSlots(doctorId, selectedClinic._id);
        setSlots(data);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load slots for this clinic");
      }
    })();
  }, [selectedClinic, doctorId]);

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

  const sortedDaySlots = useMemo(
    () => (selectedGroup ? [...selectedGroup.slots].sort(byStartTime) : []),
    [selectedGroup]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSelectClinic(clinic: Clinic) {
    setSelectedClinic(clinic);
    setSlots([]);
    setViewMonth(null);
    setSelectedDateKey(null);
    setBookingMode(null);
    setSelectedSlot(null);
    setStep("calendar");
  }

  function goToMonth(offset: number) {
    setViewMonth((prev) => (prev ? new Date(prev.getFullYear(), prev.getMonth() + offset, 1) : prev));
    setSelectedDateKey(null);
    setBookingMode(null);
    setSelectedSlot(null);
  }

  function handlePickDay(date: Date) {
    const key = localDateKey(date);
    if (!groupsByLocalKey.has(key)) return;
    if (bookedDates.has(key)) return;
    setSelectedDateKey(key);
    setBookingMode(null);
    setSelectedSlot(null);
  }

  function handleBookOnline() {
    if (!selectedGroup || selectedGroup.slots.length === 0) return;
    const nextInLine = [...selectedGroup.slots].sort(byStartTime)[0];
    setSelectedSlot(nextInLine);
    setBookingMode("online");
  }

  async function handleConfirmCard() {
    if (!selectedSlot || !doctor) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await createCheckout({
        amount: isEligibleForFollowUpDiscount ? (doctor.followUpFee ?? (doctor.consultationFee ?? 0) * 0.5) : (doctor.consultationFee ?? 0),
        purpose: "appointment",
        referenceId: selectedSlot._id,
        paymentMethod: "card"
      });
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not get payment URL");
      }
    } catch (err: any) {
      setConfirmError(err.message || "Failed to initiate payment.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleConfirmWallet() {
    if (!selectedSlot || !doctor) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await payWithWallet({
        amount: isEligibleForFollowUpDiscount ? (doctor.followUpFee ?? (doctor.consultationFee ?? 0) * 0.5) : (doctor.consultationFee ?? 0),
        purpose: "appointment",
        referenceId: selectedSlot._id
      });
      setStep("success");
    } catch (err: any) {
      setConfirmError(err.message || "Failed to process wallet payment.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleConfirmSplit() {
    if (!selectedSlot || !doctor) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await createCheckout({
        amount: isEligibleForFollowUpDiscount ? (doctor.followUpFee ?? (doctor.consultationFee ?? 0) * 0.5) : (doctor.consultationFee ?? 0),
        purpose: "appointment",
        referenceId: selectedSlot._id,
        paymentMethod: "card",
        useWallet: true
      });
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not get payment URL");
      }
    } catch (err: any) {
      setConfirmError(err.message || "Failed to initiate payment.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleHold() {
    if (!selectedSlot) return;
    setConfirming(true);
    try {
      await holdSlot(selectedSlot._id);
      setStep("confirm");
    } catch (err: any) {
      alert(err.message || "Could not hold slot. Please try another.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleCancel() {
    if (selectedSlot) {
      await releaseReservation(selectedSlot._id);
    }
    router.push(`/patient/doctors/${doctorId}`);
  }

  // ── Doctor info ────────────────────────────────────────────────────────────

  const doctorName = doctor ? `Dr. ${doctor.userId.fullName}` : "Doctor";
  const doctorInitials = initialsOf(doctor?.userId.fullName ?? "");
  const doctorSpec = doctor?.specialization ?? "General Medicine";
  const contact: DoctorContact =
    (doctor as (DoctorListItem & { contact?: DoctorContact }) | null)?.contact ?? {};
  const hasContact = Boolean(contact.phone || contact.whatsapp || contact.landline);

  const ALL_STEPS: Step[] = ["clinic", "calendar", "confirm"];
  const stepIndex = ALL_STEPS.indexOf(step);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]`}>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        .slot-available-in {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <DashboardHeader
        title={step === "clinic" ? "Choose a clinic"
          : step === "calendar" ? "Pick a day"
          : step === "confirm" ? "Confirm booking"
          : "Booking confirmed!"}
        subtitle={step === "success" ? "You're all set" : doctorName}
        backPath="/patient/doctors"
        rightElement={
          step !== "success" ? (
            <div className="flex items-center gap-2">
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
              <button onClick={handleCancel} className="py-2 px-4 rounded-xl border border-red-500 bg-red-50 text-red-700 text-[12px] font-bold hover:bg-red-100">
                Cancel
              </button>
            </div>
          ) : undefined
        }
      />

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        {isEligibleForFollowUpDiscount && step !== "success" && (
          <div className="bg-sky-50 border-b border-sky-100 p-3 flex items-center justify-center gap-2">
            <LuStar className="text-sky-500 shrink-0" />
            <p className="text-sky-800 text-sm font-semibold text-center">
              You are eligible for a follow-up discount with this doctor! Discount will be automatically applied at checkout.
            </p>
          </div>
        )}

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
            {clinics.length === 0 ? (
              <EmptyState
                icon={<LuBuilding2 />}
                title="No clinics available"
                description="This doctor hasn't added any clinics yet."
              />
            ) : (
              <>
                <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mb-5">
                  {doctorName} operates from {clinics.length > 1 ? "multiple clinics" : "the following clinic"}. Choose one to see its availability.
                </p>
                <div className="space-y-3">
                  {clinics.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => handleSelectClinic(c)}
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
                            <LuMapPin className="text-[12px] shrink-0" /> {c.address} — {c.governorate}
                          </div>
                          {(c.phone || c.whatsapp || c.landline) && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11.5px] font-semibold text-sky-700">
                              <LuPhone className="text-[12px] shrink-0" />
                              {c.phone || c.whatsapp || c.landline}
                            </div>
                          )}
                          {c.services && c.services.length > 0 && (
                            <div className="mt-1.5 text-[11px] font-bold text-sky-700">
                              {c.services.length} service{c.services.length !== 1 ? "s" : ""} available
                            </div>
                          )}
                        </div>
                        <LuChevronRight className="text-[hsl(var(--color-text-muted))] group-hover:text-sky-600 transition-colors mt-1 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
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
                <EmptyState icon={<LuCircleAlert />} title="No open slots" description="This clinic doesn't have any available slots yet." />
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
                            title={isAlreadyBooked ? "You already have an appointment with this doctor that day" : undefined}
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

                        {bookingMode === "online" && (
                          <div>
                            <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5">
                              Choose a time
                            </label>
                            <select
                              value={selectedSlot?._id ?? ""}
                              onChange={(e) => {
                                const slot = sortedDaySlots.find((s) => s._id === e.target.value);
                                if (slot) setSelectedSlot(slot);
                              }}
                              className="w-full px-3 py-2.5 rounded-xl border border-sky-300 bg-sky-50 text-[13px] font-bold text-sky-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all mb-1.5"
                            >
                              {sortedDaySlots.map((s) => {
                                const remainingMs = s.isReserved && s.reservedAt
                                  ? Math.max(0, 5 * 60 * 1000 - (Date.now() - new Date(s.reservedAt).getTime()))
                                  : 0;
                                const remainingMin = Math.ceil(remainingMs / 60000);
                                return (
                                  <option key={s._id} value={s._id} disabled={remainingMs > 0 || s.isBooked}>
                                    {slotTimeRangeLabel(s)}
                                    {s.isBooked ? ' (Booked)' : remainingMs > 0 ? ` (Available in ${remainingMin} min)` : ''}
                                  </option>
                                );
                              })}
                            </select>
                            <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mb-4">
                              We've pre-selected the next available time — pick another from the list if you'd prefer.
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setBookingMode(null); setSelectedSlot(null); }}
                                className="flex-1 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[12.5px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all"
                              >
                                ← Back
                              </button>
                              <button
                                onClick={handleHold}
                                disabled={confirming}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-800 to-sky-600 text-white text-[12.5px] font-black transition-all disabled:opacity-50"
                              >
                                {confirming ? "Holding..." : "Continue →"}
                              </button>
                            </div>
                          </div>
                        )}

                        {bookingMode === "contact" && (
                          <div>
                            {selectedClinic && (selectedClinic.phone || selectedClinic.whatsapp || selectedClinic.landline) ? (
                              <div className="flex flex-col gap-2 mb-4">
                                {selectedClinic.phone && (
                                  <a href={`tel:${selectedClinic.phone}`}
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <LuPhone className="text-[15px]" /> Call: {selectedClinic.phone}
                                  </a>
                                )}
                                {selectedClinic.whatsapp && (
                                  <a href={`https://wa.me/${selectedClinic.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <FaWhatsapp className="text-[15px]" /> WhatsApp: {selectedClinic.whatsapp}
                                  </a>
                                )}
                                {selectedClinic.landline && (
                                  <a href={`tel:${selectedClinic.landline}`}
                                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl border border-sky-300 bg-sky-50 text-[12.5px] font-bold text-sky-700 hover:bg-sky-100 transition-all">
                                    <LuPhoneCall className="text-[15px]" /> Landline: {selectedClinic.landline}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-300 rounded-xl p-3 mb-4">
                                <LuInfo className="text-sky-600 text-[14px] mt-0.5 shrink-0" />
                                <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                                  Contact details aren't available for this clinic yet.
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
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
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
                    {selectedClinic.name} — {selectedClinic.address}, {selectedClinic.governorate}
                  </div>
                )}

                <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-300 rounded-xl p-3">
                  <LuInfo className="text-sky-600 text-[14px] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                    You can cancel this appointment anytime before the scheduled time from My Appointments.
                  </p>
                </div>

                {confirmError && (
                  <div className="flex items-start gap-2.5 bg-danger-light border border-red-200 text-danger rounded-xl p-3 text-[12px] font-semibold">
                    <LuCircleAlert className="text-[14px] mt-0.5 shrink-0" />{confirmError}
                  </div>
                )}

                {doctor && (
                  <div className="flex flex-col gap-2 bg-[hsl(var(--color-bg-soft))] p-4 rounded-xl border border-[hsl(var(--color-border))]">
                    <div className="flex justify-between items-center text-[13px] font-bold">
                      <span className="text-[hsl(var(--color-text-muted))]">Consultation Fee</span>
                      <span className="text-[hsl(var(--color-text))]">
                        {isEligibleForFollowUpDiscount
                          ? (doctor.followUpFee ?? (doctor.consultationFee ?? 0) * 0.5)
                          : (doctor.consultationFee ?? 0)} EGP
                        {isEligibleForFollowUpDiscount && <span className="ml-1 text-[10px] text-sky-600">(Follow-up)</span>}
                      </span>
                    </div>
                    {wallet && wallet.availableBalance > 0 && (
                      <div className="flex justify-between items-center text-[13px] font-bold">
                        <span className="text-[hsl(var(--color-text-muted))]">Wallet Balance</span>
                        <span className="text-emerald-600">{wallet.availableBalance} EGP</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                  {wallet && wallet.availableBalance >= (isEligibleForFollowUpDiscount ? (doctor?.followUpFee ?? (doctor?.consultationFee ?? 0) * 0.5) : (doctor?.consultationFee ?? 0)) && (
                    <button
                      onClick={handleConfirmWallet}
                      disabled={confirming}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-[14px] font-black hover:bg-emerald-700 transition-all disabled:opacity-60"
                    >
                      {confirming ? "Processing…" : "Pay with Wallet ✓"}
                    </button>
                  )}

                  {wallet && wallet.availableBalance > 0 && wallet.availableBalance < (isEligibleForFollowUpDiscount ? (doctor?.followUpFee ?? (doctor?.consultationFee ?? 0) * 0.5) : (doctor?.consultationFee ?? 0)) && (
                    <button
                      onClick={handleConfirmSplit}
                      disabled={confirming}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-[14px] font-black hover:opacity-90 transition-all disabled:opacity-60"
                    >
                      {confirming ? "Processing…" : `Use Wallet & Pay ${(isEligibleForFollowUpDiscount ? (doctor?.followUpFee ?? (doctor?.consultationFee ?? 0) * 0.5) : (doctor?.consultationFee ?? 0)) - wallet.availableBalance} EGP`}
                    </button>
                  )}

                  <button
                    onClick={handleConfirmCard}
                    disabled={confirming}
                    className="w-full py-3.5 rounded-xl bg-[hsl(var(--color-bg))] border-2 border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[14px] font-black hover:border-sky-500 hover:text-sky-700 transition-all disabled:opacity-60"
                  >
                    {confirming ? "Processing…" : "Pay with Card"}
                  </button>
                </div>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center mx-auto animate-bounce">
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
                className="text-[13px] font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-sky-800 to-sky-600 text-white hover:scale-105 transition-all"
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
