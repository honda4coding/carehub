"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuClipboardList, LuStethoscope, LuCalendar, LuChevronDown, LuChevronUp, LuFileText, LuHistory, LuPill, LuSearch, LuShieldAlert, LuActivity, LuScissors
} from "react-icons/lu";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import EmptyState from "@/components/appointments/EmptyState";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="h-4 bg-[hsl(var(--color-border))] rounded w-1/3 mb-3" />
          <div className="h-3 bg-[hsl(var(--color-border))] rounded w-1/2 mb-2" />
          <div className="h-3 bg-[hsl(var(--color-border))] rounded w-full mb-1" />
          <div className="h-3 bg-[hsl(var(--color-border))] rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

function TimelineAccordionCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 hover:border-[hsl(var(--color-primary)/0.5)] transition-all cursor-pointer group w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[hsl(var(--color-bg-surface-hover))] text-[hsl(var(--color-text-muted))] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-colors">
            <LuCalendar className="text-lg" />
          </span>
          <div>
            <p className="text-[15px] font-black text-[hsl(var(--color-text))]"> {dateStr} <span className="text-[13px] text-[hsl(var(--color-text-muted))] ml-1">{timeStr}</span></p>
            <p className="text-[14px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
               <LuStethoscope className="text-[hsl(var(--color-text-muted))] flex-shrink-0" /> 
               {record.doctorId?.fullName ?? record.doctorId?.userName ?? "Doctor"} • {record.diagnosis || "No diagnosis recorded"}
            </p>
          </div>
        </div>
        
        <button className="text-[hsl(var(--color-text-muted))] p-1 rounded-md hover:bg-[hsl(var(--color-bg-surface-hover))] transition-colors cursor-pointer">
          {expanded ? <LuChevronUp className="text-xl" /> : <LuChevronDown className="text-xl" />}
        </button>
      </div>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4 cursor-auto border-t border-[hsl(var(--color-border))] pt-4" onClick={(e) => e.stopPropagation()}>
          <MedicalHistoryCard record={record} hideHeader={true} />
        </div>
      )}
    </div>
  );
}

