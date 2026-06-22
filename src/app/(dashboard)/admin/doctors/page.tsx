"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LuSearch,
  LuStethoscope,
  LuRefreshCw,
  LuTriangleAlert,
  LuInbox,
  LuEye,
  LuFilter,
} from "react-icons/lu";
import { useRouter } from "next/navigation";

import { adminService } from "@/services/adminService";
import { Doctor, DoctorApprovalStatus } from "@/types/doctor";
import Pagination from "@/components/ui/Pagination";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 350;
const ITEMS_PER_PAGE = 10;

const STATUS_TABS: { label: string; value: DoctorApprovalStatus | "" }[] = [
  { label: "All",      value: "" },
  { label: "Approved", value: "approved" },
  { label: "Pending",  value: "pending" },
  { label: "Rejected", value: "rejected" },
];

// ─── Style configs ────────────────────────────────────────────────────────────
const statusConfig: Record<DoctorApprovalStatus,{ style: string; label: string }> = {
  approved: {
    style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    label: "Approved",
  },
  pending: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Pending",
  },
  rejected: {
    style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
    label: "Rejected",
  },
};

const AVATAR_STYLES = [
  "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  "bg-[hsl(var(--color-indigo-bg))] text-[hsl(var(--color-indigo))]",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Deterministic avatar colour — same doctor always gets the same colour. */
function pickAvatar(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_STYLES[sum % AVATAR_STYLES.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[hsl(var(--color-border-soft))]">
      {[75, 60, 45, 35, 40, 30, 30].map((w, i) => (
        <td key={i} className="py-3 pr-4">
          <div
            className="h-3 rounded-full bg-[hsl(var(--color-bg-soft))] animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<DoctorApprovalStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // License / National ID viewer modal
  const [modal, setModal] = useState<{ open: boolean; url: string | null }>({
    open: false,
    url: null,
  });

  // ── Debounce search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  // Fetch ALL doctors once. The tabs will filter them client-side to avoid reloading.
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getDoctors("");
      setDoctors(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load doctors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove statusFilter dependency

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ── Client-side search & status filter ────────────────────────────────────
  const visible = doctors.filter((d) => {
    const matchesSearch = debouncedSearch
      ? d.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (d.specialty ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const paginatedVisible = visible.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Tab counts (derived from current loaded slice) ────────────────────────
  // These count the currently loaded data per status, useful when "All" is active.
  const tabCounts = doctors.reduce<Record<string, number>>(
    (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }),
    {},
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">

      {/* ── Topbar ── */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Doctor Directory
            </h1>
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              View all registered doctors and their approval status
            </p>
          </div>
          
          {/* Stat strip inside header */}
          {!isLoading && !error && (
            <div className="hidden md:flex items-center gap-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-1.5 shadow-sm ml-4">
              <LuStethoscope className="text-[14px] text-[hsl(var(--color-primary))]" />
              <span className="text-[13px] font-black text-[hsl(var(--color-text))]">
                {doctors.length}
              </span>
              <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                total doctors
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">          {/* Refresh */}
          <button
            onClick={fetchDoctors}
            disabled={isLoading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw className={`text-[14px] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">

        {/* Card */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">

          {/* Card header — search + tabs + filter */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
              <div className="relative flex items-center w-full max-w-[300px]">
                <LuSearch className="absolute left-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search name, email or specialty…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto shrink-0">
              {/* Status tabs */}
              <div className="flex items-center gap-1 flex-wrap bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto">
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab.value;
                  const count =
                    tab.value === ""
                      ? doctors.length
                      : tabCounts[tab.value] ?? 0;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                      }`}
                    >
                      {tab.label}
                      {/* Always show badge */}
                      {!isLoading && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                              : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                          }`}
                        >
                          {tab.value === "" ? doctors.length : (tabCounts[tab.value] ?? 0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick-jump to Approvals page */}
              <button
                onClick={() => router.push("/admin/approvals")}
                className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 text-[12px] font-bold px-3 py-2 sm:py-1.5 rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all whitespace-nowrap cursor-pointer shadow-sm"
              >
                <LuFilter className="text-[12px]" />
                Manage Approvals
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-3.5 py-2.5">
              <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[14px] shrink-0" />
              <p className="text-[13px] font-semibold text-[hsl(var(--color-danger))] flex-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-[hsl(var(--color-danger))] text-[14px] font-black hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* Desktop Table */}
                <table className="w-full min-w-[680px] hidden lg:table">
                  <thead>
                    <tr className="border-b border-[hsl(var(--color-border))]">
                      {["Doctor", "Specialty", "Email", "Status", "Joined", "License", "National ID"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] ${i >= 5 ? "text-center px-2" : "text-left pr-4"}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>

                    {/* Loading skeleton */}
                    {isLoading &&
                      Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                    {/* Empty state */}
                    {!isLoading && !error && paginatedVisible.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
                          <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                            {debouncedSearch
                              ? "No doctors match your search."
                              : statusFilter
                              ? `No ${statusFilter} doctors found.`
                              : "No doctors found."}
                          </p>
                          {debouncedSearch && (
                            <button
                              onClick={() => setSearch("")}
                              className="mt-2 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer"
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Rows */}
                    {!isLoading &&
                      paginatedVisible.map((doc) => {
                        const sc =
                          statusConfig[doc.status] ?? statusConfig.pending;
                        return (
                          <tr
                            key={doc._id}
                            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                          >
                            {/* Doctor name + avatar */}
                            <td className="py-3.5 pr-4 text-left">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${pickAvatar(doc._id)}`}
                                >
                                  {getInitials(doc.fullName)}
                                </div>
                                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">
                                  {doc.fullName}
                                </p>
                              </div>
                            </td>

                            {/* Specialty */}
                            <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-left">
                              {doc.specialty ?? "—"}
                            </td>

                            {/* Email */}
                            <td className="py-3.5 pr-4 max-w-[170px] text-left">
                              <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
                                {doc.email}
                              </p>
                            </td>

                            {/* Status badge */}
                            <td className="py-3.5 pr-4 text-left">
                              <span
                                className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                              >
                                {sc.label}
                              </span>
                            </td>

                            {/* Joined */}
                            <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-left">
                              {fmtDate(doc.createdAt)}
                            </td>

                            {/* License */}
                            <td className="py-3.5 pr-4 text-center">
                              {doc.licenseUrl ? (
                                <button
                                  onClick={() =>
                                    setModal({ open: true, url: doc.licenseUrl })
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-[7px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-[hsl(var(--color-primary-strong))] hover:border-[hsl(var(--color-primary)/0.3)] transition-all mx-auto cursor-pointer"
                                >
                                  <LuEye className="text-[12px]" /> View
                                </button>
                              ) : (
                                <span className="text-[11px] text-[hsl(var(--color-text-muted))]">
                                  —
                                </span>
                              )}
                            </td>

                            {/* National ID */}
                            <td className="py-3.5 text-center">
                              {doc.nationalIdUrl ? (
                                <button
                                  onClick={() =>
                                    setModal({ open: true, url: doc.nationalIdUrl })
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-[7px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-[hsl(var(--color-primary-strong))] hover:border-[hsl(var(--color-primary)/0.3)] transition-all mx-auto cursor-pointer"
                                >
                                  <LuEye className="text-[12px]" /> View
                                </button>
                              ) : (
                                <span className="text-[11px] text-[hsl(var(--color-text-muted))]">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col gap-4 py-2">
                  {/* Loading */}
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] h-32 animate-pulse" />
                    ))}

                  {/* Empty */}
                  {!isLoading && !error && paginatedVisible.length === 0 && (
                    <div className="py-16 text-center">
                      <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
                      <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                        {debouncedSearch
                          ? "No doctors match your search."
                          : statusFilter
                          ? `No ${statusFilter} doctors found.`
                          : "No doctors found."}
                      </p>
                    </div>
                  )}

                  {/* Rows */}
                  {!isLoading &&
                    paginatedVisible.map((doc) => {
                      const sc = statusConfig[doc.status] ?? statusConfig.pending;
                      return (
                        <div key={doc._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm">
                          {/* Card Header: Avatar, Name, Status */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${pickAvatar(doc._id)}`}>
                                {getInitials(doc.fullName)}
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">{doc.fullName}</p>
                                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{doc.email}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${sc.style}`}>
                              {sc.label}
                            </span>
                          </div>
                          
                          {/* Card Body: Details */}
                          <div className="grid grid-cols-2 gap-3 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                            <div>
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Specialty</p>
                              <p className="font-semibold text-[hsl(var(--color-text))]">{doc.specialty ?? "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Joined</p>
                              <p className="font-semibold text-[hsl(var(--color-text))]">{fmtDate(doc.createdAt)}</p>
                            </div>
                            <div className="col-span-2 flex items-center gap-3 mt-1 pt-2 border-t border-[hsl(var(--color-border-soft))]">
                              <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Docs:</span>
                              {doc.licenseUrl && (
                                <button onClick={() => setModal({ open: true, url: doc.licenseUrl ?? null })} className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                                  <LuEye className="text-[12px]"/> License
                                </button>
                              )}
                              {doc.nationalIdUrl && (
                                <button onClick={() => setModal({ open: true, url: doc.nationalIdUrl ?? null })} className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                                  <LuEye className="text-[12px]"/> ID
                                </button>
                              )}
                              {!doc.licenseUrl && !doc.nationalIdUrl && (
                                <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
          </div>
          
          {/* Pagination */}
          {!isLoading && visible.length > ITEMS_PER_PAGE && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}

          {/* Footer note when search is narrowing results */}
          {!isLoading && debouncedSearch && visible.length > 0 && visible.length < doctors.length && (
            <p className="mt-4 text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center">
              Showing {visible.length} of {doctors.length} doctors matching &ldquo;{debouncedSearch}&rdquo;
            </p>
          )}
        </div>
      </main>

      {/* License / National ID viewer modal (reuses existing component) */}
      <LicenseViewerModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, url: null })}
        fileUrl={modal.url}
      />
    </div>
  );
}

