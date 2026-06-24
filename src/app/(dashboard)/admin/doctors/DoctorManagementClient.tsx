"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Doctor, DoctorApprovalStatus } from "@/types/doctor";
import Pagination from "@/components/ui/Pagination";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";

import DoctorsHeader from "@/components/admin/doctors/DoctorsHeader";
import DoctorsFilters from "@/components/admin/doctors/DoctorsFilters";
import DoctorsList from "@/components/admin/doctors/DoctorsList";

const DEBOUNCE_MS = 350;
const ITEMS_PER_PAGE = 10;

interface DoctorManagementClientProps {
  initialDoctors: Doctor[];
  error?: string | null;
}

export default function DoctorManagementClient({
  initialDoctors,
  error,
}: DoctorManagementClientProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
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

  // Note: We're simulating refresh by keeping the initial data for now.
  // Real refresh would require a Server Action or re-fetching via Client API.
  const handleRefresh = useCallback(() => {
    setDoctors(initialDoctors);
  }, [initialDoctors]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DoctorsHeader
        totalCount={doctors.length}
        isLoading={false}
        error={error ?? null}
        onRefresh={handleRefresh}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <DoctorsFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tabCounts={tabCounts}
            isLoading={false}
            totalDoctors={initialDoctors.length}
          />

          <DoctorsList
            doctors={paginatedVisible}
            isLoading={false}
            error={error ?? null}
            debouncedSearch={debouncedSearch}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setModal={setModal}
          />

          <div className="mt-6 flex justify-between items-center border-t border-[hsl(var(--color-border))] pt-4">
            <div className="text-[13px] text-[hsl(var(--color-text-dim))] font-medium">
              Showing <span className="text-[hsl(var(--color-text))]">{paginatedVisible.length}</span> of <span className="text-[hsl(var(--color-text))]">{visible.length}</span> records
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      <LicenseViewerModal
        isOpen={modal.open}
        fileUrl={modal.url}
        onClose={() => setModal({ open: false, url: null })}
      />
    </div>
  );
}
