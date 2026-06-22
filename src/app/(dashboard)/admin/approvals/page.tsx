"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";
import {
  LuCheck, LuX, LuClock, LuSearch, LuEye, LuChevronLeft,
} from "react-icons/lu";
import { useRouter } from "next/navigation";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  status: ApprovalStatus;
  specialty?: string;
  licenseUrl?: string;
  nationalIdUrl?: string;
  createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const statusConfig: Record<ApprovalStatus, { style: string; label: string; icon: React.ReactNode }> = {
  pending:  { style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",  label: "Pending",  icon: <LuClock className="text-[10px]" /> },
  approved: { style: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]", label: "Approved", icon: <LuCheck className="text-[10px]" /> },
  rejected: { style: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",    label: "Rejected", icon: <LuX className="text-[10px]" /> },
};

const avatarStyles = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
];

const TABS: { label: string; value: ApprovalStatus | "all" }[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
 
];

const notifyPendingChange = () =>
  window.dispatchEvent(new Event("pending-approvals-changed"));

export default function ApprovalsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApprovalStatus | "all">("all");
  const [filter, setFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; doctorId: string | null }>({
    open: false, doctorId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  // License modal
  const [licenseModal, setLicenseModal] = useState<{ open: boolean; url: string | null }>({
    open: false, url: null,
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
          const res = await fetch(`${BASE_URL}/admin/doctors`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          setDoctors(json.data || []);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDoctors();
  }, [token]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${BASE_URL}/admin/doctors/${id}/approve`, {
        method: "PATCH",
        credentials: "include", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setDoctors((prev) =>
        prev.map((d) => d._id === id ? { ...d, status: "approved" } : d)
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
        credentials: "include", headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed");
      setDoctors((prev) =>
        prev.map((d) => d._id === rejectModal.doctorId ? { ...d, status: "rejected" } : d)
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

  const filtered = doctors
    .filter((d) => activeTab === "all" || d.status === activeTab)
    .filter((d) =>
      (d.fullName ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (d.specialty ?? "").toLowerCase().includes(filter.toLowerCase())
    );

//////علشان في دكتور اتوافق عليه او اترفض بالغلط وعايز ارجعه تاني  
    const handleResetToPending = async (id: string) => {
    setActionLoadingId(id);
    try {
        const res = await fetch(`${BASE_URL}/admin/doctors/${id}/pending`, {
            method: "PATCH",
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed");
        setDoctors((prev) =>
            prev.map((d) => d._id === id ? { ...d, status: "pending" } : d)
        );
        notifyPendingChange();
    } catch (err) {
        console.error("Failed to reset", err);
    } finally {
        setActionLoadingId(null);
    }
};

  return (
    <>
      <div className="flex-1 p-4 md:p-6 overflow-auto bg-[hsl(var(--color-bg))]">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="w-8 h-8 rounded-[9px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <LuChevronLeft className="text-[15px]" />
          </button>
          <div>
            <h1 className="text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight">Doctor Approvals</h1>
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">Review and manage doctor registration requests</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">

          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] transition-all ${
                    activeTab === tab.value
                      ? "bg-primary text-white"
                      : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
                  }`}
                >
                  {tab.label}
                  {tab.value !== "all" && (
                    <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/20">
                      {doctors.filter((d) => d.status === tab.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex items-center w-full sm:w-auto mt-2 sm:mt-0">
              <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Filter by name or specialty..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full sm:w-[200px] outline-none focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 px-4">
            {loading ? (
              <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">No doctors found</p>
            ) : (
              <>
                {/* Desktop Table View */}
                <table className="w-full min-w-[620px] hidden lg:table">
                  <thead>
                    <tr className="border-b border-[hsl(var(--color-border))]">
                      {["Doctor", "Specialty", "Submitted", "Status", "License", "National ID", "Actions"].map((h, i) => (
                        <th
                          key={h}
                          className="pb-2.5 text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-[.07em] text-left"
                          style={{ textAlign: i >= 4 ? "center" : "left" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc, index) => {
                      const sc = statusConfig[doc.status];
                      const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
                      const avatarStyle = avatarStyles[index % avatarStyles.length];
                      return (
                        <tr key={doc._id} className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0">
                          {/* Doctor */}
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${avatarStyle}`}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">{doc.fullName}</p>
                                <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))]">{doc.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Specialty */}
                          <td className="py-3 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {doc.specialty ?? "—"}
                          </td>

                          {/* Submitted */}
                          <td className="py-3 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${sc.style}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>

                          {/* License */}
                          <td className="py-3 text-center">
                            {doc.licenseUrl ? (
                              <button
                                onClick={() => setLicenseModal({ open: true, url: doc.licenseUrl ?? null })}
                                className="text-[10px] font-bold px-2 py-1 rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-1 mx-auto"
                              >
                                <LuEye className="text-[11px]" /> View
                              </button>
                            ) : (
                              <span className="text-[10px] text-[hsl(var(--color-text-muted))]">—</span>
                            )}
                          </td>

                          {/* National ID */}
                          <td className="py-3 text-center">
                            {doc.nationalIdUrl ? (
                              <button
                                onClick={() => setLicenseModal({ open: true, url: doc.nationalIdUrl ?? null })}
                                className="text-[10px] font-bold px-2 py-1 rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-1 mx-auto"
                              >
                                <LuEye className="text-[11px]" /> View
                              </button>
                            ) : (
                              <span className="text-[10px] text-[hsl(var(--color-text-muted))]">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 justify-center">
                              {doc.status === "pending" ? (
                                  <>
                                      <button
                                          onClick={() => handleApprove(doc._id)}
                                          disabled={actionLoadingId === doc._id}
                                          className="text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[hsl(var(--color-primary)/0.4)] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          {actionLoadingId === doc._id ? "..." : "Approve"}
                                      </button>
                                      <button
                                          onClick={() => setRejectModal({ open: true, doctorId: doc._id })}
                                          disabled={actionLoadingId === doc._id}
                                          className="text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.3)] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          Reject
                                      </button>
                                  </>
                              ) : (
                                  <button
                                      onClick={() => handleResetToPending(doc._id)}
                                      disabled={actionLoadingId === doc._id}
                                      className="text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-warning-bg))] hover:text-[hsl(var(--color-warning))] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                      {actionLoadingId === doc._id ? "..." : "Reset"}
                                  </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="lg:hidden flex flex-col gap-4 py-2">
                  {filtered.map((doc, index) => {
                    const sc = statusConfig[doc.status];
                    const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
                    const avatarStyle = avatarStyles[index % avatarStyles.length];
                    return (
                      <div key={doc._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm">
                        {/* Card Header: Avatar, Name, Status */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${avatarStyle}`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">{doc.fullName}</p>
                              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">{doc.email}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${sc.style}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </div>
                        
                        {/* Card Body: Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                          <div>
                            <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Specialty</p>
                            <p className="font-semibold text-[hsl(var(--color-text))]">{doc.specialty ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Submitted</p>
                            <p className="font-semibold text-[hsl(var(--color-text))]">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-2 flex items-center gap-3 mt-1 pt-2 border-t border-[hsl(var(--color-border-soft))]">
                            <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Docs:</span>
                            {doc.licenseUrl && (
                              <button onClick={() => setLicenseModal({ open: true, url: doc.licenseUrl ?? null })} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                                <LuEye className="text-[12px]"/> License
                              </button>
                            )}
                            {doc.nationalIdUrl && (
                              <button onClick={() => setLicenseModal({ open: true, url: doc.nationalIdUrl ?? null })} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                                <LuEye className="text-[12px]"/> ID
                              </button>
                            )}
                            {!doc.licenseUrl && !doc.nationalIdUrl && (
                              <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">—</span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Actions */}
                        <div className="flex items-center gap-2">
                          {doc.status === "pending" ? (
                              <>
                                  <button onClick={() => handleApprove(doc._id)} disabled={actionLoadingId === doc._id} className="flex-1 text-[12px] font-bold py-2 rounded-[10px] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-primary hover:text-white transition-all disabled:opacity-50 border border-[hsl(var(--color-primary)/0.2)]">Approve</button>
                                  <button onClick={() => setRejectModal({ open: true, doctorId: doc._id })} disabled={actionLoadingId === doc._id} className="flex-1 text-[12px] font-bold py-2 rounded-[10px] border border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] transition-all disabled:opacity-50 bg-[hsl(var(--color-bg-surface))]">Reject</button>
                              </>
                          ) : (
                              <button onClick={() => handleResetToPending(doc._id)} disabled={actionLoadingId === doc._id} className="w-full text-[12px] font-bold py-2 rounded-[10px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-warning-bg))] hover:text-[hsl(var(--color-warning))] transition-all disabled:opacity-50 bg-[hsl(var(--color-bg-surface))]">Reset to Pending</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRejectModal({ open: false, doctorId: null })}
        >
          <div
            className="bg-[hsl(var(--color-bg-surface))] rounded-2xl shadow-xl w-[90vw] max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[14px] font-black text-[hsl(var(--color-text))] mb-1">Reject Doctor</h2>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] mb-4">Please provide a reason for rejection.</p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2.5 text-[12px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-danger)/0.5)] transition-colors resize-none"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setRejectModal({ open: false, doctorId: null }); setRejectReason(""); }}
                className="flex-1 text-[11px] font-bold py-2 rounded-[9px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || !!actionLoadingId}
                className="flex-1 text-[11px] font-bold py-2 rounded-[9px] bg-[hsl(var(--color-danger))] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoadingId ? "..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* License Modal */}
      <LicenseViewerModal
        isOpen={licenseModal.open}
        onClose={() => setLicenseModal({ open: false, url: null })}
        fileUrl={licenseModal.url}
      />
    </>
  );
}
