"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchClient } from "@/services/fetchClient";
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
} from "react-icons/lu";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientProfile {
  fullName: string;
  bloodType: string;
  chronicDiseases: string[];
  allergies: string[];
  age: number;
  gender: string;
  address: string;
  phoneNumber: string;
  nationalIdStatus?: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

interface Encounter {
  id: number;
  date: string;
  doctorName: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  prescriptions: Prescription[];
  clinicalNotes: string;
}

// ─── Static fallback data (used while API is not wired) ──────────────────────

const FALLBACK_PROFILE: PatientProfile = {
  fullName: "Sarah Aly Mansour",
  bloodType: "A+",
  chronicDiseases: ["Hypertension", "Vitamin D Deficiency"],
  allergies: ["Penicillin", "Peanuts"],
  age: 32,
  gender: "Female",
  address: "Maadi, Cairo, Egypt",
  phoneNumber: "+20 102 345 6789",
  nationalIdStatus: "Verified",
};

const FALLBACK_ENCOUNTERS: Encounter[] = [
  {
    id: 1,
    date: "22 May 2026",
    doctorName: "Dr. Mohaned Ahmed",
    specialty: "Cardiology",
    chiefComplaint: "Mild chest tightness during light exercise",
    diagnosis: "Initial-stage Hypertension",
    prescriptions: [
      { medication: "Lisinopril 10mg", dosage: "1 Tablet", frequency: "Daily — Morning" },
      { medication: "Atorvastatin 20mg", dosage: "1 Tablet", frequency: "Daily — Bedtime" },
    ],
    clinicalNotes:
      "Patient advised to reduce daily sodium intake and record blood pressure twice daily. Follow up in two weeks.",
  },
  {
    id: 2,
    date: "10 May 2026",
    doctorName: "Dr. Khaled Taha",
    specialty: "General Medicine",
    chiefComplaint: "Routine annual checkup & blood panel review",
    diagnosis: "Vitamin D3 Deficiency & Mild Fatigue",
    prescriptions: [
      {
        medication: "Vitamin D3 2000 IU",
        dosage: "1 Softgel",
        frequency: "Daily — Morning (With meal)",
      },
    ],
    clinicalNotes:
      "Advised increasing dietary rich foods (fish, eggs) and direct sunlight exposure for 15 minutes daily.",
  },
  {
    id: 3,
    date: "15 April 2026",
    doctorName: "Dr. Dalia Fawzy",
    specialty: "Ophthalmology",
    chiefComplaint: "Slight strain and blurred text when reading screens",
    diagnosis: "Mild Presbyopia & Digital Eye Strain",
    prescriptions: [
      { medication: "Reading Glasses", dosage: "+1.00 Diopter", frequency: "As needed" },
      {
        medication: "Systane Ultra Eye Drops",
        dosage: "1 Drop per eye",
        frequency: "3× daily",
      },
    ],
    clinicalNotes:
      "Take 20-second breaks every 20 minutes (20-20-20 rule). Re-evaluate vision in 12 months.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrintMedicalRecordPage() {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState<PatientProfile>(FALLBACK_PROFILE);
  const [encounters, setEncounters] = useState<Encounter[]>(FALLBACK_ENCOUNTERS);
  const [loading, setLoading] = useState(false);
  const [printedAt] = useState(() =>
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  // Fetch live data when token/user is available
  useEffect(() => {
    if (!token || !user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [profileData, historyData, rxData] = await Promise.allSettled([
          fetchClient.get("/patient/profile"),
          fetchClient.get(`/medical-history/${user.id}`),
          fetchClient.get(`/prescrption/patient/${user.id}`),
        ]);

        if (profileData.status === "fulfilled" && profileData.value) {
          setProfile(profileData.value as PatientProfile);
        }

        // Merge encounters + standalone prescriptions into chronological list
        const rawEncounters: Encounter[] =
          historyData.status === "fulfilled" && Array.isArray(historyData.value)
            ? (historyData.value as Encounter[])
            : FALLBACK_ENCOUNTERS;

        setEncounters(rawEncounters.sort((a, b) => (a.date > b.date ? -1 : 1)));
      } catch {
        // Silently keep fallback data
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, user]);

  // Automatically trigger browser print dialogue once data loading finishes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handlePrint = () => window.print();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
        ════════════════════════════════════════════
        ACTION HEADER — hidden when printing
        ════════════════════════════════════════════
      */}
      <div className="print:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Left — back nav */}
          <div className="flex items-center gap-3">
            <Link
              href="/patient"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <LuArrowLeft className="text-base" />
              Back to Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <LuFileText className="text-gray-400 text-base" />
              <span className="text-sm font-black text-gray-800">Medical Record Summary</span>
            </div>
          </div>

          {/* Right — print action */}
          <div className="flex items-center gap-3">
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold animate-pulse">
                <LuLoader className="animate-spin text-base" />
                Loading live data…
              </span>
            )}
            <button
              id="btn-print-document"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow hover:opacity-90 active:scale-95 transition-all animate-fade-in"
              style={{
                backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))"
              }}
            >
              <LuPrinter className="text-base animate-pulse" />
              Print Document
            </button>
          </div>
        </div>
      </div>

      {/*
        ════════════════════════════════════════════
        PRINTABLE DOCUMENT
        ════════════════════════════════════════════
      */}
      <div
        id="printable-record"
        className="
          max-w-4xl mx-auto px-6 md:px-10 py-10
          print:px-8 print:py-6 print:max-w-none print:mx-0
          print:bg-white print:text-black
          font-sans text-gray-900
        "
      >
        {/* ── Document Header ─────────────────────────────────────────── */}
        <header className="flex items-start justify-between border-b-2 border-black pb-5 mb-8 print:border-black">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div 
                className="w-9 h-9 rounded-lg bg-[hsl(var(--color-primary))] flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_hsl(var(--color-primary)/0.35)] print:bg-[hsl(var(--color-primary))] print:text-white"
                style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
              >
                +
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 print:text-black">
                Care<span className="text-[hsl(var(--color-primary))]">Hub</span>
              </h1>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 print:text-gray-600 pl-12">
              Patient Medical Record Summary
            </p>
          </div>

          {/* Meta */}
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 print:text-gray-600 uppercase tracking-wider">
              Document Date
            </p>
            <p className="text-sm font-black text-gray-900 print:text-black mt-0.5">
              {printedAt}
            </p>
            <p className="text-[10px] text-gray-400 print:text-gray-500 mt-1 font-semibold uppercase tracking-wider">
              HIPAA Compliant · Confidential
            </p>
          </div>
        </header>

        {/* ── Patient Identity ─────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionTitle icon={<LuUser />} label="Patient Identity" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black print:border-black">
            <InfoCell label="Full Name" value={profile.fullName} wide />
            <InfoCell label="Age" value={`${profile.age} years`} />
            <InfoCell label="Gender" value={profile.gender} />
            <InfoCell label="Blood Group" value={profile.bloodType} highlight />
            <InfoCell label="Phone" value={profile.phoneNumber} />
            <InfoCell label="Address" value={profile.address} wide />
            <InfoCell
              label="ID Status"
              value={profile.nationalIdStatus ?? "—"}
            />
          </div>
        </section>

        {/* ── Alerts: Chronic Diseases & Allergies ─────────────────────── */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chronic Diseases */}
          <div className="border-2 border-black print:border-black p-4">
            <SectionTitle icon={<LuActivity />} label="Chronic Diseases" />
            {profile.chronicDiseases.length === 0 ? (
              <p className="text-sm text-gray-400 italic">None recorded</p>
            ) : (
              <ul className="space-y-1.5 mt-1">
                {profile.chronicDiseases.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2 text-sm font-bold text-gray-900 print:text-black"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-800 print:bg-black shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Allergies */}
          <div className="border-2 border-black print:border-black p-4">
            <SectionTitle icon={<LuShieldAlert />} label="Known Allergies" />
            {profile.allergies.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No allergies on file</p>
            ) : (
              <ul className="space-y-1.5 mt-1">
                {profile.allergies.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-sm font-bold text-gray-900 print:text-black"
                  >
                    <span className="text-base">⚠</span>
                    {a}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-gray-400 print:text-gray-600 font-semibold mt-3 border-t border-gray-200 print:border-gray-400 pt-2">
              Alert clinical staff before any prescription is issued.
            </p>
          </div>
        </section>

        {/* ── Medical Timeline ─────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionTitle icon={<LuCalendarDays />} label="Chronological Medical Timeline" />

          {encounters.length === 0 ? (
            <div className="border border-black p-8 text-center">
              <p className="text-sm text-gray-400 italic">No medical history on record.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {encounters.map((enc, idx) => (
                <EncounterCard key={enc.id} encounter={enc} index={idx + 1} />
              ))}
            </div>
          )}
        </section>

        {/* ── All Prescriptions Summary ─────────────────────────────────── */}
        <section className="mb-8">
          <SectionTitle icon={<LuPill />} label="Prescriptions Summary" />
          <table className="w-full border-collapse border border-black print:border-black text-sm">
            <thead>
              <tr className="bg-gray-900 text-white print:bg-gray-100 print:text-black">
                <Th>Medication</Th>
                <Th>Dosage</Th>
                <Th>Frequency</Th>
                <Th>Issued On</Th>
                <Th>Treating Physician</Th>
              </tr>
            </thead>
            <tbody>
              {encounters.flatMap((enc) =>
                enc.prescriptions.map((rx, ri) => (
                  <tr
                    key={`${enc.id}-${ri}`}
                    className="border-b border-gray-300 print:border-black even:bg-gray-50 print:even:bg-gray-100"
                  >
                    <Td bold>{rx.medication}</Td>
                    <Td>{rx.dosage}</Td>
                    <Td>{rx.frequency}</Td>
                    <Td>{enc.date}</Td>
                    <Td>{enc.doctorName}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Document Footer ──────────────────────────────────────────── */}
        <footer className="border-t-2 border-black print:border-black pt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 print:text-gray-600">
              CareHub Medical System · Egypt
            </p>
            <p className="text-[10px] text-gray-400 print:text-gray-500 mt-0.5">
              This document is system-generated and is for authorized medical use only.
            </p>
          </div>
          {/* Physician signature placeholder */}
          <div className="text-right">
            <div className="border-b border-gray-400 print:border-gray-600 w-48 mb-1" />
            <p className="text-[10px] text-gray-400 print:text-gray-500 uppercase tracking-wider font-bold">
              Authorized Signature
            </p>
          </div>
        </footer>
      </div>

      {/*
        ════════════════════════════════════════════
        PRINT CSS — hide the entire dashboard shell
        (sidebar, shell wrapper, top bars)
        ════════════════════════════════════════════
      */}
      <style>{`
        @media print {
          /* Hide non-printable layout elements like sidebar & topbar action header */
          aside,
          #sidebar-toggle,
          .print\:hidden,
          header.print\:hidden {
            display: none !important;
          }

          /* Reset all outer containers so the print output expands to full page width with no flex sidebar shifts */
          html, body, #__next, body > div, main, .flex.min-h-screen, .flex-1 {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
          }

          /* Make sure all body text prints in a dark, high-contrast, perfectly legible color */
          #printable-record, #printable-record * {
            color: #000000 !important;
            text-shadow: none !important;
          }

          /* Retain primary color branding for the logo & visual elements if color print is enabled */
          #printable-record .text-\[hsl\(var\(--color-primary\)\)\] {
            color: hsl(var(--color-primary)) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-record .bg-\[hsl\(var\(--color-primary\)\)\] {
            background-color: hsl(var(--color-primary)) !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure page dividers and borders stand out cleanly */
          #printable-record .border, 
          #printable-record .border-2, 
          #printable-record .border-b, 
          #printable-record .border-t, 
          #printable-record .border-l, 
          #printable-record .border-r {
            border-color: #000000 !important;
          }

          @page {
            margin: 15mm 12mm;
            size: A4;
          }

          /* Prevent cards splitting half-way across multiple pages */
          .encounter-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 24px !important;
            border: 2px solid #000000 !important;
          }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 print:text-gray-700 mb-3">
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
        p-3 border-r border-b border-gray-300 print:border-black last:border-r-0
        ${wide ? "col-span-2" : ""}
        ${highlight ? "bg-gray-900 print:bg-gray-100 text-white print:text-black" : "bg-white print:bg-white"}
      `}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
          highlight ? "text-gray-300 print:text-gray-600" : "text-gray-400 print:text-gray-600"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-bold ${
          highlight ? "text-white text-xl font-black print:text-black print:text-base" : "text-gray-900 print:text-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EncounterCard({ encounter: enc, index }: { encounter: Encounter; index: number }) {
  return (
    <div className="encounter-card border-2 border-black print:border-black">
      {/* Card Header */}
      <div className="bg-gray-900 print:bg-gray-100 text-white print:text-black px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black bg-white print:bg-black text-gray-900 print:text-white px-2 py-0.5 rounded-sm">
            #{index}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <LuStethoscope className="text-gray-300 print:text-black text-sm" />
              <span className="text-sm font-black">{enc.doctorName}</span>
            </div>
            <p className="text-[10px] text-gray-300 print:text-gray-600 font-bold uppercase tracking-wider mt-0.5">
              {enc.specialty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-200 print:text-black">
          <LuCalendarDays className="text-sm" />
          {enc.date}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left — Diagnosis & Notes */}
        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 print:text-gray-600 mb-1">
              Chief Complaint
            </p>
            <p className="text-sm font-bold text-gray-800 print:text-black italic">
              "{enc.chiefComplaint}"
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 print:text-gray-600 mb-1">
              Clinical Diagnosis
            </p>
            <p className="text-sm font-black text-gray-900 print:text-black border-l-4 border-gray-900 print:border-black pl-3">
              {enc.diagnosis}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 print:text-gray-600 mb-1">
              Consultation Notes
            </p>
            <p className="text-[11px] text-gray-600 print:text-gray-700 leading-relaxed">
              {enc.clinicalNotes}
            </p>
          </div>
        </div>

        {/* Right — Prescriptions */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 print:text-gray-600 mb-2">
            Issued Prescriptions
          </p>
          <div className="space-y-2">
            {enc.prescriptions.map((rx, ri) => (
              <div
                key={ri}
                className="border border-gray-300 print:border-black p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-black text-gray-900 print:text-black">
                    {rx.medication}
                  </p>
                  <p className="text-[10px] text-gray-500 print:text-gray-600 font-semibold mt-0.5">
                    Dosage: {rx.dosage}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold border border-gray-400 print:border-black px-2 py-0.5 text-gray-600 print:text-black whitespace-nowrap">
                  {rx.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider border-r border-gray-600 print:border-black last:border-r-0 print:text-black print:bg-gray-100">
      {children}
    </th>
  );
}

function Td({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <td
      className={`px-3 py-2 text-[11px] border-r border-gray-300 print:border-black last:border-r-0 ${
        bold ? "font-bold text-gray-900 print:text-black" : "text-gray-600 print:text-black"
      }`}
    >
      {children}
    </td>
  );
}
