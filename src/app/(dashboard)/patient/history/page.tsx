"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuClipboardList, LuStethoscope, LuCalendar, LuChevronDown, LuChevronUp,
  LuFileText, LuHistory, LuPill, LuSearch, LuShieldAlert, LuActivity,
  LuScissors, LuHeartPulse, LuThermometer, LuDroplets, LuWeight,
  LuRuler, LuFlame, LuX, LuExternalLink, LuImage
} from "react-icons/lu";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import EmptyState from "@/components/appointments/EmptyState";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import DashboardHeader from "@/components/global/DashboardHeader";
import VisitCard from '@/components/shared/VisitCard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
          <div className="flex gap-4 p-5">
            <div className="w-1 rounded-full bg-[hsl(var(--color-border))] self-stretch shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-[hsl(var(--color-border))] rounded-full w-24 mb-3" />
              <div className="h-4 bg-[hsl(var(--color-border))] rounded-full w-48 mb-2" />
              <div className="h-3 bg-[hsl(var(--color-border))] rounded-full w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ─── Health Snapshot Banner ─────────────────────────────────────────────── */
function HealthSnapshot({ allergies, chronicDiseases, surgeries }: {
  allergies: string[]; chronicDiseases: string[]; surgeries: string[];
}) {
  const hasAny = allergies.length > 0 || chronicDiseases.length > 0 || surgeries.length > 0;
  if (!hasAny) return null;

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 overflow-x-auto">
      <div className="flex flex-nowrap sm:flex-wrap gap-2 items-center min-w-max sm:min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] shrink-0 pr-2 border-r border-[hsl(var(--color-border))]">
          Health alerts
        </span>

        {allergies.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] border border-[hsl(var(--color-danger)/0.2)]">
            <LuShieldAlert className="text-[11px]" /> {a}
          </span>
        ))}

        {chronicDiseases.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] border border-[hsl(var(--color-warning)/0.2)]">
            <LuActivity className="text-[11px]" /> {c}
          </span>
        ))}

        {surgeries.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-primary)/0.08)] text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.15)]">
            <LuScissors className="text-[11px]" /> {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Medications Sidebar (shared content) ───────────────────────────────── */
function MedicationsSidebar({ medications, loading }: { medications: any[]; loading: boolean }) {
  const [search, setSearch] = useState("");
  const activeMeds = medications.filter(m => m.status === "active");
  const pastMeds = medications.filter(m => m.status !== "active").filter(m =>
    !search || m.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-[hsl(var(--color-border))] rounded-xl" />
      ))}
    </div>
  );

  if (medications.length === 0) return (
    <p className="text-[13px] text-[hsl(var(--color-text-muted))] text-center py-8 italic">
      No medications on record.
    </p>
  );

  const MedRow = ({ med, isActive }: { med: any; isActive: boolean }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors
      ${isActive
        ? "bg-[hsl(var(--color-success-bg))] border-[hsl(var(--color-success)/0.2)]"
        : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))]"
      }`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-text-muted))]"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-[hsl(var(--color-text))] truncate">{med.medicineName}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
            ${isActive
              ? "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]"
              : "text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-border))]"
            }`}>
            {isActive ? "Active" : "Past"}
          </span>
        </div>
        <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium">
          {med.dosage} · {med.frequency}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {activeMeds.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5">
            Active ({activeMeds.length})
          </p>
          <div className="space-y-2">
            {activeMeds.map((m, i) => <MedRow key={i} med={m} isActive={true} />)}
          </div>
        </div>
      )}

      {pastMeds.length > 0 || search ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5">
            Past medications
          </p>
          <div className="relative mb-2.5">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] font-medium rounded-xl border border-[hsl(var(--color-border))]
                bg-[hsl(var(--color-bg-surface-hover))] outline-none text-[hsl(var(--color-text))]
                focus:border-[hsl(var(--color-primary))] transition-colors
                placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] cursor-pointer hover:text-[hsl(var(--color-text))]">
                <LuX className="text-[12px]" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {pastMeds.map((m, i) => <MedRow key={i} med={m} isActive={false} />)}
          </div>
          {pastMeds.length === 0 && search && (
            <p className="text-[12px] text-[hsl(var(--color-text-muted))] text-center py-4 italic">No results for "{search}"</p>
          )}
        </div>
      ) : null}
    </div>
  );
}


