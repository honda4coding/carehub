"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LuArrowLeft, LuCheck, LuCircleAlert, LuClock, LuCalendarDays, LuInfo } from "react-icons/lu";

import {
  DoctorListItem, Slot,
  bookAppointment, getApprovedDoctors, getAvailableSlots,
} from "@/services/appointmentService";
import {
  formatFullDate, groupSlotsByDate, initialsOf, slotTimeRangeLabel,
} from "@/components/appointments/format";
import EmptyState from "@/components/appointments/EmptyState";

type Step = "slots" | "confirm" | "success";

export default function BookAppointmentPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();

  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("slots");
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
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

  const dateGroups = useMemo(() => groupSlotsByDate(slots), [slots]);

  useEffect(() => {
    if (!activeDateKey && dateGroups.length > 0) setActiveDateKey(dateGroups[0].dateKey);
  }, [dateGroups, activeDateKey]);

  const activeGroup = dateGroups.find((g) => g.dateKey === activeDateKey);

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

  const doctorName = doctor ? `Dr. ${doctor.userId.fullName}` : "Doctor";
  const doctorInitials = initialsOf(doctor?.userId.fullName ?? "");
  const doctorSpec = doctor?.specialization ?? "General Medicine";

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center gap-3">
        <Link href="/patient/doctors"
          className="w-9 h-9 rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-all shrink-0">
          <LuArrowLeft className="text-[14px]" />
        </Link>
        <div>
          <h1 className="text-[17px] font-black text-[hsl(var(--color-text))]">
            {step === "slots" ? "Pick a time" : step === "confirm" ? "Confirm booking" : "Booking confirmed!"}
          </h1>
          <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
            {step === "slots" ? doctorName : step === "confirm" ? "Review before confirming" : "You're all set"}
          </p>
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="ml-auto flex items-center gap-2">
            {(["slots", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                  step === s ? "bg-primary border-primary text-white" :
                  (step === "confirm" && s === "slots") ? "bg-primary/20 border-primary text-primary" :
                  "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                }`}>{i + 1}</div>
                {i === 0 && <div className={`w-8 h-0.5 rounded ${step === "confirm" ? "bg-primary" : "bg-[hsl(var(--color-border))]"}`} />}
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="h-[280px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
          </div>
        ) : loadError ? (
          <div className="p-6"><EmptyState icon={<LuCircleAlert />} title="Something went wrong" description={loadError} /></div>

        ) : step === "slots" ? (
          <div className="flex flex-col h-full">
            {/* Doctor mini card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-white text-[13px] font-black shrink-0">
                {doctorInitials}
              </div>
              <div>
                <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                <p className="text-[11px] font-bold text-primary">{doctorSpec}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                <LuCalendarDays className="text-[13px]" />
                {dateGroups.length} available day{dateGroups.length !== 1 ? "s" : ""}
              </div>
            </div>

            {dateGroups.length === 0 ? (
              <div className="p-6"><EmptyState icon={<LuCircleAlert />} title="No open slots" description="This doctor hasn't published any availability yet." /></div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Date list — left column */}
                <div className="w-[110px] sm:w-[130px] shrink-0 border-r border-[hsl(var(--color-border))] overflow-y-auto bg-[hsl(var(--color-bg-surface))]">
                  {dateGroups.map((g) => {
                    const isActive = g.dateKey === activeDateKey;
                    return (
                      <button key={g.dateKey}
                        onClick={() => { setActiveDateKey(g.dateKey); setSelectedSlot(null); }}
                        className={`w-full py-4 px-2 text-center border-b border-[hsl(var(--color-border))] transition-all ${
                          isActive ? "bg-primary/10 border-l-[3px] border-l-primary" : "hover:bg-[hsl(var(--color-bg-soft))]"
                        }`}>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-primary" : "text-[hsl(var(--color-text-muted))]"}`}>
                          {g.dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className={`text-[22px] font-black leading-tight ${isActive ? "text-primary" : "text-[hsl(var(--color-text))]"}`}>
                          {g.dateObj.getDate()}
                        </div>
                        <div className={`text-[9px] font-bold uppercase ${isActive ? "text-primary/70" : "text-[hsl(var(--color-text-muted))]"}`}>
                          {g.dateObj.toLocaleDateString("en-US", { month: "short" })}
                        </div>
                        <div className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full mx-auto w-fit ${
                          isActive ? "bg-primary text-white" : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                        }`}>
                          {g.slots.length}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Slots grid — right */}
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-3 flex items-center gap-1.5">
                    <LuClock className="text-[13px]" />
                    {activeGroup?.slots.length} slots on {activeGroup ? formatFullDate(activeGroup.dateObj) : ""}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-24">
                    {activeGroup?.slots.map((s) => {
                      const isSelected = selectedSlot?._id === s._id;
                      return (
                        <button key={s._id} onClick={() => setSelectedSlot(s)}
                          className={`py-3.5 px-2 rounded-xl border text-[12.5px] font-bold transition-all duration-200 ${
                            isSelected
                              ? "bg-primary border-primary text-white shadow-[0_4px_14px_hsl(var(--color-primary)/0.4)] scale-[1.03]"
                              : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-primary hover:text-primary hover:scale-[1.02]"
                          }`}>
                          {slotTimeRangeLabel(s)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sticky bottom bar */}
            {dateGroups.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-border))] flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div>
                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">Selected time</p>
                  <p className="text-[13px] font-black text-[hsl(var(--color-text))]">
                    {selectedSlot ? `${formatFullDate(selectedSlot.startDateTime)} · ${slotTimeRangeLabel(selectedSlot)}` : "None selected"}
                  </p>
                </div>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep("confirm")}
                  className={`relative text-[13px] font-black px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedSlot
                      ? "bg-gradient-to-r from-primary to-sky-400 text-white shadow-[0_4px_15px_hsl(var(--color-primary)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--color-primary)/0.5)] hover:scale-105"
                      : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed"
                  }`}>
                  {selectedSlot && <span className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />}
                  <span className="relative">Continue →</span>
                </button>
              </div>
            )}
          </div>

        ) : step === "confirm" ? (
          <div className="p-4 md:p-6 max-w-md mx-auto">
            {/* Ticket card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-lg">
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-primary to-sky-400 px-6 py-7 text-center text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-2">Your Appointment</p>
                <p className="text-[26px] font-black">{selectedSlot ? formatFullDate(selectedSlot.startDateTime) : ""}</p>
                <div className="flex items-center justify-center gap-2 mt-2 bg-white/20 rounded-xl px-4 py-2 w-fit mx-auto">
                  <LuClock className="text-[14px]" />
                  <p className="text-[14px] font-bold">{selectedSlot ? slotTimeRangeLabel(selectedSlot) : ""}</p>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="border-t-2 border-dashed border-[hsl(var(--color-border))] relative">
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--color-bg))]" />
              </div>

              <div className="p-6 space-y-4">
                {/* Doctor info */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-white text-[14px] font-black shrink-0">
                    {doctorInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{doctorName}</p>
                    <p className="text-[12px] font-semibold text-primary">{doctorSpec}</p>
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-200 rounded-xl p-3">
                  <LuInfo className="text-sky-500 text-[14px] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-sky-700 leading-relaxed">
                    You can cancel this appointment anytime before the scheduled time from My Appointments.
                  </p>
                </div>

                {confirmError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-[12px] font-semibold">
                    <LuCircleAlert className="text-[14px] mt-0.5 shrink-0" />{confirmError}
                  </div>
                )}

                {/* CTA */}
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
          // Success
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
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] mb-8">
              is confirmed for <strong className="text-primary">{selectedSlot ? `${formatFullDate(selectedSlot.startDateTime)} · ${slotTimeRangeLabel(selectedSlot)}` : ""}</strong>
            </p>
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
