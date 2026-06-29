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
import { getDoctorClinics, egyptianGovernorates } from "@/services/clinicService";
import { nextAvailableLabel, initialsOf } from "@/components/appointments/format";

import AppointmentToast from "@/components/appointments/AppointmentToast";
import DoctorCard from "@/components/patients/doctors/DoctorCard";
import DoctorsSkeleton from "@/components/patients/doctors/DoctorsSkeleton";
import SelectDropdown from "@/components/patients/doctors/SelectDropdown";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useTranslations } from "next-intl";

const SPECIALTIES = ["All Specialties", "Cardiology", "General Practice", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];
// Must match the backend's canonical spelling exactly (clinic_model.js), or the filter silently matches nothing.
const GOVERNORATES = ["All Locations", ...egyptianGovernorates];

export default function DoctorsPage() {
  const t = useTranslations("patient.DoctorsPage");
  const tSpec = useTranslations("common.specialties");
  const tGov = useTranslations("common.governorates");
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
      .catch((err: any) => showToast(err?.message ?? t("failedToLoad")))
      .finally(() => setLoading(false));
  }, [showToast]);

  // Doctors don't carry a governorate directly — it lives on their clinics.
  // When a governorate filter is active, check each doctor's clinics for a match.
  const [matchingGovDoctorIds, setMatchingGovDoctorIds] = useState<Set<string> | null>(null);
  const [govFilterLoading, setGovFilterLoading] = useState(false);

  useEffect(() => {
    if (governorate === "All Locations" || doctors.length === 0) {
      setMatchingGovDoctorIds(null);
      return;
    }
    let cancelled = false;
    setGovFilterLoading(true);
    Promise.all(
      doctors.map((d) =>
        getDoctorClinics(d.userId._id, governorate)
          .then((clinics) => ({ id: d.userId._id, match: clinics.length > 0 }))
          .catch(() => ({ id: d.userId._id, match: false }))
      )
    ).then((results) => {
      if (cancelled) return;
      setMatchingGovDoctorIds(new Set(results.filter((r) => r.match).map((r) => r.id)));
      setGovFilterLoading(false);
    });
    return () => { cancelled = true; };
  }, [governorate, doctors]);

  const filtered = useMemo(() =>
    doctors.filter((d) => {
      const name = d.userId.fullName.toLowerCase();
      const spec = (d.specialization ?? "").toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
      const matchSpec = specialty === "All Specialties" || d.specialization === specialty;
      const matchGov = !matchingGovDoctorIds || matchingGovDoctorIds.has(d.userId._id);
      return matchSearch && matchSpec && matchGov;
    }),
    [doctors, search, specialty, matchingGovDoctorIds]
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <AppointmentToast message={toastMsg.msg} variant={toastMsg.variant} onClose={() => setToastMsg(null)} />}

      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backPath="/patient"
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <SelectDropdown value={specialty} onChange={setSpecialty} options={SPECIALTIES} icon={<LuBriefcaseMedical />} getLabel={(v) => v === "All Specialties" ? t("allSpecialties") : tSpec(v)} />
          <SelectDropdown value={governorate} onChange={setGovernorate} options={GOVERNORATES} icon={<LuMapPin />} getLabel={(v) => v === "All Locations" ? t("allLocations") : tGov(v)} />
          <div className="relative">
            <LuSearch className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]" />
            <input
              type="text" placeholder={t("searchPlaceholder")}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 text-[13.5px] font-medium rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
            />
          </div>
        </div>

        {!loading && (
          <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
            {govFilterLoading
              ? t("filtering")
              : filtered.length === 1 ? t("doctorsFound", { count: 1 }) : t("doctorsFoundPlural", { count: filtered.length })}
          </p>
        )}

        {loading ? <DoctorsSkeleton /> : filtered.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center mx-auto mb-4 text-[26px]">
              <LuBriefcaseMedical />
            </div>
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">{t("noDoctors")}</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))]">{t("adjustFilters")}</p>
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
        </div>
      </main>
    </div>
  );
}