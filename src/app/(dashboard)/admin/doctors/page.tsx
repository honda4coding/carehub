"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

import { adminService } from "@/services/adminService";
import { Doctor, DoctorApprovalStatus } from "@/types/doctor";
import Pagination from "@/components/ui/Pagination";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";

import DoctorsHeader from "@/components/admin/doctors/DoctorsHeader";
import DoctorsFilters from "@/components/admin/doctors/DoctorsFilters";
import DoctorsList from "@/components/admin/doctors/DoctorsList";

const DEBOUNCE_MS = 350;
const ITEMS_PER_PAGE = 10;

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<DoctorApprovalStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modal, setModal] = useState<{ open: boolean; url: string | null }>({
    open: false,
    url: null,
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const visible = doctors.filter((d) => {
    const matchesSearch = debouncedSearch
      ? d.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (d.specialty ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? d.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const paginatedVisible = visible.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabCounts = doctors.reduce<Record<string, number>>(
    (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DoctorsHeader
        totalCount={doctors.length}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchDoctors}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <DoctorsFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isLoading={isLoading}
            totalDoctors={doctors.length}
            tabCounts={tabCounts}
          />

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

          <DoctorsList
            doctors={paginatedVisible}
            isLoading={isLoading}
            error={error}
            debouncedSearch={debouncedSearch}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setModal={setModal}
          />

          {!isLoading && visible.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {!isLoading &&
            debouncedSearch &&
            visible.length > 0 &&
            visible.length < doctors.length && (
              <p className="mt-4 text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center">
                Showing {visible.length} of {doctors.length} doctors matching
                &ldquo;{debouncedSearch}&rdquo;
              </p>
            )}
        </div>
      </main>

      <LicenseViewerModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, url: null })}
        fileUrl={modal.url}
      />
    </div>
  );
}
