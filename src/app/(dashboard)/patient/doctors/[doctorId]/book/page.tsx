"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCheck, LuCircleAlert, LuClock, LuCalendarDays, LuInfo,
  LuChevronLeft, LuChevronRight, LuPhone, LuPhoneCall, LuMapPin, LuBuilding2, LuStar,
} from "react-icons/lu";
import { LuMessageCircle } from "react-icons/lu";

import {
  DoctorListItem, Slot, Appointment,
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

  const [validFollowUp, setValidFollowUp] = useState<any | null>(null);

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

        const validFollowUpAppt = (myAppts.data || []).find((a: any) => {
          const apptDoctorId = typeof a.doctorId === "string" ? a.doctorId : a.doctorId?._id;
          return apptDoctorId === doctorId && 
                 a.status === "completed" && 
                 (a.followUpStatus === "overridden" || a.followUpStatus === "scheduled");
        });
        setValidFollowUp(validFollowUpAppt || null);
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

  const isEligibleForFollowUpDiscount = useMemo(() => {
    if (!validFollowUp) return false;
    if (validFollowUp.followUpStatus === "overridden") return true;
    if (!validFollowUp.followUpDeadline) return false;
    
    // If a slot is selected, check against the slot date exactly like the backend
    if (selectedSlot) {
      const slotDate = new Date(selectedSlot.startDateTime);
      slotDate.setHours(0, 0, 0, 0);
      const deadline = new Date(validFollowUp.followUpDeadline);
      deadline.setHours(0, 0, 0, 0);
      return slotDate <= deadline;
    }
    
    // If no slot is selected yet, check against today so we can show the banner if they MIGHT be eligible
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(validFollowUp.followUpDeadline);
    deadline.setHours(0, 0, 0, 0);
    return today <= deadline;
  }, [validFollowUp, selectedSlot]);

  const currentFee = useMemo(() => {
    if (!selectedClinic) return 0;
    const baseFee = selectedClinic.consultationFee || 0;
    if (isEligibleForFollowUpDiscount) {
      return selectedClinic.followUpFee ?? (baseFee * 0.5);
    }
    return baseFee;
  }, [selectedClinic, isEligibleForFollowUpDiscount]);

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
    const group = groupsByLocalKey.get(key);
    if (!group) return;
    if (bookedDates.has(key)) return;
    setSelectedDateKey(key);
    setBookingMode(null);
    
    // Auto-select first available slot
    const firstSlot = [...group.slots].sort(byStartTime)[0];
    setSelectedSlot(firstSlot || null);
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
        amount: currentFee,
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
        amount: currentFee,
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
        amount: currentFee,
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
          color: hsl(var(--color-text-muted));
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
        showBack={true}
      />

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto flex flex-col relative bg-[hsl(var(--color-bg-base))]">
        {/* ── Progress Wizard Bar ── */}
        {step !== "success" && (
          <div className="w-full bg-[hsl(var(--color-bg-base))] pt-6 pb-2 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] p-3 sm:p-4 md:px-6 flex items-center justify-between gap-3 shadow-[var(--shadow-card)]">
                <div className="flex items-center flex-1 min-w-0">
                  {ALL_STEPS.map((s, i) => (
                    <div key={s} className={`flex items-center ${i < ALL_STEPS.length - 1 ? "flex-1" : "shrink-0"}`}>
                      <div className="flex items-center shrink-0 gap-1.5 md:gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold tracking-widest border-[2px] transition-all duration-300 ${
                          i < stepIndex
                            ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white"
                            : step === s
                            ? "bg-[hsl(var(--color-primary)/0.1)] border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-strong))] shadow-[0_0_0_4px_hsl(var(--color-primary)/0.05)]"
                            : "bg-[hsl(var(--color-bg-soft))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                        }`}>
                          {i < stepIndex ? <LuCheck className="text-[16px]" /> : i + 1}
                        </div>
                        <div className={`flex-col ${step === s ? "flex" : "hidden lg:flex"}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= stepIndex ? "text-[hsl(var(--color-primary-strong))]" : "text-[hsl(var(--color-text-muted))]"}`}>Step {i + 1}</span>
                          <span className={`text-[13px] font-semibold ${i <= stepIndex ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"}`}>
                            {s === "clinic" ? "Location" : s === "calendar" ? "Date & Time" : "Confirm"}
                          </span>
                        </div>
                      </div>
                      
                      {i < ALL_STEPS.length - 1 && (
                        <div className={`flex-1 mx-2 md:mx-4 h-[2px] rounded-full transition-colors duration-300 min-w-[8px] max-w-[48px] ${i < stepIndex ? "bg-[hsl(var(--color-primary))]" : "bg-[hsl(var(--color-border))]"}`} />
                      )}
                    </div>
                  ))}
                </div>
                
                <button onClick={handleCancel} className="py-2 px-3 sm:px-5 rounded-xl border border-[hsl(var(--color-danger)/0.3)] bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] text-[12px] sm:text-[13px] font-bold tracking-wide hover:bg-[hsl(var(--color-danger)/0.15)] hover:border-[hsl(var(--color-danger)/0.5)] transition-all shrink-0">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isEligibleForFollowUpDiscount && step !== "success" && (
          <div className="bg-[hsl(var(--color-primary-soft))] border-b border-[hsl(var(--color-primary)/0.2)] p-3 flex items-center justify-center gap-2">
            <LuStar className="text-sky-500 shrink-0" />
            <p className="text-[hsl(var(--color-primary-strong))] text-sm font-semibold text-center">
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
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {clinics.length === 0 ? (
              <EmptyState
                icon={<LuBuilding2 />}
                title="No clinics available"
                description="This doctor hasn't added any clinics yet."
              />
            ) : (
              <>
                <div className="mb-8 md:mb-10 text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-black text-[hsl(var(--color-text))] mb-3">Where would you like to visit?</h2>
                  <p className="text-[15px] font-medium text-[hsl(var(--color-text-muted))] leading-relaxed">
                    <span className="text-[hsl(var(--color-primary))] font-semibold">{doctorName}</span> operates from {clinics.length > 1 ? "multiple clinics" : "the following clinic"}. Choose a convenient location to see availability.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {clinics.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleSelectClinic(c)}
                      role="button"
                      tabIndex={0}
                      className="w-full p-5 rounded-2xl border-[2px] border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:border-[hsl(var(--color-primary))] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] transition-all duration-300 group cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--color-primary)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
                      
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-left" dir="ltr">
                        {/* Icon - Left Fixed */}
                        <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0 border border-[hsl(var(--color-primary)/0.2)] group-hover:bg-[hsl(var(--color-primary))] group-hover:border-[hsl(var(--color-primary))] transition-colors shadow-sm">
                          <LuBuilding2 className="text-[hsl(var(--color-primary-strong))] group-hover:text-white text-[22px] transition-colors" />
                        </div>
                        
                        {/* Text Content - Middle Fluid */}
                        <div className="flex flex-col gap-1.5 overflow-hidden">
                          <h3 className="text-left text-[16px] md:text-[17px] font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary-strong))] transition-colors truncate">
                            <bdi>{c.name}</bdi>
                          </h3>
                          
                          <div className="flex items-start gap-2 text-[13px] font-medium text-[hsl(var(--color-text-muted))]">
                            <LuMapPin className="text-[15px] shrink-0 text-[hsl(var(--color-primary))] mt-0.5" /> 
                            <span className="text-left line-clamp-2 break-words w-full">
                              <bdi>{c.address}</bdi> <span className="mx-1">—</span> <bdi className="font-bold text-[hsl(var(--color-text))]">{c.governorate}</bdi>
                            </span>
                          </div>
                          
                          {(c.phone || c.whatsapp || c.landline) && (
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[hsl(var(--color-text))]">
                              <LuPhone className="text-[14px] shrink-0 text-[hsl(var(--color-success))]" />
                              <span className="text-left truncate w-full">
                                <bdi>{c.phone || c.whatsapp || c.landline}</bdi>
                              </span>
                            </div>
                          )}

                          {c.services && c.services.length > 0 && (
                            <div className="mt-1 flex items-center justify-start">
                              <div className="bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide border border-[hsl(var(--color-primary)/0.2)]">
                                {c.services.length} Service{c.services.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Chevron - Right Fixed */}
                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-[hsl(var(--color-bg-soft))] items-center justify-center group-hover:bg-[hsl(var(--color-primary)/0.15)] shrink-0 transition-colors">
                          <LuChevronRight className="text-[hsl(var(--color-text-muted))] group-hover:text-[hsl(var(--color-primary))] transition-colors text-[20px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        ) : step === "calendar" ? (
          /* ── Step 2: calendar ── */
          <div className="flex flex-col h-full">
            {/* Doctor + clinic premium card */}
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 md:px-8 mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center text-white text-[15px] font-black shrink-0 shadow-sm border border-sky-700/50">
                    {doctorInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-black text-[hsl(var(--color-text))] mb-0.5">{doctorName}</p>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-sky-600 truncate">
                      <LuMapPin className="shrink-0 text-[13px]" />
                      <span className="truncate" dir="auto">{selectedClinic?.name} · {selectedClinic?.address}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep("clinic")}
                  className="py-2.5 px-5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] text-[12.5px] font-bold hover:bg-[hsl(var(--color-bg-base))] hover:text-[hsl(var(--color-primary-strong))] transition-all shrink-0 w-full sm:w-auto text-center shadow-sm"
                >
                  Change Location
                </button>
              </div>
            </div>

            {dateGroups.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<LuCircleAlert />} title="No open slots" description="This clinic doesn't have any available slots yet." />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 p-4 md:p-6 md:px-8 w-full max-w-6xl mx-auto items-start">
                {/* Calendar */}
                <div className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => goToMonth(-1)}
                      aria-label="Previous month"
                      className="w-9 h-9 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary-strong))] hover:border-sky-500 hover:bg-sky-50 transition-all"
                    >
                      <LuChevronLeft className="text-[18px]" />
                    </button>
                    <p className="text-[15px] font-bold text-[hsl(var(--color-text))]">
                      {viewMonth ? `${MONTHS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}` : ""}
                    </p>
                    <button
                      onClick={() => goToMonth(1)}
                      aria-label="Next month"
                      className="w-9 h-9 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary-strong))] hover:border-sky-500 hover:bg-sky-50 transition-all"
                    >
                      <LuChevronRight className="text-[18px]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((w) => (
                      <div key={w} className="text-center text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">{w}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {monthCells.map((date, idx) => {
                      if (!date) return <div key={idx} />;
                      const key = localDateKey(date);
                      const isAvailable = groupsByLocalKey.has(key);
                      const isSelected = key === selectedDateKey;
                      const isAlreadyBooked = bookedDates.has(key);

                      // Is this date inside the follow-up discount window?
                      const isFollowUpDate = (() => {
                        if (!validFollowUp) return false;
                        if (validFollowUp.followUpStatus === "overridden") return isAvailable;
                        if (!validFollowUp.followUpDeadline) return false;
                        const d = new Date(date);
                        d.setHours(0, 0, 0, 0);
                        const deadline = new Date(validFollowUp.followUpDeadline);
                        deadline.setHours(0, 0, 0, 0);
                        return isAvailable && d <= deadline;
                      })();

                      return (
                        <div key={idx} className="flex items-center justify-center relative aspect-square">
                          <button
                            disabled={!isAvailable || isAlreadyBooked}
                            onClick={() => handlePickDay(date)}
                            title={isAlreadyBooked ? "You already have an appointment with this doctor that day" : isFollowUpDate ? `Follow-up discount applies! Pay ${doctor?.followUpFee ?? ((doctor?.consultationFee ?? 0) * 0.5)} EGP` : undefined}
                            className={`w-full h-full max-w-[44px] max-h-[44px] rounded-full text-[13.5px] font-bold transition-all flex items-center justify-center border-2 ${
                              isSelected
                                ? "bg-[hsl(var(--color-primary-strong))] border-sky-800 text-white shadow-md shadow-sky-500/20"
                                : isAlreadyBooked
                                ? "border-amber-400 bg-amber-50 text-amber-600 cursor-not-allowed opacity-50"
                                : isFollowUpDate
                                ? "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:shadow-sm"
                                : isAvailable
                                ? "border-sky-500 text-[hsl(var(--color-primary-strong))] bg-[hsl(var(--color-bg-surface))] hover:bg-sky-50 hover:border-sky-600 hover:shadow-sm"
                                : "border-transparent text-[hsl(var(--color-text-muted))] cursor-default opacity-40"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                          {isFollowUpDate && !isSelected && (
                            <span className="absolute top-0 right-0 sm:-top-0.5 sm:-right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center pointer-events-none">
                              <LuStar className="text-white" style={{ fontSize: 7 }} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-2 mt-6 pt-4 border-t border-[hsl(var(--color-border))]">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                      <span className="w-3.5 h-3.5 rounded-full border-[2px] border-sky-500 inline-block" />
                      Available day
                    </div>
                    {validFollowUp && (
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                        <span className="w-3.5 h-3.5 rounded-full border-[2px] border-emerald-500 bg-emerald-50 inline-block relative">
                          <LuStar className="absolute -top-1 -right-1 text-emerald-500" style={{ fontSize: 8 }} />
                        </span>
                        Follow-up discount ({selectedClinic?.followUpFee ?? ((selectedClinic?.consultationFee ?? 0) * 0.5)} EGP)
                        {validFollowUp.followUpStatus !== "overridden" && validFollowUp.followUpDeadline && (
                          <span className="text-[10px] text-emerald-500 font-normal">
                            — until {new Date(validFollowUp.followUpDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        )}
                        {validFollowUp.followUpStatus === "overridden" && (
                          <span className="text-[10px] text-emerald-500 font-normal">— open (no deadline)</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                      <span className="w-3.5 h-3.5 rounded-full border-[2px] border-amber-400 bg-amber-50 inline-block opacity-50" />
                      Already booked
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6 shadow-[var(--shadow-card)]">
                  {!selectedGroup ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <LuCalendarDays className="text-[26px] text-[hsl(var(--color-text-muted))] mb-3" />
                      <p className="text-sm font-medium font-black text-[hsl(var(--color-text))]">Select a day</p>
                      <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mt-1 max-w-[220px]">
                        Pick a highlighted day on the calendar to see availability and booking options.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium font-black text-[hsl(var(--color-text))] mb-4">
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
                          <p className="text-sm font-medium font-black text-[hsl(var(--color-text))]">
                            {selectedGroup.slots.length} slots
                          </p>
                        </div>
                      </div>

                      {/* Follow-up fee note on selected date */}
                      {isEligibleForFollowUpDiscount && selectedGroup && selectedClinic && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4">
                          <LuStar className="text-emerald-500 shrink-0 text-sm font-medium" />
                          <p className="text-[11.5px] font-bold text-emerald-700 leading-tight">
                            Follow-up discount applies — you'll pay {selectedClinic.followUpFee ?? ((selectedClinic.consultationFee ?? 0) * 0.5)} EGP instead of {selectedClinic.consultationFee ?? 0} EGP
                          </p>
                        </div>
                      )}

                      <div className="border-t border-[hsl(var(--color-border))] pt-4">
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
                            className="w-full px-3 py-2.5 rounded-xl border border-sky-300 bg-[hsl(var(--color-primary-soft))] text-sm font-medium font-bold text-[hsl(var(--color-primary-strong))] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all mb-1.5"
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
                          
                          <button
                            onClick={handleHold}
                            disabled={!selectedSlot || confirming}
                            className={`w-full py-3.5 rounded-xl text-[13.5px] font-black transition-all flex items-center justify-center gap-2 ${
                              !selectedSlot || confirming
                                ? "bg-sky-100 text-sky-400 cursor-not-allowed border border-sky-200"
                                : "bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-700 hover:to-sky-600 hover:shadow-md border border-transparent shadow-sm"
                            }`}
                          >
                            {confirming ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Continue to Confirm"
                            )}
                          </button>
                        </div>
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
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-800 to-sky-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {doctorInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--color-text))]">{doctorName}</p>
                    <p className="text-[12px] font-semibold text-sky-600">{doctorSpec}</p>
                  </div>
                </div>

                {selectedClinic && (
                  <div className="flex items-center gap-2.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                    <LuMapPin className="text-sky-600 text-[14px] shrink-0" />
                    {selectedClinic.name} — {selectedClinic.address}, {selectedClinic.governorate}
                  </div>
                )}

                <div className="flex items-start gap-2.5 bg-[hsl(var(--color-primary-soft))] border border-sky-300 rounded-xl p-3">
                  <LuInfo className="text-sky-600 text-[14px] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-[hsl(var(--color-primary-strong))] leading-relaxed">
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
                    <div className="flex justify-between items-center text-sm font-medium font-bold">
                      <span className="text-[hsl(var(--color-text-muted))]">Consultation Fee</span>
                      <span className="text-[hsl(var(--color-text))]">
                        {currentFee} EGP
                        {isEligibleForFollowUpDiscount && <span className="ml-1 text-[10px] text-sky-600">(Follow-up)</span>}
                      </span>
                    </div>
                    {wallet && wallet.availableBalance > 0 && (
                      <div className="flex justify-between items-center text-sm font-medium font-bold">
                        <span className="text-[hsl(var(--color-text-muted))]">Wallet Balance</span>
                        <span className="text-emerald-600">{wallet.availableBalance} EGP</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                  {wallet && wallet.availableBalance >= currentFee && (
                    <button
                      onClick={handleConfirmWallet}
                      disabled={confirming}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-60"
                    >
                      {confirming ? "Processing…" : "Pay with Wallet ✓"}
                    </button>
                  )}

                  {wallet && wallet.availableBalance > 0 && wallet.availableBalance < currentFee && (
                    <button
                      onClick={handleConfirmSplit}
                      disabled={confirming}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                    >
                      {confirming ? "Processing…" : `Use Wallet & Pay ${currentFee - wallet.availableBalance} EGP`}
                    </button>
                  )}

                  <button
                    onClick={handleConfirmCard}
                    disabled={confirming}
                    className="w-full py-3.5 rounded-xl bg-[hsl(var(--color-bg))] border-2 border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-sm font-semibold hover:border-sky-500 hover:text-[hsl(var(--color-primary-strong))] transition-all disabled:opacity-60"
                  >
                    {confirming ? "Processing…" : "Pay with Card"}
                  </button>
                </div>
                <button
                  onClick={() => setStep("calendar")}
                  className="w-full py-3 rounded-xl border border-[hsl(var(--color-border))] text-sm font-medium font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
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
              <strong className="text-[hsl(var(--color-primary-strong))]">
                {selectedSlot ? `${formatFullDate(selectedSlot.startDateTime)} · ${slotTimeRangeLabel(selectedSlot)}` : ""}
              </strong>
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => router.push("/patient/appointments")}
                className="text-sm font-medium font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-sky-800 to-sky-600 text-white hover:scale-105 transition-all"
              >
                View my appointments
              </button>
              <button
                onClick={() => router.push("/patient/doctors")}
                className="text-sm font-medium font-bold px-6 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
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