// ─── Medications & Medical Info Sidebar ─────────────────────────────────────────
function MedicalInfoSidebar({ medications, loading, allergies, chronicDiseases, surgeries }: {
  medications: any[];
  loading: boolean;
  allergies: string[];
  chronicDiseases: string[];
  surgeries: string[];
}) {
  const [medSearch, setMedSearch] = useState("");
  const [medStartDate, setMedStartDate] = useState("");
  const [medEndDate, setMedEndDate] = useState("");
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 5;

  const activeMeds = medications.filter(m => m.status === 'active');
  const pastMeds = medications.filter(m => m.status !== 'active');

  // Filter only past medications
  const filteredPast = pastMeds.filter(m => {
    const nameMatch = !medSearch || m.medicineName.toLowerCase().includes(medSearch.toLowerCase());
    let dateMatch = true;
    if (medStartDate) {
      const start = new Date(medStartDate);
      start.setHours(0, 0, 0, 0);
      dateMatch = m.date >= start;
    }
    if (medEndDate && dateMatch) {
      const end = new Date(medEndDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = m.date <= end;
    }
    return nameMatch && dateMatch;
  });

  const displayedPast = showAll ? filteredPast : filteredPast.slice(0, LIMIT);
  const hasMore = filteredPast.length > LIMIT;

  const handleReset = () => {
    setMedSearch("");
    setMedStartDate("");
    setMedEndDate("");
  };

  const MedCard = ({ med, isActive }: { med: any; isActive: boolean }) => (
    <div className={`bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] rounded-xl p-3 flex flex-col transition-colors ${isActive ? 'hover:border-[hsl(var(--color-success)/0.4)]' : 'opacity-80'}`}>
      <div className="flex justify-between items-start mb-1">
        <h5 className="text-[14px] font-bold text-[hsl(var(--color-text))]">{med.medicineName}</h5>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          isActive
            ? 'text-[hsl(var(--color-success))] bg-[hsl(var(--color-success-bg))]'
            : 'text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-border))]'
        }`}>
          {isActive ? 'Active' : 'Past'}
        </span>
      </div>
      <div className="text-[13px] text-[hsl(var(--color-text-muted))] flex flex-wrap gap-x-2 gap-y-1 mb-2">
        <span>{med.dosage}</span>
        <span>•</span>
        <span>{med.frequency}</span>
      </div>
      <div className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
        {isActive ? 'Since' : 'Date'}: {med.date.toLocaleDateString()}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Allergies ── */}
      {allergies.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <LuShieldAlert className="text-[hsl(var(--color-danger))] text-lg" />
            <h3 className="text-[15px] font-black text-[hsl(var(--color-danger))]">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a, idx) => (
              <span key={idx} className="bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] px-3 py-1.5 rounded-full text-[12px] font-bold">
                ⚠️ {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Chronic Diseases ── */}
      {chronicDiseases.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <LuActivity className="text-[hsl(var(--color-warning))] text-lg" />
            <h3 className="text-[15px] font-black text-[hsl(var(--color-warning))]">Chronic Conditions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {chronicDiseases.map((c, idx) => (
              <span key={idx} className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-warning-bg))] px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-warning))] shrink-0" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Surgeries ── */}
      {surgeries.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <LuScissors className="text-[hsl(var(--color-primary))] text-lg" />
            <h3 className="text-[15px] font-black text-[hsl(var(--color-text))]">Surgeries</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {surgeries.map((s, idx) => (
              <span key={idx} className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Medications ── */}
      {!loading && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-4">
            <LuPill className="text-[hsl(var(--color-primary))] text-lg" /> Patient Medications
          </h3>

          {medications.length === 0 ? (
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] text-center py-4">No medications on record.</p>
          ) : (
            <>
              {/* Active Medications — always show all */}
              {activeMeds.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-success))]"></span> Active ({activeMeds.length})
                  </h4>
                  <div className="space-y-3">
                    {activeMeds.map((med, idx) => <MedCard key={idx} med={med} isActive={true} />)}
                  </div>
                </div>
              )}

              {/* Past Medications — with search + date filter + limit */}
              <div className="mt-8 border-t border-[hsl(var(--color-border))] pt-6">
                <h4 className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-text-muted))]"></span> Past Medications ({pastMeds.length})
                </h4>

                {/* Search */}
                <div className="relative mb-3">
                  <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[hsl(var(--color-text-muted))]" />
                  <input
                    type="text"
                    placeholder="Search past medication..."
                    value={medSearch}
                    onChange={(e) => setMedSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] font-medium rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface-hover))] outline-none text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] transition-colors placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
                  />
                </div>

                {/* Date Range Filter */}
                <DateRangeFilter
                  startDate={medStartDate}
                  endDate={medEndDate}
                  onStartDateChange={setMedStartDate}
                  onEndDateChange={setMedEndDate}
                  onReset={(medStartDate || medEndDate) ? handleReset : undefined}
                  className="mb-3 !mt-0"
                />

                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-3">
                  Showing {displayedPast.length} of {filteredPast.length} past medication{filteredPast.length !== 1 ? "s" : ""}
                </p>

                {filteredPast.length === 0 ? (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] text-center py-4 bg-[hsl(var(--color-bg-surface-hover))] rounded-xl border border-[hsl(var(--color-border))]">No past medications match your search.</p>
                ) : (
                  <div className="space-y-3">
                    {displayedPast.map((med, idx) => <MedCard key={idx} med={med} isActive={false} />)}
                    {hasMore && (
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full text-center text-[13px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer py-2"
                      >
                        {showAll ? 'Show less' : `Show all ${filteredPast.length} past medications`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);

  // Patient profile data
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState<string[]>([]);

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchAll() {
      setLoading(true);

      // Fetch profile (allergies, chronic diseases, surgeries)
      try {
        const { data } = await axios.get(`${BASE_URL}/patient/profile`, {
          headers: authHeaders(),
        });
        const p = data.data ?? data;
        setAllergies(p.allergies ?? []);
        setChronicDiseases(p.chronic ?? p.chronicDiseases ?? []);
        setSurgeries((p.surgeries ?? []).map((s: any) => typeof s === 'string' ? s : s.operationName || ""));
      } catch {}

      // Fetch medical history
      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, {
          headers: authHeaders(),
        });
        const result = data.data ?? data;
        const fetchedRecords = Array.isArray(result) ? result : result ? [result] : [];
        setRecords(fetchedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        setToast({ msg: "Failed to load medical history", variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  // Apply filters
  const filteredRecords = records.filter(r => {
    const search = filterText.toLowerCase();
    const docName = (r.doctorId?.fullName || r.doctorId?.userName || "").toLowerCase();
    const specialty = (r.doctorId?.specialization || "").toLowerCase();
    const diag = (r.diagnosis || "").toLowerCase();
    const medications = (r.prescriptions || []).map((p: any) => (p.medication || p.name || "").toLowerCase()).join(" ");
    
    const matchesText = docName.includes(search) || specialty.includes(search) || diag.includes(search) || medications.includes(search);

    const recordDate = new Date(r.createdAt);
    recordDate.setHours(0, 0, 0, 0);
    
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesStartDate = recordDate >= start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      matchesEndDate = recordDate <= end;
    }

    return matchesText && matchesStartDate && matchesEndDate;
  });

  // Reset infinite scroll when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [filterText, startDate, endDate]);

  const displayedRecords = filteredRecords.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredRecords.length;

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRecords) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMoreRecords]);

  // Extract all medications
  const allMedications = useMemo(() => {
    const meds = new Map();
    records.forEach(r => {
      (r.prescriptions || []).forEach((rx: any) => {
        const rxDate = new Date(rx.createdAt || r.createdAt);
        (rx.medications || []).forEach((m: any) => {
          const key = m.medicineName.toLowerCase();
          if (!meds.has(key)) {
            meds.set(key, {
              ...m,
              date: rxDate,
              prescriptionId: rx._id,
              status: rx.status || "completed"
            });
          } else {
             // update with more recent
             if (rxDate > meds.get(key).date) {
               meds.set(key, { ...m, date: rxDate, prescriptionId: rx._id, status: rx.status || "completed" });
             }
          }
        });
      });
    });
    return Array.from(meds.values()).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  }, [records]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-[hsl(var(--color-primary)/0.1)] border border-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] items-center justify-center text-[20px] shrink-0">
            <LuClipboardList />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[22px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Medical History
            </h1>
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Your complete clinical encounter records
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
          
          {/* Filters Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-6">
            <h3 className="text-[17px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
              <LuHistory className="text-[hsl(var(--color-text-muted))] text-[20px]" /> Full Medical History
            </h3>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-end sm:items-center gap-3 w-full xl:w-auto">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onReset={(startDate || endDate) ? () => { setStartDate(""); setEndDate(""); } : undefined}
                className="!mt-0"
              />
              <div className="relative w-full sm:flex-1 sm:min-w-[200px] xl:w-auto xl:flex-none">
                <input 
                  type="text"
                  placeholder="Search doctor, diagnosis, medication..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Swapped: Medications Sidebar FIRST, then Timeline */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Medical Info Sidebar (LEFT) */}
            <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0">
              <MedicalInfoSidebar
                medications={allMedications}
                loading={loading}
                allergies={allergies}
                chronicDiseases={chronicDiseases}
                surgeries={surgeries}
              />
            </div>

            {/* Timeline Column (RIGHT) */}
            <div className="flex-1">
              <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                <LuHistory className="text-[hsl(var(--color-text-muted))] text-xl" /> Clinical Visits
              </h3>
              {loading ? (
                <Skeleton />
              ) : records.length === 0 ? (
                <EmptyState
                  icon={<LuHistory />}
                  title="No Medical History"
                  description="You have no recorded visits or diagnoses yet."
                />
              ) : filteredRecords.length === 0 ? (
                 <div className="text-center py-16 bg-[hsl(var(--color-bg-surface-hover))] rounded-2xl border border-[hsl(var(--color-border))]">
                  <p className="text-[14px] font-bold text-[hsl(var(--color-text-muted))] mb-2">No records match your filters.</p>
                  <button 
                    onClick={() => { setStartDate(""); setEndDate(""); setFilterText(""); }}
                    className="text-[13px] text-[hsl(var(--color-primary))] font-black hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[hsl(var(--color-border))]">
                  {displayedRecords.map((r, index) => (
                    <div key={r._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline dot — NEUTRAL/GRAY */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[hsl(var(--color-bg-surface))] bg-[hsl(var(--color-bg-surface-hover))] text-[hsl(var(--color-text-muted))] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <LuFileText />
                      </div>
                      {/* Timeline Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                        <TimelineAccordionCard record={r} />
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite Scroll Trigger */}
                  {hasMoreRecords && (
                    <div ref={observerTarget} className="flex justify-center py-6 relative z-10">
                      <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!hasMoreRecords && filteredRecords.length > 0 && (
                    <div className="text-center py-4 text-[13px] font-bold text-[hsl(var(--color-text-muted))] relative z-10 bg-[hsl(var(--color-bg-surface))] inline-block px-4 mx-auto md:left-1/2 md:-translate-x-1/2 rounded-full border border-[hsl(var(--color-border))]">
                      End of history ({filteredRecords.length} records)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
