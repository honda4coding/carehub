"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";
import Pagination from "@/components/ui/Pagination";

import DashboardHeader from "@/components/global/DashboardHeader";
import ApprovalsFilters, { ApprovalStatus } from "@/components/admin/approvals/ApprovalsFilters";
import ApprovalsList, { DoctorApproval } from "@/components/admin/approvals/ApprovalsList";
import RejectDoctorModal from "@/components/admin/approvals/RejectDoctorModal";
import { LuRefreshCw } from "react-icons/lu";
import { adminService } from "@/services/adminService";

const ITEMS_PER_PAGE = 10;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const notifyPendingChange = () =>
  window.dispatchEvent(new Event("pending-approvals-changed"));

export default function ApprovalsPage() {
  const { token } = useAuth();

  const [doctors, setDoctors] = useState<DoctorApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApprovalStatus | "all">("all");
  const [filter, setFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, activeTab]);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; doctorId: string | null }>({
    open: false,
    doctorId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const [licenseModal, setLicenseModal] = useState<{ open: boolean; url: string | null }>({
    open: false,
    url: null,
  });

  const [pagination, setPagination] = useState<{ totalPages: number; currentPage: number; totalRecords: number } | null>(null);

  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await adminService.getDoctors({
        status: activeTab === "all" ? undefined : activeTab,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: filter,
      });
      setDoctors(res.data || []);
      setPagination(res.pagination ?? null);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, currentPage, filter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setDoctors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: "approved" } : d))
      );
      notifyPendingChange();
    } catch (err) {
      console.error("Failed to approve", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.doctorId) return;
    setActionLoadingId(rejectModal.doctorId);
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${rejectModal.doctorId}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed");
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === rejectModal.doctorId ? { ...d, status: "rejected" } : d
        )
      );
      notifyPendingChange();
      setRejectModal({ open: false, doctorId: null });
      setRejectReason("");
    } catch (err) {
      console.error("Failed to reject", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetToPending = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${id}/pending`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setDoctors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: "pending" } : d))
      );
      notifyPendingChange();
    } catch (err) {
      console.error("Failed to reset", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabCounts = doctors.reduce<Record<string, number>>(
    (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }),
    {}
  );

  return (
    <>
      <div className="flex flex-col flex-1 min-h-screen">
        <DashboardHeader 
          title="Doctor Approvals" 
          subtitle="Review and manage doctor registration requests" 
          showBack={true} 
          rightElement={
            <button
              onClick={fetchDoctors}
              disabled={loading}
              title="Refresh"
              className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <LuRefreshCw className={`text-[14px] ${loading ? "animate-spin" : ""}`} />
            </button>
          }
        />
        <div className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg))]">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">

        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <ApprovalsFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filter={filter}
            setFilter={setFilter}
            totalDoctors={pagination?.totalRecords ?? 0}
            tabCounts={tabCounts}
          />

          <ApprovalsList
            doctors={doctors}
            loading={loading}
            actionLoadingId={actionLoadingId}
            setLicenseModal={setLicenseModal}
            setRejectModal={setRejectModal}
            handleApprove={handleApprove}
            handleResetToPending={handleResetToPending}
          />

          {!loading && pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
          </div>
        </div>
      </div>

      <RejectDoctorModal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, doctorId: null });
          setRejectReason("");
        }}
        onConfirm={handleRejectConfirm}
        reason={rejectReason}
        setReason={setRejectReason}
        isLoading={!!actionLoadingId}
      />

      <LicenseViewerModal
        isOpen={licenseModal.open}
        onClose={() => setLicenseModal({ open: false, url: null })}
        fileUrl={licenseModal.url}
      />
    </>
  );
}
