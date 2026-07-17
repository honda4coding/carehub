"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuShieldCheck, LuClock, LuRefreshCw } from "react-icons/lu";
import { adminService, PendingLicenseDoctor } from "@/services/adminService";
import { fetchClient } from "@/services/fetchClient";
import LicensePendingList from "@/components/admin/licenses/LicensePendingList";
import DashboardHeader from "@/components/global/DashboardHeader";

interface ReviewedItem {
  _id: string;
  message: string;
  createdAt: string;
}

export default function AdminLicensesPage() {
  const router = useRouter();
  const [doctors, setDoctors]   = useState<PendingLicenseDoctor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [reviewedItems, setReviewedItems] = useState<ReviewedItem[] | null>(null);
  const [showReviewed, setShowReviewed] = useState(false);

  const fetchReviewedItems = useCallback(async () => {
    try {
      const res = await fetchClient.get("/notifications", {
        params: { limit: "100" },
      });
      const notifications = res.data?.notifications ?? [];
      const reviewed = notifications.filter(
        (n: { type: string; message: string }) =>
          n.type === "license_update" &&
          (n.message.startsWith("You approved") ||
            n.message.startsWith("You rejected")),
      );
      setReviewedItems(reviewed);
    } catch {
      setReviewedItems(null);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getPendingLicenseDoctors();
      setDoctors(res.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchReviewedItems();
  }, [fetchDoctors, fetchReviewedItems]);

  const handleApprove = async (id: string) => {
    await adminService.approveDoctorLicense(id);
    setDoctors((prev) => prev.filter((d) => d.userId !== id));
    window.dispatchEvent(new Event("pending-licenses-changed"));
    await fetchReviewedItems();
  };

  const handleReject = async (id: string, reason: string) => {
    await adminService.rejectDoctorLicense(id, reason);
    setDoctors((prev) => prev.filter((d) => d.userId !== id));
    window.dispatchEvent(new Event("pending-licenses-changed"));
    await fetchReviewedItems();
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title="License Updates"
        subtitle="Review new license submissions from approved doctors"
        showBack={true}
        rightElement={
          <button
            onClick={() => {
              fetchDoctors();
              fetchReviewedItems();
            }}
            disabled={loading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw className={`text-[14px] ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <main className="flex-1 p-6">
        {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="w-full lg:w-auto shrink-0">
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full">
              <button
                onClick={() => setShowReviewed(false)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  !showReviewed
                    ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                Pending
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    !showReviewed
                      ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                      : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                  }`}
                >
                  {loading ? "—" : doctors.length}
                </span>
              </button>

              <button
                onClick={() => setShowReviewed(true)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-[8px] text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  showReviewed
                    ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                Reviewed
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    showReviewed
                      ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                      : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                  }`}
                >
                  {reviewedItems === null ? "—" : reviewedItems.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        {showReviewed ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm mb-6">
            {!reviewedItems || reviewedItems.length === 0 ? (
              <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-6">
                No reviewed license updates yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {reviewedItems.map((item) => {
                  const isApproved = item.message.startsWith("You approved");
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            isApproved
                              ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
                              : "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]"
                          }`}
                        >
                          {isApproved ? "Approved" : "Rejected"}
                        </span>
                        <p className="text-[13px] font-semibold text-[hsl(var(--color-text))]">
                          {item.message}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm overflow-x-auto">
            <LicensePendingList
              doctors={doctors}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}
      </main>
    </div>
  );
}
