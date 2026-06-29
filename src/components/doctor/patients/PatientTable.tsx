import React, { useState } from "react";
import { LuPhone, LuHistory, LuSearch, LuCalendar } from "react-icons/lu";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { useTranslations } from "next-intl";

interface PatientTableProps {
  patients: any[];
  loading: boolean;
  onViewHistory: (patient: any) => void;
}

export default function PatientTable({
  patients,
  loading,
  onViewHistory,
}: PatientTableProps) {
  const t = useTranslations("doctor.patientDirectory");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const totalPages = Math.ceil(patients.length / pageSize) || 1;
  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col flex-1 border border-[hsl(var(--color-border))]">
      {/* Mobile View: Cards */}
      <div className="lg:hidden flex flex-col p-4 gap-3 bg-[hsl(var(--color-bg-surface))]">
        {loading ? (
          <div className="py-12 text-center text-[hsl(var(--color-text-muted))]">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold">{t("loadingPatients")}</p>
          </div>
        ) : paginatedPatients.length > 0 ? (
          paginatedPatients.map((p) => {
            const name = p.isOfflinePatient ? p.guestName : p.fullName;
            const phone = p.isOfflinePatient ? p.guestPhone : p.phoneNumber;
            const avatarStyle = p.isOfflinePatient
              ? "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]"
              : "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]";
            const status = p.status || "active";

            return (
              <div
                key={p.id || p._id}
                className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-2xl p-4 flex flex-col gap-3 hover:border-[hsl(var(--color-primary)/0.3)] transition-colors "
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${avatarStyle}`}
                    >
                      {name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[hsl(var(--color-text))]">
                        {name}
                      </h3>
                      <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 mt-0.5">
                        <LuPhone className="text-xs" /> {phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={status === "active" ? "success" : "warning"}
                    className="text-[10px] lowercase capitalize px-2 py-1 "
                  >
                    {status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-[hsl(var(--color-bg-soft))] p-2.5 rounded-xl border border-[hsl(var(--color-border))] border-dashed">
                    <p className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-wider mb-1">
                      {t("firstVisit")}
                    </p>
                    <p className="text-sm font-bold text-[hsl(var(--color-text))] flex items-center gap-1">
                      <LuCalendar className="text-[hsl(var(--color-primary))]" />
                      {p.firstVisit ? new Date(p.firstVisit).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="bg-[hsl(var(--color-bg-soft))] p-2.5 rounded-xl border border-[hsl(var(--color-border))] border-dashed">
                    <p className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-wider mb-1">
                      {t("lastVisit")}
                    </p>
                    <p className="text-sm font-bold text-[hsl(var(--color-text))] flex items-center gap-1">
                      <LuCalendar className="text-[hsl(var(--color-primary))]" />
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 ms-4">
                      {p.lastType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-1 border-t border-[hsl(var(--color-border-soft))]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">
                      {t("visits")}:
                    </span>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-sm font-black text-[hsl(var(--color-text))]">
                      {p.totalVisits}
                    </span>
                  </div>
                  <button
                    onClick={() => onViewHistory(p)}
                    className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary))] hover:text-white text-[hsl(var(--color-primary))] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5  cursor-pointer"
                  >
                    <LuHistory className="text-sm" /> {t("viewHistory")}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-[hsl(var(--color-text-muted))]">
            <LuSearch className="text-4xl mb-3 opacity-20 mx-auto" />
            <p className="text-base font-bold">{t("noPatientsFound")}</p>
            <p className="text-sm mt-1">{t("adjustFilters")}</p>
          </div>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block overflow-x-auto w-full flex-1 bg-[hsl(var(--color-bg-surface))]">
        <table className="w-full min-w-[900px] text-start border-collapse">
          <thead className="bg-[hsl(var(--color-bg-soft))] sticky top-0 z-10 border-b border-[hsl(var(--color-border))]">
            <tr>
              {[t("columns.patientDetails"), t("columns.firstVisit"), t("columns.lastVisit"), t("columns.visits"), t("columns.status"), t("columns.actions")].map((h, i) => (
                <th
                  key={h}
                  className={`py-4 text-sm font-black uppercase tracking-wider text-[hsl(var(--color-text))] border-b border-[hsl(var(--color-border))] ${
                    i === 0 ? "ps-8 pe-4" : i === 3 ? "text-center px-4" : i === 5 ? "pe-8 text-end" : "px-4"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--color-border))]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-[hsl(var(--color-text-muted))]">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold">{t("loadingPatients")}</p>
                </td>
              </tr>
            ) : paginatedPatients.length > 0 ? (
              paginatedPatients.map((p) => {
                const name = p.isOfflinePatient ? p.guestName : p.fullName;
                const phone = p.isOfflinePatient ? p.guestPhone : p.phoneNumber;
                const avatarStyle = p.isOfflinePatient
                  ? "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]"
                  : "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]";
                const status = p.status || "active";

                return (
                  <tr
                    key={p.id || p._id}
                    className="hover:bg-[hsl(var(--color-bg-surface-hover))] transition-colors group cursor-default"
                  >
                    <td className="ps-8 pe-4 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0  ${avatarStyle}`}
                        >
                          {name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                            {name}
                          </h3>
                          <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 mt-0.5">
                            <LuPhone className="text-xs" /> {phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">
                        {p.firstVisit ? new Date(p.firstVisit).toLocaleDateString() : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-bold text-[hsl(var(--color-text))]">
                          {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "N/A"}
                        </p>
                        <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mt-0.5">
                          {p.lastType}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-sm font-black text-[hsl(var(--color-text))]">
                        {p.totalVisits}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={status === "active" ? "success" : "warning"}
                        className="text-[11px] lowercase capitalize px-2.5 py-1.5  inline-flex"
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="pe-8 ps-4 py-4 text-end">
                      <button
                        onClick={() => onViewHistory(p)}
                        className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary))] hover:text-white text-[hsl(var(--color-primary))] text-xs font-bold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5 ms-auto cursor-pointer"
                      >
                        <LuHistory className="text-sm" /> {t("viewHistory")}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-[hsl(var(--color-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <LuSearch className="text-5xl mb-4 opacity-20" />
                    <p className="text-base font-bold">{t("noPatientsFound")}</p>
                    <p className="text-sm mt-1">{t("adjustFilters")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-2 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        {patients.length > 0 && totalPages <= 1 && (
          <div className="text-center py-2">
             <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">{t("showingAll", { count: patients.length })}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
