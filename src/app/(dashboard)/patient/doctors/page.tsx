"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuSearch, LuCalendarPlus, LuTriangleAlert,
  LuClock, LuBriefcaseMedical, LuChevronDown, LuMapPin,
} from "react-icons/lu";

import {
  DoctorListItem, Slot,
  getApprovedDoctors, getAvailableSlots,
} from "@/services/appointmentService";
import { nextAvailableLabel, initialsOf } from "@/components/appointments/format";

import AppointmentToast from "@/components/appointments/AppointmentToast";
import DoctorCard from "@/components/patients/doctors/DoctorCard";
import DoctorsSkeleton from "@/components/patients/doctors/DoctorsSkeleton";
import SelectDropdown from "@/components/patients/doctors/SelectDropdown";

const SPECIALTIES = ["All Specialties", "Cardiology", "General Practice", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];
const GOVERNORATES = ["All Locations", "Cairo", "Alexandria", "Giza", "Dakahlia", "Damietta", "Port Said", "Suez", "Sharqia", "Gharbia", "Menoufia"];

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ msg: string; variant?: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [governorate, setGovernorate] = useState("All Locations");

  const showToast = useCallback((msg: string, variant: "success" | "error" = "error") => setToastMsg({ msg, variant }), []);

  useEffect(() => {
    getApprovedDoctors()
      .then(setDoctors)
      .catch((err: any) => showToast(err?.message ?? "Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() =>
    doctors.filter((d) => {
      const name = d.userId.fullName.toLowerCase();
      const spec = (d.specialization ?? "").toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
      const matchSpec = specialty === "All Specialties" || d.specialization === specialty;
      return matchSearch && matchSpec;
    }),
    [doctors, search, specialty]
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <AppointmentToast message={toastMsg.msg} variant={toastMsg.variant} onClose={() => setToastMsg(null)} />}

      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4">
        <h1 className="text-[20px] md:text-[22px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">Doctor Directory</h1>
        <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">Browse our network of verified specialists</p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <SelectDropdown value={specialty} onChange={setSpecialty} options={SPECIALTIES} icon={<LuBriefcaseMedical />} />
          <SelectDropdown value={governorate} onChange={setGovernorate} options={GOVERNORATES} icon={<LuMapPin />} />
          <div className="relative">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]" />
            <input
              type="text" placeholder="Search by name…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[13.5px] font-medium rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
            />
          </div>
        </div>

        {!loading && (
          <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? <DoctorsSkeleton /> : filtered.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center mx-auto mb-4 text-[26px]">
              <LuBriefcaseMedical />
            </div>
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">No doctors found</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <DoctorCard
                key={d._id}
                doctor={d}
                onBook={(uid) => router.push(`/patient/doctors/${uid}/book`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}