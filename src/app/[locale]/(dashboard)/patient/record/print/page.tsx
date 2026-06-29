"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuPrinter,
  LuArrowLeft,
  LuShieldAlert,
  LuActivity,
  LuPill,
  LuUser,
  LuCalendarDays,
  LuStethoscope,
  LuFileText,
  LuLoader,
  LuCheck,
  LuImage,
  LuSearch,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import TimelineCard from "@/components/patients/TimelineCard";
import { useTranslations } from "next-intl";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function printAuthHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientProfile {
  fullName: string;
  bloodType: string;
  chronicDiseases: string[];
  allergies: string[];
  age: number;
  gender: string;
  phoneNumber: string;
  nationalIdStatus?: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

interface AttachedDoc {
  secure_url: string;
  type: string;
  title?: string;
}

interface Encounter {
  id: string; // Unique string ID for selection
  rawDate: Date;
  date: string;
  doctorName: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  prescriptions: Prescription[];
  clinicalNotes: string;
  documents: AttachedDoc[];
  source: 'medical-history' | 'prescription';
  vitals?: {
    bloodPressure?: string;
    sugarLevel?: string;
    pulse?: string;
    temperature?: string;
    height?: string;
    weight?: string;
  };
  rawData?: any;
}

function formatDateForPrint(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return dateStr; }
}

