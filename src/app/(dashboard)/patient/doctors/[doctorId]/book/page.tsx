"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCheck,
  LuCircleAlert,
  LuInfo,
} from "react-icons/lu";

import {
  DoctorListItem,
  Slot,
  bookAppointment,
  getApprovedDoctors,
  getAvailableSlots,
} from "@/services/appointmentService";
import {
  formatFullDate,
  initialsOf,
  timeRangeLabel,
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
        setDoctor(doctors.find((d) => d._id === doctorId) ?? null);
        setSlots(availableSlots);
      } catch (err: any) {
        setLoadError(err.message || "Failed to load available slots");
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // group slots by date
  const dateGroups = useMemo(() => {
    const map = new Map<string, Slot[]>();
    slots.forEach((s) => {
      const key = new Date(s.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        date: new Date(items[0].date),
        items: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [slots]);

  useEffect(() => {
    if (!activeDateKey && dateGroups.length > 0) {
      setActiveDateKey(dateGroups[0].key);
    }
  }, [dateGroups, activeDateKey]);

  const activeGroup = dateGroups.find((g) => g.key === activeDateKey);

  async function handleConfirm() {
    if (!selectedSlot) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await bookAppointment(selectedSlot._id);
      setStep("success");
    } catch (err: any) {
      setConfirmError(
        err.message ||
          "Sorry, this slot was just booked by someone else. Please choose another time."
      );
    } finally {
      setConfirming(false);
    }
  }

  const doctorInitials = initialsOf(doctor?.fullName);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center gap-3">
        <Link
          href="/patient/doctors"
          className="w-8 h-8 rounded-lg border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors shrink-0"
        >
          <LuArrowLeft className="text-[14px]" />
        </Link>
        <div>
          <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))]">
            {step === "slots"
              ? "Pick a time"
              : step === "confirm"
                ? "Confirm your appointment"
                : "Booked!"}
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
            {step === "slots"
              ? "Choose an open slot. All times shown are local."
              : step === "confirm"
                ? "Double-check the details before you book."
                : "Your visit is on the calendar."}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto max-w-2xl w-full mx-auto">
        {loading ? (
          <div className="h-[280px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
        ) : loadError ? (
          <EmptyState icon={<LuCircleAlert />} title="Something went wrong" description={loadError} />
        ) : step === "slots" ? (
          <>
            {/* doctor header card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-3.5 mb-5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-doctor flex items-center justify-center text-white text-[14px] font-black shrink-0">
                {doctorInitials}
              </div>
              <div>
                <h2 className="text-[15px] font-black text-[hsl(var(--color-text))]">
                  {doctor ? `Dr. ${doctor.fullName}` : "Doctor"}
                </h2>
                <p className="text-[12px] font-bold text-primary">
                  {doctor?.specialization || "General Medicine"}
                </p>
              </div>
            </div>

            {dateGroups.length === 0 ? (
              <EmptyState
                icon={<LuCircleAlert />}
                title="No open slots right now"
                description="This doctor hasn't published any availability yet. Please check back later."
              />
            ) : (
              <>
                {/* date strip */}
                <div className="flex gap-2.5 overflow-x-auto pb-3 mb-1">
                  {dateGroups.map((g) => {
                    const isActive = g.key === activeDateKey;
                    return (
                      <button
                        key={g.key}
                        onClick={() => {
                          setActiveDateKey(g.key);
                          setSelectedSlot(null);
                        }}
                        className={`shrink-0 w-16 py-2.5 rounded-xl border text-center transition-all ${
                          isActive
                            ? "bg-primary border-primary"
                            : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] hover:border-primary"
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold uppercase ${
                            isActive ? "text-white" : "text-[hsl(var(--color-text-muted))]"
                          }`}
                        >
                          {g.date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div
                          className={`text-[18px] font-black mt-0.5 ${
                            isActive ? "text-white" : "text-[hsl(var(--color-text))]"
                          }`}
                        >
                          {g.date.getDate()}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* slot grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-24">
                  {activeGroup?.items.map((s) => {
                    const isSelected = selectedSlot?._id === s._id;
                    return (
                      <button
                        key={s._id}
                        onClick={() => setSelectedSlot(s)}
                        className={`py-3 rounded-xl border text-[12.5px] font-bold transition-all ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-primary"
                        }`}
                      >
                        {timeRangeLabel(s.startTime, s.endTime)}
                      </button>
                    );
                  })}
                </div>

                {/* sticky confirm bar */}
                <div className="fixed bottom-0 left-0 md:left-[228px] right-0 p-4 bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-border))] flex items-center justify-between gap-3 z-30">
                  <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                    Selected:{" "}
                    <strong className="text-[hsl(var(--color-text))]">
                      {selectedSlot
                        ? timeRangeLabel(selectedSlot.startTime, selectedSlot.endTime)
                        : "none yet"}
                    </strong>
                  </p>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setStep("confirm")}
                    className={`text-[13px] font-bold px-5 py-2.5 rounded-xl transition-opacity ${
                      selectedSlot
                        ? "bg-primary text-white hover:opacity-90"
                        : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed"
                    }`}
                  >
                    Continue to book →
                  </button>
                </div>
              </>
            )}
          </>
        ) : step === "confirm" ? (
          <div className="max-w-md mx-auto">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-doctor px-6 py-6 text-center text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">
                  Appointment
                </p>
                <p className="text-[22px] font-black">
                  {selectedSlot ? formatFullDate(selectedSlot.date) : ""}
                </p>
                <p className="text-[12.5px] font-semibold opacity-90 mt-1">
                  {selectedSlot ? timeRangeLabel(selectedSlot.startTime, selectedSlot.endTime) : ""}
                </p>
              </div>
              <div className="border-t-2 border-dashed border-[hsl(var(--color-border))]" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-doctor flex items-center justify-center text-white text-[13px] font-black shrink-0">
                    {doctorInitials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">
                      {doctor ? `Dr. ${doctor.fullName}` : "Doctor"}
                    </p>
                    <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                      {doctor?.specialization || "General Medicine"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[hsl(var(--color-bg-soft))] rounded-xl p-3 mb-5">
                  <LuInfo className="text-[14px] text-[hsl(var(--color-text-muted))] mt-0.5 shrink-0" />
                  <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] leading-relaxed">
                    You can cancel this appointment anytime before the scheduled time from My Appointments.
                  </p>
                </div>

                {confirmError && (
                  <div className="flex items-start gap-2.5 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] rounded-xl p-3 mb-5 text-[12px] font-semibold">
                    <LuCircleAlert className="text-[14px] mt-0.5 shrink-0" />
                    {confirmError}
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full py-3 rounded-xl bg-primary text-white text-[13.5px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity mb-2.5"
                >
                  {confirming ? "Booking…" : "Confirm booking"}
                </button>
                <button
                  onClick={() => setStep("slots")}
                  className="w-full py-3 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                >
                  ← Change slot
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-10">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] flex items-center justify-center mx-auto mb-5">
              <LuCheck className="text-[28px]" />
            </div>
            <h2 className="text-[22px] font-black text-[hsl(var(--color-text))] mb-2">
              Appointment booked!
            </h2>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-7 leading-relaxed">
              You're all set with{" "}
              <strong className="text-[hsl(var(--color-text))]">
                {doctor ? `Dr. ${doctor.fullName}` : "your doctor"}
              </strong>{" "}
              on{" "}
              <strong className="text-[hsl(var(--color-text))]">
                {selectedSlot ? formatFullDate(selectedSlot.date) : ""} ·{" "}
                {selectedSlot ? timeRangeLabel(selectedSlot.startTime) : ""}
              </strong>
              .
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={() => router.push("/patient/appointments")}
                className="text-[12.5px] font-bold px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
              >
                View my appointments
              </button>
              <button
                onClick={() => router.push("/patient/doctors")}
                className="text-[12.5px] font-bold px-5 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
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
