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
import TimelineCard from "@/components/patients/TimelineCard";

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
      setError("Patient identity not found.");
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
          setError("Could not load medical record data. Please try again.");
        } else if (!profileLoaded) {
          setError("Could not load patient profile. Some sections may be incomplete.");
        } else if (historyFailed || rxFailed) {
          setError("Some clinical records could not be loaded. Displaying available data.");
        }
      } catch {
        setError("Could not load medical record data. Please try again.");
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
          <div className="sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] shadow-sm">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Link
                  href="/patient"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                >
                  <LuArrowLeft className="text-base" />
                  Back to Dashboard
                </Link>
                <span className="text-[hsl(var(--color-border-strong))]">|</span>
                <div className="flex items-center gap-1.5">
                  <LuPrinter className="text-[hsl(var(--color-primary))] text-base" />
                  <span className="text-sm font-black text-[hsl(var(--color-text))]">Select Records to Print</span>
                </div>
              </div>
              
              <button
                onClick={() => setMode("preview")}
                disabled={loading || !profile || selectedIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-sm font-bold shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Document ({selectedIds.length})
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[hsl(var(--color-text-muted))]">
                <LuLoader className="animate-spin text-3xl mb-3 text-[hsl(var(--color-primary))]" />
                <p className="font-bold">Loading medical history...</p>
              </div>
            ) : error && !profile ? (
              <div className="bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] p-6 rounded-2xl text-center font-bold">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-[hsl(var(--color-text))]">Clinical Encounters</h2>
                      <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mt-0.5">Select the encounters you wish to include in the printed report.</p>
                    </div>
                    <button 
                      onClick={() => setSelectedIds(selectedIds.length === filteredEncounters.length ? [] : filteredEncounters.map(e => e.id))}
                      className="text-[11px] font-black text-[hsl(var(--color-primary))] hover:underline px-3 py-1.5 bg-[hsl(var(--color-primary)/0.1)] rounded-lg"
                    >
                      {selectedIds.length === filteredEncounters.length ? "Deselect All Visible" : "Select All Visible"}
                    </button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                    <input
                      type="text"
                      placeholder="Search by doctor, specialty, diagnosis, or complaint..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-base))] rounded-xl text-sm font-bold text-[hsl(var(--color-text))] focus:outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
                    />
                  </div>
                  
                  {filteredEncounters.length === 0 ? (
                    <p className="text-sm font-bold text-[hsl(var(--color-text-muted))] italic py-4 text-center">No encounters found matching your search.</p>
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
                          <div className="flex-1 min-w-0 pl-5 md:pl-9 border-l-2 border-[hsl(var(--color-border-soft))] relative">
                            <TimelineCard entry={{
                              id: enc.id,
                              date: enc.date,
                              doctorName: enc.doctorName,
                              specialty: enc.specialty,
                              diagnosis: enc.diagnosis,
                              chiefComplaint: enc.chiefComplaint,
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
                        className="p-2 rounded-xl border-2 border-[hsl(var(--color-border-soft))] disabled:opacity-50 hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]"
                      >
                        <LuChevronLeft />
                      </button>
                      <span className="text-sm font-black text-[hsl(var(--color-text))]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border-2 border-[hsl(var(--color-border-soft))] disabled:opacity-50 hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]"
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
          <div className="print:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => setMode("select")}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                <LuArrowLeft className="text-base" />
                Back to Selection
              </button>
              
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-doctor text-white text-sm font-bold shadow hover:opacity-90 active:scale-95 transition-all animate-fade-in"
              >
                <LuPrinter className="text-base animate-pulse" />
                Print Document
              </button>
            </div>
          </div>

          <div
            id="printable-record"
            className="
              max-w-4xl mx-auto px-6 md:px-10 py-10
              print:px-8 print:py-6 print:max-w-none print:mx-0
              print:bg-white print:text-black
              font-sans text-gray-900
            "
          >
            {/* ════════════════════════════════════════════
                PAGE 1: PROFILE SUMMARY
                ════════════════════════════════════════════ */}
            <div className="page-break-after">
              <header className="flex items-start justify-between border-b-2 border-black pb-5 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div 
                      className="w-9 h-9 rounded-lg bg-[hsl(var(--color-primary))] flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_hsl(var(--color-primary)/0.35)]"
                      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
                    >
                      +
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">
                      Care<span className="text-[hsl(var(--color-primary))]">Hub</span>
                    </h1>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-12">
                    Patient Medical Profile
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Document Date
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {printedAt}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">
                    HIPAA Compliant · Confidential
                  </p>
                </div>
              </header>

              <section className="mb-8 print:break-inside-avoid">
                <SectionTitle icon={<LuUser />} label="Patient Identity" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black">
                  <InfoCell label="Full Name" value={profile.fullName} wide />
                  <InfoCell label="Age" value={`${profile.age} years`} />
                  <InfoCell label="Gender" value={profile.gender} />
                  <InfoCell label="Blood Group" value={profile.bloodType} highlight />
                  <InfoCell label="Phone" value={profile.phoneNumber} />
                </div>
              </section>

              <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
                <div className="border-2 border-black p-4 print:break-inside-avoid">
                  <SectionTitle icon={<LuActivity />} label="Chronic Diseases" />
                  {profile.chronicDiseases.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">None recorded</p>
                  ) : (
                    <ul className="space-y-1.5 mt-1">
                      {profile.chronicDiseases.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <span className="w-2 h-2 rounded-full bg-gray-800 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-2 border-black p-4 print:break-inside-avoid">
                  <SectionTitle icon={<LuShieldAlert />} label="Known Allergies" />
                  {profile.allergies.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No allergies on file</p>
                  ) : (
                    <ul className="space-y-1.5 mt-1">
                      {profile.allergies.map((a) => (
                        <li key={a} className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <span className="text-base">⚠</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <footer className="border-t-2 border-black pt-5 flex items-end justify-between mt-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">CareHub Medical System · Profile</p>
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
                    <header className="flex items-start justify-between border-b-2 border-black pb-3 mb-6">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <LuFileText className="text-[hsl(var(--color-primary))]" /> Clinical Encounter
                      </h2>
                      <p className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded">
                        {enc.date}
                      </p>
                    </header>

                    <EncounterCard encounter={enc} index={idx + 1} />

                    <footer className="border-t border-black pt-3 flex items-end justify-between mt-10">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">CareHub System · Encounter #{idx + 1}</p>
                      </div>
                      <div className="text-right">
                        <div className="border-b border-gray-400 w-48 mb-1" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Authorized Signature</p>
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
                          <h2 className="text-lg font-black text-gray-900 mb-4 w-full border-b border-black pb-2 text-center uppercase">
                            Attachment: {doc.title || "Scan / Result"}
                          </h2>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={doc.secure_url} 
                            alt={doc.title || "Medical Document"} 
                            className="max-w-full max-h-[800px] object-contain border border-gray-300"
                          />
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Attached to Encounter on {enc.date}</p>
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
            box-shadow: none !important;
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
    <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
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
        p-3 border-r border-b border-gray-300 last:border-r-0
        ${wide ? "col-span-2" : ""}
        ${highlight ? "bg-gray-900 text-white" : "bg-white"}
      `}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
          highlight ? "text-gray-300" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-bold ${
          highlight ? "text-white text-xl font-black" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EncounterCard({ encounter: enc, index }: { encounter: Encounter; index: number }) {
  return (
    <div className="border border-gray-400 rounded-lg overflow-hidden bg-white">
      {/* ── Header ── */}
      <div className="border-b border-gray-400 px-6 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <LuStethoscope className="text-xl text-[hsl(var(--color-primary))]" />
            <h3 className="text-lg font-black">{enc.doctorName}</h3>
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1 ml-7">
            {enc.specialty}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Encounter Date</p>
          <p className="text-sm font-black text-gray-900">{enc.date}</p>
        </div>
      </div>

      {/* ── Vitals Strip ── */}
      <div className="bg-gray-50 border-b border-gray-400 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-[11px]">
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">BP:</span> <span className="font-black text-gray-900">{enc.vitals?.bloodPressure || "____ / ____"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">Sugar:</span> <span className="font-black text-gray-900">{enc.vitals?.sugarLevel || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">Pulse:</span> <span className="font-black text-gray-900">{enc.vitals?.pulse || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">Temp:</span> <span className="font-black text-gray-900">{enc.vitals?.temperature || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">Wt:</span> <span className="font-black text-gray-900">{enc.vitals?.weight || "______"}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-gray-500 uppercase tracking-wider font-bold">Ht:</span> <span className="font-black text-gray-900">{enc.vitals?.height || "______"}</span></div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* ── Left Column: Clinical Info ── */}
        <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-400 space-y-5">
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Chief Complaint
            </p>
            <p className="text-sm font-bold text-gray-900 leading-relaxed">
              {enc.chiefComplaint}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-primary))] mb-1">
              Clinical Diagnosis
            </p>
            <p className="text-sm font-black text-gray-900 border-l-2 border-[hsl(var(--color-primary))] pl-3 py-0.5">
              {enc.diagnosis}
            </p>
          </div>

          {(enc.clinicalNotes && enc.clinicalNotes !== "—") && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Consultation Notes
              </p>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {enc.clinicalNotes}
              </p>
            </div>
          )}
        </div>

        {/* ── Right Column: Prescriptions (Rx) ── */}
        <div className="p-6 md:w-1/2 bg-white relative">
          <div className="absolute top-4 right-6 text-4xl font-serif text-gray-200 select-none">
            Rx
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2 relative z-10">
            Medication Plan
          </p>
          
          {enc.prescriptions.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">No medications prescribed.</p>
          ) : (
            <ul className="space-y-4 relative z-10">
              {enc.prescriptions.map((rx, ri) => (
                <li key={ri} className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-black text-gray-900 leading-tight">
                      {ri + 1}. {rx.medication}
                    </p>
                    <span className="text-[10px] font-black whitespace-nowrap bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {rx.frequency}
                    </span>
                  </div>
                  {rx.dosage && rx.dosage !== "—" && (
                    <p className="text-[11px] font-semibold text-gray-600 ml-4">
                      <span className="text-gray-400 mr-1">Dosage:</span> {rx.dosage}
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
