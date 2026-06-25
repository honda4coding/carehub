"use client";

import Image from "next/image";
import { useState } from "react";
import {
  LuEye, LuCheck, LuX, LuClock, LuShieldCheck, LuHistory,
} from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";
import { PendingLicenseDoctor } from "@/services/adminService";
import LicenseViewerModal from "@/components/modals/LicenseViewerModal";
import RejectLicenseModal from "@/components/admin/licenses/RejectLicenseModal";

const avatarColors = [
  "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  "bg-[hsl(var(--color-indigo-bg))] text-[hsl(var(--color-indigo))]",
];

interface Props {
  doctors: PendingLicenseDoctor[];
  loading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export default function LicensePendingList({ doctors, loading, onApprove, onReject }: Props) {
  const [actionId, setActionId]           = useState<string | null>(null);
  const [viewModal, setViewModal]         = useState<{ open: boolean; url: string | null; title: string }>({ open: false, url: null, title: "" });
  const [rejectModal, setRejectModal]     = useState<{ open: boolean; doctorId: string | null }>({ open: false, doctorId: null });

  const handleApprove = async (id: string) => {
    setActionId(id);
    await onApprove(id);
    setActionId(null);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectModal.doctorId) return;
    setActionId(rejectModal.doctorId);
    await onReject(rejectModal.doctorId, reason);
    setActionId(null);
    setRejectModal({ open: false, doctorId: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <ImSpinner2 className="w-6 h-6 animate-spin text-[hsl(var(--color-primary))]" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LuShieldCheck className="w-10 h-10 text-[hsl(var(--color-success))]" />
        <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
          No pending license updates
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop Table ────────────────────────────────────────────────────── */}
      <table className="w-full min-w-[700px] hidden lg:table">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {["Doctor", "Specialty", "Submitted", "Current License", "New License", "Actions"].map((h) => (
              <th
                key={h}
                className="pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] text-left pr-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc, i) => {
            const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
            const avatarStyle = avatarColors[i % avatarColors.length];
            const isActing = actionId === doc.userId;

            return (
              <tr
                key={doc._id}
                className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
              >
                {/* Doctor */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${avatarStyle}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">{doc.fullName}</p>
                      <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] truncate max-w-[160px]">{doc.email}</p>
                    </div>
                  </div>
                </td>

                {/* Specialty */}
                <td className="py-4 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                  {doc.specialty ?? "—"}
                </td>

                {/* Submitted */}
                <td className="py-4 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </td>

                {/* Current license */}
                <td className="py-4 pr-4">
                  {doc.licenseimage?.secure_url ? (
                    <button
                      onClick={() => setViewModal({ open: true, url: doc.licenseimage!.secure_url, title: "Current License" })}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))] px-2.5 py-1.5 rounded-[8px] hover:bg-[hsl(var(--color-bg-soft))] hover:border-[hsl(var(--color-primary)/0.3)] hover:text-[hsl(var(--color-primary))] transition-all"
                    >
                      <LuHistory className="w-3 h-3" /> View
                    </button>
                  ) : (
                    <span className="text-[12px] text-[hsl(var(--color-text-muted))]">—</span>
                  )}
                </td>

                {/* New pending license */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    {/* Thumbnail */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[hsl(var(--color-border))] shrink-0 bg-[hsl(var(--color-bg-soft))]">
                      <Image src={doc.pendingLicenseImage.secure_url} alt="pending" fill className="object-cover" />
                    </div>
                    <button
                      onClick={() => setViewModal({ open: true, url: doc.pendingLicenseImage.secure_url, title: "New License (Pending)" })}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-primary)/0.06)] px-2.5 py-1.5 rounded-[8px] hover:bg-[hsl(var(--color-primary)/0.12)] transition-all"
                    >
                      <LuEye className="w-3 h-3" /> View
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleApprove(doc.userId)}
                      disabled={!!actionId}
                      className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-[hsl(var(--color-success)/0.3)] text-[hsl(var(--color-success))] bg-[hsl(var(--color-success-bg))] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isActing ? <ImSpinner2 className="w-3 h-3 animate-spin" /> : <LuCheck className="w-3 h-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ open: true, doctorId: doc.userId })}
                      disabled={!!actionId}
                      className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger-bg))] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <LuX className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Mobile Cards ─────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col gap-4 py-2">
        {doctors.map((doc, i) => {
          const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
          const avatarStyle = avatarColors[i % avatarColors.length];
          const isActing = actionId === doc.userId;

          return (
            <div key={doc._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${avatarStyle}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">{doc.fullName}</p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{doc.email}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]">
                  <LuClock className="w-3 h-3" /> Pending
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                <div>
                  <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Specialty</p>
                  <p className="font-semibold text-[hsl(var(--color-text))]">{doc.specialty ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Submitted</p>
                  <p className="font-semibold text-[hsl(var(--color-text))]">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* License previews */}
              <div className="flex items-center gap-3 mb-4">
                {doc.licenseimage?.secure_url && (
                  <button
                    onClick={() => setViewModal({ open: true, url: doc.licenseimage!.secure_url, title: "Current License" })}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))] px-2.5 py-1.5 rounded-[8px] hover:bg-[hsl(var(--color-bg-soft))] transition-all"
                  >
                    <LuHistory className="w-3 h-3" /> Current
                  </button>
                )}
                <button
                  onClick={() => setViewModal({ open: true, url: doc.pendingLicenseImage.secure_url, title: "New License (Pending)" })}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-primary)/0.06)] px-2.5 py-1.5 rounded-[8px] hover:bg-[hsl(var(--color-primary)/0.12)] transition-all"
                >
                  <LuEye className="w-3 h-3" /> New License
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(doc.userId)}
                  disabled={!!actionId}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold py-2 rounded-[10px] border border-[hsl(var(--color-success)/0.3)] text-[hsl(var(--color-success))] bg-[hsl(var(--color-success-bg))] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isActing ? <ImSpinner2 className="w-3.5 h-3.5 animate-spin" /> : <LuCheck className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setRejectModal({ open: true, doctorId: doc.userId })}
                  disabled={!!actionId}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold py-2 rounded-[10px] border border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger-bg))] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <LuX className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <LicenseViewerModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, url: null, title: "" })}
        fileUrl={viewModal.url}
      />

      <RejectLicenseModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, doctorId: null })}
        onConfirm={handleRejectConfirm}
        isLoading={!!actionId}
      />
    </>
  );
}
