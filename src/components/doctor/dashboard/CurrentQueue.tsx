import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuSearch, LuSmartphone, LuX, LuShieldCheck, LuEye, LuInbox, LuLock, LuCheck } from "react-icons/lu";
import { CountdownTimer } from "./OTPComponents";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const statusConfig: Record<string, { style: string; label: string }> = {
  pending_otp: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Pending OTP",
  },
  in_progress: {
    style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    label: "In Progress",
  },
  completed: {
    style: "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]",
    label: "Completed",
  },
};

const ITEMS_PER_PAGE = 10;

export const CurrentQueue = ({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  filter,
  setFilter,
  filteredSessions,
  handleCancelRequest,
  setSelectedSession,
  setOTPModalOpen,
  handleReorder,
  handleUpdateFees,
  isAssistant,
  onRecordVitals,
  hideVitalsAction = false,
  hideAssessmentAction = false,
  hideFees = false,
}: {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
  filteredSessions: any[];
  handleCancelRequest?: (id: string) => void;
  setSelectedSession?: (s: any) => void;
  setOTPModalOpen?: (v: boolean) => void;
  handleReorder?: (draggedId: string, targetId: string) => void;
  handleUpdateFees?: (id: string, fees: number, isFinalized: boolean) => void;
  isAssistant?: boolean;
  onRecordVitals?: (s: any) => void;
  hideVitalsAction?: boolean;
  hideAssessmentAction?: boolean;
  hideFees?: boolean;
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const canManagePatientsFull = user?.permissions?.canManagePatientsFull;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, filter]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
      {/* Card Header & Filters */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div>
            <h2 className="text-[14px] font-black uppercase tracking-[.05em] text-[hsl(var(--color-text))]">Current Queue</h2>
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">Patients currently registered or in consultation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap pb-1 lg:pb-0">
          <div className="relative flex items-center border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-[8px] p-0.5 flex-1 min-w-[200px] md:min-w-[300px] max-w-full focus-within:border-[hsl(var(--color-primary)/0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.1)] transition-all">
            <LuSearch className="ml-2 text-[13px] text-[hsl(var(--color-text-muted))] shrink-0" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-[12px] font-medium py-1.5 px-2 text-[hsl(var(--color-text))]"
            />
          </div>

          <div className="flex items-center bg-[hsl(var(--color-bg-soft))] p-1 rounded-[8px] border border-[hsl(var(--color-border))] shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-[12px] font-bold rounded-[8px] bg-transparent text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <option value="All">All Status</option>
              <option value="pending_otp">Pending OTP</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center bg-[hsl(var(--color-bg-soft))] p-1 rounded-[8px] border border-[hsl(var(--color-border))] shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 text-[12px] font-bold rounded-[6px] bg-transparent text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <option value="all">All Types</option>
              <option value="walk_in">Walk-in</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Desktop View: Table */}
        <table className="w-full hidden lg:table">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              {["Patient", "Phone", "Type", "Time", "Status", "Actions"].map((h) => (
                <th 
                  key={h}
                  className="py-3.5 pr-2 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--color-text-muted)/0.7)]"
                >
                  {h}
                </th>
              ))}
              {!hideFees && (
                <th className="py-3.5 pr-2 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--color-text-muted)/0.7)]">
                  Fees
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedSessions.length === 0 ? (
              <tr>
                <td colSpan={hideFees ? 6 : 7} className="py-16 text-center">
                  <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
                  <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                    No patients found in queue.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedSessions.map((s: any) => {
                const sc = statusConfig[s.status];
                return (
                  <tr
                    key={s.id}
                    className="border-b border-[hsl(var(--color-border-soft))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 pr-2 text-left">
                      <div className="flex items-center gap-3">

                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${s.avatarStyle}`}>
                          {s.initials}
                        </div>
                        <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight whitespace-nowrap truncate">
                          {s.patient}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-left whitespace-nowrap">
                      {s.phone || "App User"}
                    </td>

                    <td className="py-3.5 pr-2 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-left whitespace-nowrap">
                      {s.type}
                    </td>

                    <td className="py-3.5 pr-2 text-left whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">{s.queueTime || s.time}</span>
                        {s.scheduledTime && (
                          <span className="text-[10px] bg-[hsl(var(--color-bg-soft))] px-1.5 py-0.5 rounded-md inline-block w-fit text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]">
                            Slot: {s.scheduledTime}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 pr-2 text-left whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${sc.style}`}>
                        {s.status === "pending_otp" && <LuSmartphone className="mr-1.5 text-[12px]" />}
                        {sc.label}
                      </span>
                      {s.status === "pending_otp" && s.validUntil && (
                        <div className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] mt-1 ml-1">
                          <CountdownTimer targetTime={s.validUntil} />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 text-left whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isAssistant ? (
                          <>
                            {!hideVitalsAction && (user?.permissions?.canManagePatientsVitals || user?.permissions?.canManagePatientsFull || user?.permissions?.canManagePatients) && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onRecordVitals && onRecordVitals(s)}
                                className="!text-[11px] !px-3 !h-[32px] !rounded-lg bg-[hsl(var(--color-primary)/0.1)] !text-[hsl(var(--color-primary))] hover:!bg-[hsl(var(--color-primary))]"
                              >
                                Update Vitals
                              </Button>
                            )}
                            {!hideAssessmentAction && canManagePatientsFull && (
                              <Button
                                size="sm"
                                icon={LuEye}
                                onClick={() => router.push(`/${isAssistant ? 'assistant' : 'doctor'}/encounter/${s.id}`)}
                                className="!text-[11px] !px-3 !h-[32px] !rounded-lg"
                              >
                                Open File
                              </Button>
                            )}
                          </>
                        ) : s.status === "pending_otp" ? (
                          <>
                            <button
                              onClick={() => handleCancelRequest && handleCancelRequest(s.id)}
                              className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] transition-colors cursor-pointer"
                              title="Cancel Request"
                            >
                              <LuX className="text-[16px]" />
                            </button>
                            <Button
                              size="sm"
                              icon={LuShieldCheck}
                              onClick={() => {
                                setSelectedSession && setSelectedSession(s.id);
                                setOTPModalOpen && setOTPModalOpen(true);
                              }}
                              className="!bg-[hsl(var(--color-warning-bg))] !text-[hsl(var(--color-warning))] hover:!bg-[hsl(var(--color-warning)/0.2)] !text-[11px] !px-3 !h-[32px] !rounded-lg"
                            >
                              Enter OTP
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            icon={LuEye}
                            onClick={() => router.push(`/doctor/encounter/${s.id}`)}
                            className="!text-[11px] !px-3 !h-[32px] !rounded-lg"
                          >
                            Open File
                          </Button>
                        )}
                      </div>
                    </td>
                    {!hideFees && (
                      <td className="py-3.5 pr-2 text-left">
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const feeInput = e.currentTarget.elements.namedItem('feeInput') as HTMLInputElement;
                              let feeValue = Number(feeInput.value);
                              if (s.isFeesFinalized && feeValue < s.fees) {
                                feeValue = s.fees; // force minimum
                                feeInput.value = String(s.fees);
                              }
                              if (handleUpdateFees && !isNaN(feeValue)) {
                                handleUpdateFees(s.id, feeValue, false);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <div className="relative group">
                              <input 
                                type="number" 
                                name="feeInput"
                                defaultValue={s.fees}
                                min={s.isFeesFinalized ? s.fees : 0}
                                className="w-20 px-2 py-1 text-sm rounded border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] disabled:opacity-50"
                              />
                              {s.isFeesFinalized && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                                  Paid Online. Can only increase.
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button 
                                type="submit" 
                                size="sm" 
                                className="h-6 text-[10px] px-2 py-0"
                              >
                                Save
                              </Button>
                              <Button 
                                type="button" 
                                size="sm"
                                variant="primary"
                                className="h-6 text-[10px] px-2 py-0 flex items-center gap-1"
                                disabled={s.isFeesFinalized}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const feeValue = Number((e.currentTarget.closest('form')?.elements.namedItem('feeInput') as HTMLInputElement).value);
                                  if (handleUpdateFees && !isNaN(feeValue)) {
                                    handleUpdateFees(s.id, feeValue, true);
                                  }
                                }}
                              >
                                <LuCheck size={10} /> Finish
                              </Button>
                            </div>
                          </form>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile View: Cards */}
        <div className="lg:hidden flex flex-col gap-3 py-2">
          {paginatedSessions.length === 0 ? (
            <div className="py-16 text-center">
              <LuInbox className="mx-auto text-[36px] text-[hsl(var(--color-text-muted))] opacity-30 mb-3" />
              <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                No patients found in queue.
              </p>
            </div>
          ) : (
            paginatedSessions.map((s: any) => {
              const sc = statusConfig[s.status];
              return (
                <div key={s.id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${s.avatarStyle}`}>
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[hsl(var(--color-text))] leading-tight">{s.patient}</p>
                        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
                          {s.phone || "App User"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold bg-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] px-2 py-0.5 rounded-md block mb-1">
                        {s.type}
                      </span>
                      <p className="text-[11px] font-bold text-[hsl(var(--color-text))]">{s.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--color-border-soft))]">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.style}`}>
                        {s.status === "pending_otp" && <LuSmartphone className="mr-1 text-[11px]" />}
                        {sc.label}
                      </span>
                      {s.status === "pending_otp" && s.validUntil && (
                        <div className="text-[9px] font-semibold text-[hsl(var(--color-text-muted))] mt-1 ml-1">
                          <CountdownTimer targetTime={s.validUntil} />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 shrink-0">
                      {isAssistant ? (
                        <>
                          {!hideVitalsAction && (user?.permissions?.canManagePatientsVitals || user?.permissions?.canManagePatientsFull || user?.permissions?.canManagePatients) && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onRecordVitals && onRecordVitals(s)}
                              className="!text-[10px] !px-2 !py-1 !h-auto !rounded-lg bg-[hsl(var(--color-primary)/0.1)] !text-[hsl(var(--color-primary))] hover:!bg-[hsl(var(--color-primary))]"
                            >
                              Update Vitals
                            </Button>
                          )}
                          {!hideAssessmentAction && canManagePatientsFull && (
                            <Button
                              size="sm"
                              icon={LuEye}
                              onClick={() => router.push(`/assistant/encounter/${s.id}`)}
                              className="!text-[10px] !px-2 !py-1 !h-auto !rounded-lg"
                            >
                              Open File
                            </Button>
                          )}
                        </>
                      ) : s.status === "pending_otp" ? (
                        <>
                          <button
                            onClick={() => handleCancelRequest?.(s.id)}
                            className="w-[28px] h-[28px] rounded-lg flex items-center justify-center bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] hover:opacity-80 transition-colors"
                            title="Cancel Request"
                          >
                            <LuX className="text-[14px]" />
                          </button>
                          <Button
                            size="sm"
                            icon={LuShieldCheck}
                            onClick={() => {
                              setSelectedSession?.(s.id);
                              setOTPModalOpen?.(true);
                            }}
                            className="!bg-[hsl(var(--color-warning-bg))] !text-[hsl(var(--color-warning))] hover:!bg-[hsl(var(--color-warning)/0.2)] !text-[10px] !px-2 !py-1 !h-auto !rounded-lg"
                          >
                            Enter OTP
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          icon={LuEye}
                          onClick={() => router.push(`/doctor/encounter/${s.id}`)}
                          className="!text-[10px] !px-2 !py-1 !h-auto !rounded-lg"
                        >
                          Open File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