function isImage(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrintMedicalRecordPage() {
  const t = useTranslations("patient.PatientPrintRecordPage");
  const { user } = useAuth();

  const [mode, setMode] = useState<"select" | "preview">("select");
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printedAt] = useState(() =>
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;
    if (!patientId) {
      setError(t("patientIdentityNotFound"));
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      const headers = printAuthHeaders();

      try {
        const [profileRes, historyRes, rxRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/patient/profile`, { headers }),
          axios.get(`${BASE_URL}/medical-history/${patientId}`, { headers }),
          axios.get(`${BASE_URL}/prescrption/patient/${patientId}`, { headers }),
        ]);

        let profileLoaded = false;

        if (profileRes.status === "fulfilled") {
          const p = profileRes.value.data?.data ?? profileRes.value.data;
          if (p) {
            profileLoaded = true;
            setProfile({
              fullName: p.fullName ?? p.userName ?? user!.name ?? "Unknown",
              bloodType: p.bloodType ?? "—",
              chronicDiseases: p.chronic ?? p.chronicDiseases ?? [],
              allergies: p.allergies ?? [],
              age: p.age ?? 0,
              gender: p.gender === "female" ? "Female" : p.gender === "male" ? "Male" : "—",
              phoneNumber: p.phoneNumber ?? p.phone ?? "—",
              nationalIdStatus: p.nationalIdStatus ?? (p.confirmed ? "Verified" : "Pending"),
            });
          }
        }

        const rawEntries: Encounter[] = [];

        if (historyRes.status === "fulfilled") {
          const histData = historyRes.value.data?.data ?? historyRes.value.data ?? [];
          const arr = Array.isArray(histData) ? histData : histData._id ? [histData] : [];
          arr.forEach((r: any) => {
            const createdAt = r.createdAt ?? r.date ?? new Date().toISOString();
            rawEntries.push({
              id: `hist-${r._id}`,
              rawDate: new Date(createdAt),
              date: formatDateForPrint(createdAt),
              doctorName: r.doctorId?.fullName ?? r.doctorId?.userName ?? "Doctor",
              specialty: r.doctorId?.specialization ?? r.specialty ?? "General",
              chiefComplaint: r.chiefComplaint ?? r.complaint ?? "—",
              diagnosis: r.diagnosis ?? "—",
              clinicalNotes: r.clinicalNotes ?? r.notes ?? "—",
              documents: r.documents ?? [],
              source: 'medical-history',
              rawData: r,
              vitals: {
                bloodPressure: r.bloodPressure,
                sugarLevel: r.sugarLevel,
                pulse: r.pulse,
                temperature: r.temperature,
                height: r.height !== "-" ? r.height : undefined,
                weight: r.weight !== "-" ? r.weight : undefined,
              },
              prescriptions: (r.prescriptions ?? []).map((p: any) => ({
                medication: p.medication ?? p.name ?? "—",
                dosage: p.dosage ?? "—",
                frequency: p.frequency ?? "—",
              })),
            });
          });
        }

        if (rxRes.status === "fulfilled") {
          const rxList = rxRes.value.data?.data ?? rxRes.value.data ?? [];
          (Array.isArray(rxList) ? rxList : []).forEach((r: any) => {
            const createdAt = r.createdAt ?? new Date().toISOString();
            rawEntries.push({
              id: `rx-${r._id}`,
              rawDate: new Date(createdAt),
              date: formatDateForPrint(createdAt),
              doctorName: r.doctorId?.fullName ?? r.doctorId?.userName ?? "Doctor",
              specialty: r.doctorId?.specialization ?? "General",
              chiefComplaint: r.chiefComplaint ?? "Prescription",
              diagnosis: r.diagnosis ?? "—",
              clinicalNotes: r.notes ?? "—",
              documents: [], // RX endpoint usually doesn't have documents array attached directly
              source: 'prescription',
              rawData: r,
              prescriptions: (r.medications ?? r.prescriptions ?? []).map((p: any) => ({
                medication: p.medication ?? p.name ?? "—",
                dosage: p.dosage ?? "—",
                frequency: p.frequency ?? "—",
              })),
            });
          });
        }

        const sorted = rawEntries.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        setEncounters(sorted);
        // By default, select ONLY the latest encounter
        if (sorted.length > 0) {
          setSelectedIds([sorted[0].id]);
        } else {
          setSelectedIds([]);
        }

        const historyFailed = historyRes.status === "rejected";
        const rxFailed = rxRes.status === "rejected";

        if (!profileLoaded && historyFailed && rxFailed) {
          setError(t("errNoMedicalData"));
        } else if (!profileLoaded) {
          setError(t("errIncompleteProfile"));
        } else if (historyFailed || rxFailed) {
          setError(t("errPartialData"));
        }
      } catch {
        setError(t("errNoMedicalData"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredEncounters = encounters.filter(enc => {
    const term = searchTerm.toLowerCase();
    return (
      enc.doctorName.toLowerCase().includes(term) ||
      enc.specialty.toLowerCase().includes(term) ||
      enc.diagnosis.toLowerCase().includes(term) ||
      enc.chiefComplaint.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredEncounters.length / itemsPerPage);
  const paginatedEncounters = filteredEncounters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedEncounters = encounters.filter(e => selectedIds.includes(e.id));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Selection Mode UI ── */}
      {mode === "select" && (
        <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))]">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Link
                  href="/patient"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                >
                  <LuArrowLeft className="text-base" />
                  {t("backToDashboard")}
                </Link>
                <span className="text-[hsl(var(--color-border-strong))]">|</span>
                <div className="flex items-center gap-1.5">
                  <LuPrinter className="text-[hsl(var(--color-primary))] text-base" />
                  <span className="text-sm font-black text-[hsl(var(--color-text))]">{t("selectRecordsPrint")}</span>
                </div>
              </div>
              
              <button
                onClick={() => setMode("preview")}
                disabled={loading || !profile || selectedIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white cursor-pointer text-sm font-bold  active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("previewDocument", { count: selectedIds.length })}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[hsl(var(--color-text-muted))]">
                <LuLoader className="animate-spin text-3xl mb-3 text-[hsl(var(--color-primary))]" />
                <p className="font-bold">{t("loadingHistory")}</p>
              </div>
            ) : error && !profile ? (
              <div className="bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] p-6 rounded-2xl text-center font-bold">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-[hsl(var(--color-text))]">{t("clinicalEncounters")}</h2>
                      <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mt-0.5">{t("clinicalEncountersDesc")}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedIds(selectedIds.length === filteredEncounters.length ? [] : filteredEncounters.map(e => e.id))}
                      className="text-[11px] font-black text-[hsl(var(--color-primary))] hover:underline px-3 py-1.5 bg-[hsl(var(--color-primary)/0.1)] rounded-lg"
                    >
                      {selectedIds.length === filteredEncounters.length ? t("deselectAll") : t("selectAll")}
                    </button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <LuSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                    <input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full ps-10 pe-4 py-3 border-2 border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-base))] rounded-xl text-sm font-bold text-[hsl(var(--color-text))] focus:outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
                    />
                  </div>
                  
                  {filteredEncounters.length === 0 ? (
                    <p className="text-sm font-bold text-[hsl(var(--color-text-muted))] italic py-4 text-center">{t("noEncountersFound")}</p>
                  ) : (
                    <div className="space-y-6">
                      {paginatedEncounters.map(enc => (
                        <div key={enc.id} className="flex items-start gap-4 md:gap-8">
                          {/* Checkbox Container */}
                          <div 
                             onClick={() => toggleSelection(enc.id)}
                             className={`mt-6 shrink-0 flex items-center justify-center w-6 h-6 rounded-md border-2 cursor-pointer transition-colors ${selectedIds.includes(enc.id) ? 'bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white' : 'border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-bg-base))] hover:border-[hsl(var(--color-border))]'}`}
                          >
                            {selectedIds.includes(enc.id) && <LuCheck className="text-base" />}
                          </div>
                          
                          {/* Timeline Card Container */}
                          <div className="flex-1 min-w-0 ps-5 md:pl-9 border-s-2 border-[hsl(var(--color-border-soft))] relative">
                            <TimelineCard entry={{
                              id: enc.id,
                              rawDate: enc.rawDate,
                              date: enc.date,
                              doctorName: enc.doctorName,
                              specialty: enc.specialty,
                              diagnosis: enc.diagnosis,
                              chiefComplaint: enc.chiefComplaint,
                              prescriptions: enc.prescriptions || [],
                              clinicalNotes: enc.clinicalNotes || "",
                              rawRecord: enc.rawData
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8 border-t border-[hsl(var(--color-border-soft))] pt-6">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border-2 border-[hsl(var(--color-border-soft))] disabled:opacity-50 hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] cursor-pointer"
                      >
                        <LuChevronLeft />
                      </button>
                      <span className="text-sm font-black text-[hsl(var(--color-text))]">
                        {t("pageOf", { current: currentPage, total: totalPages })}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border-2 border-[hsl(var(--color-border-soft))] disabled:opacity-50 hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] cursor-pointer"
                      >
                        <LuChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Preview / Print Mode UI ── */}
      {mode === "preview" && profile && (
        <>
          {/* Action Header for Preview */}
          <div className="print:hidden sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border-soft))]">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => setMode("select")}
                className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors cursor-pointer"
              >
                <LuArrowLeft className="text-base" />
                {t("backToSelection")}
              </button>
              
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white text-sm font-bold  active:scale-95 transition-all animate-fade-in cursor-pointer"
              >
                <LuPrinter className="text-base animate-pulse" />
                {t("printDocument")}
              </button>
            </div>
          </div>

          <div
            id="printable-record"
            className="
              max-w-4xl mx-auto px-6 md:px-10 py-10
              print:px-8 print:py-6 print:max-w-none print:mx-0
              print:bg-[hsl(var(--color-bg-surface))] print:text-[hsl(var(--color-text))]
              font-sans text-[hsl(var(--color-text))]
            "
          >
            {/* ════════════════════════════════════════════
                PAGE 1: PROFILE SUMMARY
                ════════════════════════════════════════════ */}
            <div className="page-break-after">
              <header className="flex items-start justify-between border-b-2 border-[hsl(var(--color-border))] pb-5 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div 
                      className="w-9 h-9 rounded-lg bg-[hsl(var(--color-primary))] flex items-center justify-center text-white font-black text-lg -[0_4px_12px_hsl(var(--color-primary)/0.35)]"
                      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
                    >
                      +
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--color-text))]">
                      Care<span className="text-[hsl(var(--color-primary))]">Hub</span>
                    </h1>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] ps-12">
                    {t("patientMedicalProfile")}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
                    {t("documentDate")}
                  </p>
                  <p className="text-sm font-black text-[hsl(var(--color-text))] mt-0.5">
                    {printedAt}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1 font-semibold uppercase tracking-wider">
                    {t("hipaaCompliant")}
                  </p>
                </div>
              </header>

              <section className="mb-8 print:break-inside-avoid">
                <SectionTitle icon={<LuUser />} label={t("patientIdentity")} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[hsl(var(--color-border))]">
                  <InfoCell label={t("fullName")} value={profile.fullName} wide />
                  <InfoCell label={t("age")} value={profile.age.toString()} />
                  <InfoCell label={t("gender")} value={profile.gender} />
                  <InfoCell label={t("bloodGroup")} value={profile.bloodType} highlight />
                  <InfoCell label={t("phone")} value={profile.phoneNumber} />
                </div>
              </section>

              <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
              <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
                <div className="border-2 border-[hsl(var(--color-border))] p-4 print:break-inside-avoid">
                  <SectionTitle icon={<LuActivity />} label={t("chronicDiseases")} />
                  {profile.chronicDiseases.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--color-text-muted))] italic">{t("noneRecorded")}</p>
                  ) : (
                    <ul className="space-y-1.5 mt-1">
                      {profile.chronicDiseases.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--color-text))]">
                          <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-text))] shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-2 border-[hsl(var(--color-border))] p-4 print:break-inside-avoid">
                  <SectionTitle icon={<LuShieldAlert />} label={t("knownAllergies")} />
                  {profile.allergies.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--color-text-muted))] italic">{t("noAllergies")}</p>
                  ) : (
                    <ul className="space-y-1.5 mt-1">
                      {profile.allergies.map((a) => (
                        <li key={a} className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--color-text))]">
                          <span className="text-base">⚠</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <footer className="border-t-2 border-[hsl(var(--color-border))] pt-5 flex items-end justify-between mt-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))]">{t("systemProfile")}</p>
                </div>
              </footer>
            </div>

            {/* ════════════════════════════════════════════
                SUBSEQUENT PAGES: SELECTED ENCOUNTERS
                ════════════════════════════════════════════ */}
            {selectedEncounters.map((enc, idx) => {
              const isLastEncounter = idx === selectedEncounters.length - 1;
              const hasImages = enc.documents.some(doc => isImage(doc.secure_url));
              const needsBreakAfterEncounter = !isLastEncounter || hasImages;

              return (
                <div key={enc.id}>
                  <div className={needsBreakAfterEncounter ? "page-break-after" : ""}>
                    <header className="flex items-start justify-between border-b-2 border-[hsl(var(--color-border))] pb-3 mb-6">
                      <h2 className="text-xl font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                        <LuFileText className="text-[hsl(var(--color-primary))]" /> {t("clinicalEncounter")}
                      </h2>
                      <p className="text-sm font-black text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-soft))] px-3 py-1 rounded">
                        {enc.date}
                      </p>
                    </header>

                    <EncounterCard encounter={enc} index={idx + 1} />

                    <footer className="border-t border-[hsl(var(--color-border))] pt-3 flex items-end justify-between mt-10">
                      <div>
                        <p className="text-[9px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-widest">{t("encounterHash", { index: idx + 1 })}</p>
                      </div>
                      <div className="text-end">
                        <div className="border-b border-[hsl(var(--color-border-soft))] w-48 mb-1" />
                        <p className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("authorizedSignature")}</p>
                      </div>
                    </footer>
                  </div>

                  {/* Print Attachments if Image */}
                  {enc.documents.map((doc, docIdx) => {
                    if (isImage(doc.secure_url)) {
                      const imageDocs = enc.documents.filter(d => isImage(d.secure_url));
                      const isLastImage = imageDocs[imageDocs.length - 1] === doc;
                      const needsBreakAfterImage = !(isLastEncounter && isLastImage);

                      return (
                        <div key={`${enc.id}-doc-${docIdx}`} className={`${needsBreakAfterImage ? "page-break-after" : ""} pt-10 flex flex-col items-center`}>
                          <h2 className="text-lg font-black text-[hsl(var(--color-text))] mb-4 w-full border-b border-[hsl(var(--color-border))] pb-2 text-center uppercase">
                            {t("attachmentTitle", { title: doc.title || t("scanResult") })}
                          </h2>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <Image 
                            src={doc.secure_url} 
                            alt={doc.title || "Medical Document"} 
                            width={800}
                            height={800}
                            className="max-w-full h-auto max-h-[800px] object-contain border border-[hsl(var(--color-border-soft))]"
                            unoptimized
                          />
                          <p className="text-[10px] text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-widest mt-4">{t("attachedToEncounter", { date: enc.date })}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/*
        ════════════════════════════════════════════
        PRINT CSS
        ════════════════════════════════════════════
      */}
      <style>{`
        .page-break-after {
          page-break-after: always;
          break-after: page;
          padding-top: 1rem;
        }

        @media print {
          /* Hide non-printable layout elements */
          aside,
          #sidebar-toggle,
          .print\:hidden,
          header.print\:hidden {
            display: none !important;
          }

          /* Force all scrollable/flex containers to block/visible to allow pagination */
          html, body, #__next, body > div, main, 
          #dashboard-shell-root, #dashboard-shell-main {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            : none !important;
          }

          #printable-record, #printable-record * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            margin: 15mm 12mm;
            size: A4;
          }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-3">
      <span className="text-sm">{icon}</span>
      {label}
    </h2>
  );
}

function InfoCell({
  label,
  value,
  wide,
  highlight,
}: {
  label: string;
  value: string;
  wide?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        p-3 border-e border-b border-[hsl(var(--color-border-soft))] last:border-r-0
        ${wide ? "col-span-2" : ""}
        ${highlight ? "bg-[hsl(var(--color-text))] text-white" : "bg-[hsl(var(--color-bg-surface))]"}
      `}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
          highlight ? "text-gray-300" : "text-[hsl(var(--color-text-muted))]"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-bold ${
          highlight ? "text-white text-xl font-black" : "text-[hsl(var(--color-text))]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EncounterCard({ encounter: enc, index }: { encounter: Encounter; index: number }) {
  const t = useTranslations("patient.PatientPrintRecordPage");
  return (
    <div className="border border-[hsl(var(--color-border-soft))] rounded-lg overflow-hidden bg-[hsl(var(--color-bg-surface))]">
      {/* ── Header ── */}
      <div className="border-b border-[hsl(var(--color-border-soft))] px-6 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[hsl(var(--color-text))]">
            <LuStethoscope className="text-xl text-[hsl(var(--color-primary))]" />
            <h3 className="text-lg font-black">{enc.doctorName}</h3>
          </div>
          <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-widest mt-1 ms-7">
            {enc.specialty}
          </p>
        </div>
        <div className="text-end">
          <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-widest">{t("encounterDate")}</p>
          <p className="text-sm font-black text-[hsl(var(--color-text))]">{enc.date}</p>
        </div>
      </div>

      {/* ── Vitals Strip ── */}
      <div className="bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border-soft))] px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-[11px]">
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("bp")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.bloodPressure || "____ / ____"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("sugar")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.sugarLevel || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("pulse")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.pulse || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("temp")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.temperature || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("wt")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.weight || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold">{t("ht")}</span> <span className="font-black text-[hsl(var(--color-text))]">{enc.vitals?.height || "______"}</span></div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* ── Left Column: Clinical Info ── */}
        <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-[hsl(var(--color-border-soft))] space-y-5">
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1">
              {t("chiefComplaint")}
            </p>
            <p className="text-sm font-bold text-[hsl(var(--color-text))] leading-relaxed">
              {enc.chiefComplaint}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-primary))] mb-1">
              {t("clinicalDiagnosis")}
            </p>
            <p className="text-sm font-black text-[hsl(var(--color-text))] border-s-2 border-[hsl(var(--color-primary))] ps-3 py-0.5">
              {enc.diagnosis}
            </p>
          </div>

          {(enc.clinicalNotes && enc.clinicalNotes !== "—") && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1">
                {t("consultationNotes")}
              </p>
              <p className="text-[11px] text-[hsl(var(--color-text))] leading-relaxed">
                {enc.clinicalNotes}
              </p>
            </div>
          )}
        </div>

        {/* ── Right Column: Prescriptions (Rx) ── */}
        <div className="p-6 md:w-1/2 bg-[hsl(var(--color-bg-surface))] relative">
          <div className="absolute top-4 end-6 text-4xl font-serif text-gray-200 select-none">
            Rx
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-4 border-b border-[hsl(var(--color-border-soft))] pb-2 relative z-10">
            {t("medicationPlan")}
          </p>
          
          {enc.prescriptions.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] italic">{t("noMedications")}</p>
          ) : (
            <ul className="space-y-4 relative z-10">
              {enc.prescriptions.map((rx, ri) => (
                <li key={ri} className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-black text-[hsl(var(--color-text))] leading-tight">
                      {ri + 1}. {rx.medication}
                    </p>
                    <span className="text-[10px] font-black whitespace-nowrap bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] px-2 py-0.5 rounded">
                      {rx.frequency}
                    </span>
                  </div>
                  {rx.dosage && rx.dosage !== "—" && (
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] ms-4">
                      <span className="text-[hsl(var(--color-text-muted))] me-1">{t("dosage")}</span> {rx.dosage}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
