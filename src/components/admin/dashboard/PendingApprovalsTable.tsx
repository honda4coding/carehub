import React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LuSearch, LuClock, LuCheck, LuX, LuChevronRight } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoctorApprovalStatus, PendingDoctorRequest } from "@/types/doctor";
import { Badge } from "@/components/ui/Badge";

const statusConfig: Record<
  DoctorApprovalStatus,
  { variant: "warning" | "success" | "danger"; label: string; icon: React.ReactNode }
> = {
  pending: {
    variant: "warning",
    label: "Pending",
    icon: <LuClock className="text-[14px]" />,
  },
  approved: {
    variant: "success",
    label: "Approved",
    icon: <LuCheck className="text-[14px]" />,
  },
  rejected: {
    variant: "danger",
    label: "Rejected",
    icon: <LuX className="text-[14px]" />,
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
  loading?: boolean;
  filter: string;
  setFilter: (f: string) => void;
  layout?: 'auto' | 'cards';
}

export default function PendingApprovalsTable({
  requests,
  loading = false,
  filter,
  setFilter,
  layout = 'auto',
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
      <div className="p-6 border-b border-[hsl(var(--color-border))] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--color-text))] whitespace-nowrap shrink-0">
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
            className="w-full sm:w-[220px] bg-[hsl(var(--color-bg-soft))] focus:bg-[hsl(var(--color-bg-surface))] text-sm font-medium"
          />
          <Link
            href="/admin/approvals"
            className="text-sm font-medium font-medium text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-strong))] whitespace-nowrap transition-colors"
          >
            View all ›
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="py-12 flex justify-center">
            <p className="text-sm font-medium font-bold text-[hsl(var(--color-text-muted))]">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 flex justify-center">
            <p className="text-sm font-medium font-bold text-[hsl(var(--color-text-muted))]">No pending requests</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            {layout === 'auto' && (
              <div className="overflow-x-auto w-full hidden xl:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-[hsl(var(--color-bg-soft))]">
                      {["Doctor", "Specialty", "Phone", "Submitted", "Status"].map((h, i) => (
                        <th
                          key={h}
                          className={`py-4 text-sm font-semibold text-[hsl(var(--color-text))] uppercase tracking-wider ${i === 0 ? 'pl-[80px] pr-4 text-left' : i === 4 ? 'px-8 text-center border-l-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft)/0.5)]' : 'px-4 text-left'}`}
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
                          <td className="pl-8 pr-4 py-3.5">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 shadow-sm ${avatarStyle}`}
                              >
                                {initials}
                              </div>
                              <div>
                                <p className="text-[15px] font-bold text-[hsl(var(--color-text))] whitespace-nowrap group-hover:text-[hsl(var(--color-primary))] transition-colors">
                                  {req.fullName}
                                </p>
                                <p className="text-sm font-medium font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                                  {req.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-left text-[14px] font-bold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {req.specialty ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 text-left text-[14px] font-bold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {req.phoneNumber ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 text-left text-[14px] font-bold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-3.5 text-center border-l-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft)/0.2)] group-hover:bg-transparent transition-colors">
                            <Badge variant={sc.variant} className="gap-1.5 px-3 py-1.5 text-[11px] lowercase capitalize shadow-sm inline-flex">
                              {sc.icon} {sc.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Card View */}
            <div className={`${layout === 'auto' ? 'xl:hidden ' : ''}flex flex-col gap-3 p-4`}>
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
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 shadow-sm ${avatarStyle}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[hsl(var(--color-text))] leading-tight mb-0.5">{req.fullName}</p>
                          <p className="text-sm font-medium font-semibold text-[hsl(var(--color-text-muted))]">{req.email}</p>
                        </div>
                      </div>
                      <Badge variant={sc.variant} className="gap-1.5 px-2.5 py-1 text-[10px] lowercase capitalize shadow-sm">
                        {sc.icon} {sc.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-[hsl(var(--color-border-soft))] text-[12px]">
                      <div className="flex flex-col gap-1">
                        <div>
                          <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mr-1.5">Specialty:</span>
                          <span className="font-bold text-[hsl(var(--color-text))]">{req.specialty ?? "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mr-1.5">Phone:</span>
                          <span className="font-bold text-[hsl(var(--color-text))]">{req.phoneNumber ?? "—"}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[hsl(var(--color-text-muted))]">
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
