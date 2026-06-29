"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuBuilding2, LuSettings2, LuPlus } from "react-icons/lu";

import AppointmentToast from "@/components/appointments/AppointmentToast";
import SectionToggle from "@/components/appointments/SectionToggle";
import ClinicScheduleCard from "@/components/appointments/ClinicScheduleCard";
import { getMyClinics, Clinic } from "@/services/clinicService";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useAuth } from "@/context/AuthContext";

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { user, role } = useAuth();

  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let data = await getMyClinics();
        if (role === 'assistant' && user?.clinicId) {
          data = data.filter(c => c._id === user.clinicId);
        }
        setClinics(data);
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load clinics", variant: "error" });
      } finally {
        setLoadingClinics(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title="My Schedule"
        subtitle="Your weekly hours for each clinic"
        backPath={role === "assistant" ? "/assistant/appointments" : "/doctor/appointments"}
        rightElement={<SectionToggle />}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {loadingClinics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] animate-pulse"
              />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-dashed border-[hsl(var(--color-border))] rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] flex items-center justify-center mx-auto mb-3">
              <LuBuilding2 className="text-[24px] text-[hsl(var(--color-text-muted))]" />
            </div>
            <p className="text-[15px] font-black text-[hsl(var(--color-text))]">No clinics yet</p>
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1 mb-4">
              Add a clinic first to set its schedule
            </p>
            <button
              onClick={() => router.push("/doctor/clinics")}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold px-4 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LuPlus /> Go to My Clinics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {clinics.map((clinic) => (
              <ClinicScheduleCard
                key={clinic._id}
                clinicId={clinic._id}
                clinicName={clinic.name}
                clinicAddress={clinic.address}
              />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <AppointmentToast
          message={toast.msg}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
