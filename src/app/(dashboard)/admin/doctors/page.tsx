"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

import { adminService } from "@/services/adminService";
import { Doctor, DoctorApprovalStatus } from "@/types/doctor";
import Pagination from "@/components/ui/Pagination";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";

import DashboardHeader from "@/components/global/DashboardHeader";
import { LuRefreshCw } from "react-icons/lu";
import DoctorsFilters from "@/components/admin/doctors/DoctorsFilters";
import DoctorsList from "@/components/admin/doctors/DoctorsList";

const DEBOUNCE_MS = 350;
const ITEMS_PER_PAGE = 10;

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<{ totalPages: number; currentPage: number; totalRecords: number } | null>(null);
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
      const res = await adminService.getDoctors({
        status: statusFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      });
      setDoctors(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load doctors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const tabCounts = doctors.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }), {});

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title="Doctor Directory"
        subtitle="View all registered doctors and their approval status"
        showBack={true}
        rightElement={
          <button
            onClick={fetchDoctors}
            disabled={isLoading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw className={`text-[14px] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <DoctorsFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isLoading={isLoading}
            totalDoctors={pagination?.totalRecords ?? 0}
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
            doctors={doctors}
            isLoading={isLoading}
            error={error}
            debouncedSearch={debouncedSearch}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setModal={setModal}
          />

          {!isLoading && pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {!isLoading &&
            debouncedSearch &&
            pagination && (
              <p className="mt-4 text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center">
                Showing {pagination.totalRecords} doctors matching
                &ldquo;{debouncedSearch}&rdquo;
              </p>
            )}
        </div>
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
