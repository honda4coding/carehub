"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuShieldCheck, LuClock } from "react-icons/lu";
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
      />

      <main className="flex-1 p-6">
        {/* ── Stats strip ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--color-warning-bg))] flex items-center justify-center shrink-0">
              <LuClock className="w-4 h-4 text-[hsl(var(--color-warning))]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">Pending</p>
              <p className="text-[18px] font-black text-[hsl(var(--color-text))]">{loading ? "—" : doctors.length}</p>
            </div>
          </div>

          <button
            onClick={() => setShowReviewed((s) => !s)}
            className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[hsl(var(--color-success)/0.4)] transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--color-success-bg))] flex items-center justify-center shrink-0">
              <LuShieldCheck className="w-4 h-4 text-[hsl(var(--color-success))]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">Reviewed</p>
              <p className="text-[18px] font-black text-[hsl(var(--color-text))]">
                {reviewedItems === null ? "—" : reviewedItems.length}
              </p>
            </div>
          </button>
        </div>

        {/* ── Reviewed history ─────────────────────────────────────────────── */}
        {showReviewed && (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm mb-6">
            <p className="text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] mb-3">
              Recently Reviewed
            </p>
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
        )}

        {/* ── Error ──────────────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] text-[13px] font-medium">
            {error}
            <button onClick={fetchDoctors} className="ml-2 underline font-bold text-[12px]">
              Retry
            </button>
          </div>
        )}

        {/* ── List ───────────────────────────────────────────────────────────── */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm overflow-x-auto">
          <LicensePendingList
            doctors={doctors}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </main>
    </div>
  );
}
