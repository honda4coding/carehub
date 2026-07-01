import React from "react";
import { LuCheck, LuX, LuClock, LuEye } from "react-icons/lu";
import { Button } from "@/components/ui/Button";

type ApprovalStatus = "pending" | "approved" | "rejected";

export interface DoctorApproval {
  _id: string;
  fullName: string;
  email: string;
  status: ApprovalStatus;
  specialty?: string | null;
  licenseUrl?: string;
  nationalIdUrl?: string;
  createdAt: string;
}

export const statusConfig: Record<
  ApprovalStatus,
  { style: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Pending",
    icon: <LuClock className="text-[10px]" />,
  },
  approved: {
    style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    label: "Approved",
    icon: <LuCheck className="text-[10px]" />,
  },
  rejected: {
    style: "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text))]",
    label: "Rejected",
    icon: <LuX className="text-[10px]" />,
  },
};

const avatarStyles = [
  "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  "bg-[hsl(var(--color-indigo-bg))] text-[hsl(var(--color-indigo))]",
];

interface ApprovalsListProps {
  doctors: DoctorApproval[];
  loading: boolean;
  actionLoadingId: string | null;
  setLicenseModal: (val: { open: boolean; url: string | null }) => void;
  setRejectModal: (val: { open: boolean; doctorId: string | null }) => void;
  handleApprove: (id: string) => void;
  handleResetToPending: (id: string) => void;
}

export default function ApprovalsList({
  doctors,
  loading,
  actionLoadingId,
  setLicenseModal,
  setRejectModal,
  handleApprove,
  handleResetToPending,
}: ApprovalsListProps) {
  if (loading) {
    return (
      <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
        Loading...
      </p>
    );
  }

  if (doctors.length === 0) {
    return (
      <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
        No doctors found
      </p>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <table className="w-full min-w-[620px] hidden lg:table">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {[
              "Doctor",
              "Specialty",
              "Submitted",
              "Status",
              "License",
              "National ID",
              "Actions",
            ].map((h) => (
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
          {doctors.map((doc, index) => {
            const sc = statusConfig[doc.status];
            const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
            const avatarStyle = avatarStyles[index % avatarStyles.length];
            return (
              <tr
                key={doc._id}
                className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
              >
                <td className="py-3.5 pr-4 text-left">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${avatarStyle}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap leading-tight">
                        {doc.fullName}
                      </p>
                      <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 truncate max-w-[170px]">
                        {doc.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-left">
                  {doc.specialty ?? "—"}
                </td>

                <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-left">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>

                <td className="py-3.5 pr-4 text-left">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                  >
                    {sc.label}
                  </span>
                </td>

                <td className="py-3.5 pr-4 text-left">
                  {doc.licenseUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLicenseModal({ open: true, url: doc.licenseUrl ?? null })
                      }
                      icon={LuEye}
                      className="!text-[11px] !px-2 !py-1 !h-auto !rounded-[7px] text-[hsl(var(--color-text-muted))] border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-[hsl(var(--color-primary-strong))] hover:border-[hsl(var(--color-primary)/0.3)]"
                    >
                      View
                    </Button>
                  ) : (
                    <span className="text-[13px] text-[hsl(var(--color-text-muted))]">
                      —
                    </span>
                  )}
                </td>

                <td className="py-3.5 pr-4 text-left">
                  {doc.nationalIdUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLicenseModal({
                          open: true,
                          url: doc.nationalIdUrl ?? null,
                        })
                      }
                      icon={LuEye}
                      className="!text-[11px] !px-2 !py-1 !h-auto !rounded-[7px] text-[hsl(var(--color-text-muted))] border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-[hsl(var(--color-primary-strong))] hover:border-[hsl(var(--color-primary)/0.3)]"
                    >
                      View
                    </Button>
                  ) : (
                    <span className="text-[13px] text-[hsl(var(--color-text-muted))]">
                      —
                    </span>
                  )}
                </td>

                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-1.5 w-[140px]">
                    {doc.status === "pending" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(doc._id)}
                          disabled={actionLoadingId === doc._id}
                          isLoading={actionLoadingId === doc._id}
                          className="flex-1 !text-[11px] !px-0 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)]"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRejectModal({ open: true, doctorId: doc._id })
                          }
                          disabled={actionLoadingId === doc._id}
                          className="flex-1 !text-[11px] !px-0 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-danger))] border-[hsl(var(--color-danger)/0.3)] hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.5)]"
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetToPending(doc._id)}
                        disabled={actionLoadingId === doc._id}
                        isLoading={actionLoadingId === doc._id}
                        className="w-full !text-[11px] !px-0 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-warning))] border-[hsl(var(--color-warning)/0.3)] hover:bg-[hsl(var(--color-warning-bg))] hover:text-[hsl(var(--color-warning))] hover:border-[hsl(var(--color-warning)/0.5)]"
                      >
                        Reset
                      </Button>
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
        {doctors.map((doc, index) => {
          const sc = statusConfig[doc.status];
          const initials = (doc.fullName ?? "??").slice(0, 2).toUpperCase();
          const avatarStyle = avatarStyles[index % avatarStyles.length];
          return (
            <div
              key={doc._id}
              className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${avatarStyle}`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">
                      {doc.fullName}
                    </p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                      {doc.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${sc.style}`}
                >
                  {sc.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                <div>
                  <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">
                    Specialty
                  </p>
                  <p className="font-semibold text-[hsl(var(--color-text))]">
                    {doc.specialty ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">
                    Submitted
                  </p>
                  <p className="font-semibold text-[hsl(var(--color-text))]">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2 flex items-center gap-3 mt-1 pt-2 border-t border-[hsl(var(--color-border-soft))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
                    Docs:
                  </span>
                  {doc.licenseUrl && (
                    <button
                      onClick={() =>
                        setLicenseModal({ open: true, url: doc.licenseUrl ?? null })
                      }
                      className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer"
                    >
                      <LuEye className="text-[12px]" /> License
                    </button>
                  )}
                  {doc.nationalIdUrl && (
                    <button
                      onClick={() =>
                        setLicenseModal({
                          open: true,
                          url: doc.nationalIdUrl ?? null,
                        })
                      }
                      className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer"
                    >
                      <LuEye className="text-[12px]" /> ID
                    </button>
                  )}
                  {!doc.licenseUrl && !doc.nationalIdUrl && (
                    <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                      —
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.status === "pending" ? (
                  <>
                    <Button
                      onClick={() => handleApprove(doc._id)}
                      isLoading={actionLoadingId === doc._id}
                      disabled={actionLoadingId === doc._id}
                      className="flex-1 text-[12px] !py-2 !h-auto !rounded-[10px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)]"
                      variant="outline"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        setRejectModal({ open: true, doctorId: doc._id })
                      }
                      disabled={actionLoadingId === doc._id}
                      className="flex-1 text-[12px] !py-2 !h-auto !rounded-[10px] text-[hsl(var(--color-danger))] border-[hsl(var(--color-danger)/0.3)] hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.5)]"
                      variant="outline"
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleResetToPending(doc._id)}
                    isLoading={actionLoadingId === doc._id}
                    disabled={actionLoadingId === doc._id}
                    className="w-full text-[12px] !py-2 !h-auto !rounded-[10px] text-[hsl(var(--color-warning))] border-[hsl(var(--color-warning)/0.3)] hover:bg-[hsl(var(--color-warning-bg))] hover:text-[hsl(var(--color-warning))] hover:border-[hsl(var(--color-warning)/0.5)]"
                    variant="outline"
                  >
                    Reset to Pending
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
