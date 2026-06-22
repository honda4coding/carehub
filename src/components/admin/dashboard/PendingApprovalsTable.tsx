import React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LuSearch, LuClock, LuCheck, LuX } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoctorApprovalStatus, PendingDoctorRequest } from "@/types/doctor";

const statusConfig: Record<
  DoctorApprovalStatus,
  { style: string; label: string; icon: React.ReactNode }
> = {
  pending: {
    style: "bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]",
    label: "Pending",
    icon: <LuClock className="text-[12px]" />,
  },
  approved: {
    style: "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]",
    label: "Approved",
    icon: <LuCheck className="text-[12px]" />,
  },
  rejected: {
    style: "bg-[hsl(var(--color-danger)/0.15)] text-[hsl(var(--color-danger))]",
    label: "Rejected",
    icon: <LuX className="text-[12px]" />,
  },
};

const avatarStyles = [
  "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
  "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]",
  "bg-[hsl(var(--color-danger)/0.15)] text-[hsl(var(--color-danger))]",
  "bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]",
];

export interface PendingApprovalsTableProps {
  requests: PendingDoctorRequest[];
  loading: boolean;
  filter: string;
  setFilter: (val: string) => void;
}

export function PendingApprovalsTable({
  requests,
  loading,
  filter,
  setFilter,
}: PendingApprovalsTableProps) {
  const router = useRouter();
  
  const filtered = requests.filter(
    (r) =>
      (r.fullName ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (r.specialty ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Card className="p-0 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-[hsl(var(--color-border))] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-[16px] md:text-[18px] font-bold text-[hsl(var(--color-text))]">
          Pending Doctor Approvals
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            size="sm"
            type="text"
            placeholder="Search doctors..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            leftIcon={<LuSearch />}
            className="w-full sm:w-[220px] bg-[hsl(var(--color-bg-soft))] focus:bg-[hsl(var(--color-bg-surface))] text-[13px]"
          />
          <Link
            href="/admin/approvals"
            className="text-[13px] font-bold text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-strong))] whitespace-nowrap transition-colors"
          >
            View all ›
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="py-12 flex justify-center">
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 flex justify-center">
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">No pending requests</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="w-full min-w-[700px] hidden lg:table">
              <thead>
                <tr className="bg-[hsl(var(--color-bg-soft))]">
                  {["Doctor", "Specialty", "Submitted", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className="px-6 py-3.5 text-[12px] font-bold text-[hsl(var(--color-text-muted))] text-left"
                      style={{ textAlign: i === 3 ? "right" : "left" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, index) => {
                  const sc = statusConfig[req.status];
                  const initials = (req.fullName ?? "??").slice(0, 2).toUpperCase();
                  const avatarStyle = avatarStyles[index % avatarStyles.length];
                  return (
                    <tr
                      key={req._id}
                      onClick={() => router.push("/admin/approvals")}
                      className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--color-bg-surface-hover))] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[13px] font-black shrink-0 shadow-sm ${avatarStyle}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap group-hover:text-[hsl(var(--color-primary))] transition-colors">
                              {req.fullName}
                            </p>
                            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                              {req.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                        {req.specialty ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[6px] whitespace-nowrap shadow-sm ${sc.style}`}
                        >
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden flex flex-col gap-3 p-4">
              {filtered.map((req, index) => {
                const sc = statusConfig[req.status];
                const initials = (req.fullName ?? "??").slice(0, 2).toUpperCase();
                const avatarStyle = avatarStyles[index % avatarStyles.length];
                
                return (
                  <div 
                    key={req._id} 
                    onClick={() => router.push("/admin/approvals")}
                    className="bg-[hsl(var(--color-bg-surface))] rounded-[16px] p-4 border border-[hsl(var(--color-border))] cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[13px] font-black shrink-0 ${avatarStyle}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight mb-0.5">{req.fullName}</p>
                          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{req.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-[6px] whitespace-nowrap shrink-0 ${sc.style}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-[hsl(var(--color-border-soft))] text-[12px]">
                      <div>
                        <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mr-1.5">Specialty:</span>
                        <span className="font-bold text-[hsl(var(--color-text))]">{req.specialty ?? "—"}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