/* ─── Mobile Medications Panel ───────────────────────────────────────────── */
function MobileMedicationsPanel({ medications, loading }: { medications: any[]; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const activeMeds = medications.filter(m => m.status === "active");
  return (
    <div className="lg:hidden border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span className="text-[13px] font-semibold text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuPill className="text-[hsl(var(--color-primary))] text-[14px]" />
          Medications
          {activeMeds.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]">
              {activeMeds.length} active
            </span>
          )}
        </span>
        {open ? <LuChevronUp className="text-[14px] text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="text-[14px] text-[hsl(var(--color-text-muted))]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <MedicationsSidebar medications={medications} loading={loading} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState<string[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");

  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchAll() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/patient/profile`, { headers: authHeaders() });
        const p = data.data ?? data;
        setAllergies(p.allergies ?? []);
        setChronicDiseases(p.chronic ?? p.chronicDiseases ?? []);
        setSurgeries((p.surgeries ?? []).map((s: any) => typeof s === "string" ? s : s.operationName || ""));
      } catch {}

      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, { headers: authHeaders() });
        const result = data.data ?? data;
        const fetched = Array.isArray(result) ? result : result ? [result] : [];
        setRecords(fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch {
        setToast({ msg: "Failed to load medical history", variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  const filteredRecords = records.filter(r => {
    const q = filterText.toLowerCase();
    const docName = (r.doctorId?.fullName || r.doctorId?.userName || "").toLowerCase();
    const specialty = (r.doctorId?.specialization || "").toLowerCase();
    const diag = (r.diagnosis || "").toLowerCase();
    const meds = (r.prescriptions || []).map((p: any) => (p.medication || p.name || "").toLowerCase()).join(" ");
    const matchText = docName.includes(q) || specialty.includes(q) || diag.includes(q) || meds.includes(q);

    const recDate = new Date(r.createdAt); recDate.setHours(0,0,0,0);
    let matchStart = true, matchEnd = true;
    if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); matchStart = recDate >= s; }
    if (endDate) { const e = new Date(endDate); e.setHours(0,0,0,0); matchEnd = recDate <= e; }
    return matchText && matchStart && matchEnd;
  });

  useEffect(() => { setVisibleCount(10); }, [filterText, startDate, endDate]);

  const displayedRecords = filteredRecords.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredRecords.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMoreRecords) setVisibleCount(p => p + 10); },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [hasMoreRecords]);

  const allMedications = useMemo(() => {
    const meds = new Map();
    records.forEach(r => {
      (r.prescriptions || []).forEach((rx: any) => {
        const rxDate = new Date(rx.createdAt || r.createdAt);
        (rx.medications || []).forEach((m: any) => {
          const key = m.medicineName.toLowerCase();
          if (!meds.has(key) || rxDate > meds.get(key).date) {
            meds.set(key, { ...m, date: rxDate, prescriptionId: rx._id, status: rx.status || "completed" });
          }
        });
      });
    });
    return Array.from(meds.values()).sort((a: any, b: any) => b.date - a.date);
  }, [records]);

  const clearFilters = () => { setStartDate(""); setEndDate(""); setFilterText(""); };
  const hasFilters = startDate || endDate || filterText;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}

      <DashboardHeader
        title="Medical History"
        subtitle="Your complete clinical encounter records"
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
          
          {/* Filters Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-6">
            <h3 className="text-base font-bold tracking-tight text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
              <LuHistory className="text-[hsl(var(--color-primary))] text-lg" /> Full Medical History
            </h3>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[250px]">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <input 
                  type="text"
                  placeholder="Search doctor, diagnosis..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-xl pl-9 pr-4 py-2 text-[13px] font-medium focus:border-[hsl(var(--color-primary))] outline-none placeholder:text-[hsl(var(--color-text-muted)/0.5)] transition-colors"
                />
                {filterText && (
                  <button onClick={() => setFilterText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] cursor-pointer">
                    <LuX className="text-[13px]" />
                  </button>
                )}
              </div>
              
              <div className="w-full sm:w-auto shrink-0 flex-1 sm:flex-none">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onReset={hasFilters ? clearFilters : undefined}
                  className="!m-0"
                />
              </div>
            </div>
          </div>

          {/* Record count */}
          {!loading && records.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">
                {hasFilters
                  ? `${filteredRecords.length} of ${records.length} visits`
                  : `${records.length} visit${records.length !== 1 ? "s" : ""} total`
                }
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[12px] font-semibold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Timeline list */}
          {loading ? (
            <Skeleton />
          ) : records.length === 0 ? (
            <EmptyState
              icon={<LuHistory />}
              title="No medical history"
              description="You have no recorded visits or diagnoses yet."
            />
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))]">
              <p className="text-[14px] font-semibold text-[hsl(var(--color-text-muted))] mb-3">No records match your filters.</p>
              <button onClick={clearFilters} className="text-[13px] font-semibold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="flex-1 flex flex-col gap-4 w-full">
                {displayedRecords.filter((_, i) => i % 2 === 0).map((r, i) => (
                  <VisitCard key={r._id} record={r} index={i * 2} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-4 w-full">
                {displayedRecords.filter((_, i) => i % 2 === 1).map((r, i) => (
                  <VisitCard key={r._id} record={r} index={i * 2 + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Infinite scroll trigger */}
          {hasMoreRecords && (
            <div ref={observerTarget} className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMoreRecords && filteredRecords.length > 4 && (
            <div className="text-center py-5 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
              — End of history · {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} —
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
