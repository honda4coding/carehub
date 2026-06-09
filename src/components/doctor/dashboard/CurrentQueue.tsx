import { useRouter } from "next/navigation";
import { LuSearch, LuSmartphone, LuX, LuShieldCheck, LuEye } from "react-icons/lu";
import { CountdownTimer } from "./OTPComponents";

const statusConfig: Record<string, { style: string; label: string }> = {
  pending_otp: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Awaiting OTP",
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
}: any) => {
  const router = useRouter();

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-[13px] font-black uppercase text-[hsl(var(--color-text))]">Current Queue</p>
          <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">Patients currently registered or in consultation</p>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-[11px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
          >
            <option value="All">All Status</option>
            <option value="pending_otp">Pending OTP</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2 py-1.5 text-[11px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
          >
            <option value="All">All Types</option>
            <option value="Online">Online</option>
            <option value="Walk-in">Walk-in</option>
          </select>

          <div className="relative">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-[11px] rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              {["Patient", "Type", "Time", "Status", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className="pb-3 text-[10px] font-black uppercase tracking-[.08em] text-[hsl(var(--color-text-muted))]"
                  style={{ textAlign: i === 4 ? "right" : "left" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredSessions.map((s: any) => {
              const sc = statusConfig[s.status];
              return (
                <tr key={s.id} className="border-b border-[hsl(var(--color-border-soft))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors group">
                  <td className="py-3 pl-2 rounded-l-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black ${s.avatarStyle}`}>
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[hsl(var(--color-text))]">{s.patient}</p>
                        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                          {s.phone || "App User"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3">
                     <span className="text-[11px] font-bold bg-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] px-2.5 py-1 rounded-md">
                       {s.type}
                     </span>
                  </td>

                  <td className="py-3 text-[12px] font-semibold text-[hsl(var(--color-text))]">
                    {s.time}
                  </td>

                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.style}`}>
                      {s.status === "pending_otp" && <LuSmartphone className="mr-1.5 text-[11px]" />}
                      {sc.label}
                    </span>
                    {s.status === "pending_otp" && s.validUntil && (
                      <div className="text-[9px] font-semibold text-[hsl(var(--color-text-muted))] mt-1.5 ml-1">
                        <CountdownTimer targetTime={s.validUntil} />
                      </div>
                    )}
                  </td>

                  <td className="py-3 pr-2 rounded-r-lg">
                    <div className="flex justify-end gap-2">
                      {s.status === "pending_otp" ? (
                        <>
                          <button 
                            onClick={() => handleCancelRequest(s.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] transition-colors"
                            title="Cancel Request"
                          >
                            <LuX className="text-[14px]" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSession(s.id);
                              setOTPModalOpen(true);
                            }}
                            className="text-[11px] font-bold px-4 py-1.5 rounded-lg bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] hover:opacity-80 transition-all flex items-center gap-1.5"
                          >
                            <LuShieldCheck className="text-[13px]" />
                            Enter OTP
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => router.push(`/doctor/encounter/${s.id}`)}
                          className="text-[11px] font-bold px-4 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-all flex items-center gap-1.5"
                        >
                          <LuEye className="text-[13px]" />
                          Open File
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
