import React from "react";
import { LuInbox, LuEye } from "react-icons/lu";
import { Doctor, DoctorApprovalStatus } from "@/types/doctor";

// --- Helpers & Configs ---
export const statusConfig: Record<
  DoctorApprovalStatus,
  { style: string; label: string }
> = {
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

export function pickAvatar(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_STYLES[sum % AVATAR_STYLES.length];
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[hsl(var(--color-border-soft))]">
      {[75, 60, 45, 35, 40, 30, 30].map((w, i) => (
        <td key={i} className="py-3 pe-4">
          <div
            className="h-3 rounded-full bg-[hsl(var(--color-bg-soft))] animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

interface DoctorsListProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  debouncedSearch: string;
  statusFilter: string;
  setSearch: (val: string) => void;
  setModal: (val: { open: boolean; url: string | null }) => void;
}

export default function DoctorsList({
  doctors,
  isLoading,
  error,
  debouncedSearch,
  statusFilter,
  setSearch,
  setModal,
}: DoctorsListProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Desktop Table */}
      <table className="w-full min-w-[680px] hidden lg:table">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {[
              "Doctor",
              "Specialty",
              "Email",
              "Status",
              "Joined",
              "License",
              "National ID",
            ].map((h, i) => (
              <th
                key={h}
                className={`pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] ${
                  i >= 5 ? "text-center px-2" : "text-start pe-4"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Loading skeleton */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

          {/* Empty state */}
          {!isLoading && !error && doctors.length === 0 && (
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
            doctors.map((doc) => {
              const sc = statusConfig[doc.status] ?? statusConfig.pending;
              return (
                <tr
                  key={doc._id}
                  className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                >
                  <td className="py-3.5 pe-4 text-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${pickAvatar(
                          doc._id
                        )}`}
                      >
                        {getInitials(doc.fullName)}
                      </div>
                      <p className="text-[14px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap">
                        {doc.fullName}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 pe-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-start">
                    {doc.specialty ?? "—"}
                  </td>

                  <td className="py-3.5 pe-4 max-w-[170px] text-start">
                    <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
                      {doc.email}
                    </p>
                  </td>

                  <td className="py-3.5 pe-4 text-start">
                    <span
                      className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${sc.style}`}
                    >
                      {sc.label}
                    </span>
                  </td>

                  <td className="py-3.5 pe-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap text-start">
                    {fmtDate(doc.createdAt)}
                  </td>

                  <td className="py-3.5 pe-4 text-center">
                    {doc.licenseUrl ? (
                      <button
                        onClick={() =>
                          setModal({ open: true, url: doc.licenseUrl ?? null })
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

                  <td className="py-3.5 text-center">
                    {doc.nationalIdUrl ? (
                      <button
                        onClick={() =>
                          setModal({ open: true, url: doc.nationalIdUrl ?? null })
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
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] h-32 animate-pulse"
            />
          ))}

        {!isLoading && !error && doctors.length === 0 && (
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

        {!isLoading &&
          doctors.map((doc) => {
            const sc = statusConfig[doc.status] ?? statusConfig.pending;
            return (
              <div
                key={doc._id}
                className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${pickAvatar(
                        doc._id
                      )}`}
                    >
                      {getInitials(doc.fullName)}
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

                <div className="grid grid-cols-2 gap-3 text-[12px] bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
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
                      Joined
                    </p>
                    <p className="font-semibold text-[hsl(var(--color-text))]">
                      {fmtDate(doc.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 mt-1 pt-2 border-t border-[hsl(var(--color-border-soft))]">
                    <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
                      Docs:
                    </span>
                    {doc.licenseUrl && (
                      <button
                        onClick={() =>
                          setModal({ open: true, url: doc.licenseUrl ?? null })
                        }
                        className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline cursor-pointer"
                      >
                        <LuEye className="text-[12px]" /> License
                      </button>
                    )}
                    {doc.nationalIdUrl && (
                      <button
                        onClick={() =>
                          setModal({
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
              </div>
            );
          })}
      </div>
    </div>
  );
}
