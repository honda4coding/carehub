"use client";

import DashboardHeader from "@/components/global/DashboardHeader";
import { LuBanknote, LuDownload, LuFilter, LuTrendingUp, LuHistory, LuLock, LuCheck } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { fetchClient } from "@/services/fetchClient";

export default function DoctorBillingPage() {
  const { role } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetchClient.get("/doctor/session?status=all");
        // Show all sessions for the day (active + completed) so fees can be updated anytime
        setSessions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleUpdateFees = async (id: string, fees: number, isFeesFinalized: boolean = false) => {
    try {
      await fetchClient.patch(`/doctor/session/${id}/fees`, { fees, isFeesFinalized });
      if (isFeesFinalized) {
        setSessions(sessions.filter(s => s._id !== id));
        alert("Fees finalized and session removed from billing queue");
      } else {
        setSessions(sessions.map(s => s._id === id ? { ...s, fees, isFeesFinalized } : s));
        alert("Fees updated successfully");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update fees");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
      <DashboardHeader 
        title="Billing & Transactions" 
        subtitle="Manage invoices and financial records" 
        backPath={`/${role}`} 
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center justify-between bg-[hsl(var(--color-bg-soft))]">
              <h2 className="text-lg font-black text-[hsl(var(--color-text))]">Completed Sessions (Needs Billing)</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-[hsl(var(--color-text-muted))]">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] flex items-center justify-center mb-4 text-[hsl(var(--color-text-muted))]">
                  <LuBanknote className="text-2xl" />
                </div>
                <h3 className="text-[15px] font-black text-[hsl(var(--color-text))]">No Completed Sessions Yet</h3>
                <p className="text-sm text-[hsl(var(--color-text-muted))] max-w-[250px] mt-2">
                  Patients who finish their consultation will appear here for billing.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--color-border))]">
                      <th className="py-3 pr-2 text-left text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Patient Name</th>
                      <th className="py-3 pr-2 text-left text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Phone Number</th>
                      <th className="py-3 pr-2 text-left text-xs font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Fees Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s._id} className="border-b border-[hsl(var(--color-border-soft))]">
                        <td className="py-4 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[hsl(var(--color-text))]">{s.isOfflinePatient ? s.guestName : s.patientId?.fullName || "App User"}</span>
                            {s.isFollowUp && (
                              <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-[hsl(var(--color-primary-bg))] text-[hsl(var(--color-primary))] rounded flex items-center gap-1">
                                Follow-Up
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-2 text-[hsl(var(--color-text-muted))]">{s.isOfflinePatient ? s.guestPhone || "N/A" : s.patientId?.phoneNumber || s.phone || "N/A"}</td>
                        <td className="py-4 pr-2">
                          {s.isFeesFinalized ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-lg opacity-70">
                              <LuLock className="text-[hsl(var(--color-text-muted))]" />
                              <span className="text-sm font-bold text-[hsl(var(--color-text))]">{s.fees || 0}</span>
                              <span className="text-[10px] uppercase font-black text-[hsl(var(--color-success))] ml-1 bg-[hsl(var(--color-success-bg))] px-1.5 py-0.5 rounded">Paid</span>
                            </div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const feeValue = Number((e.currentTarget.elements.namedItem('feeInput') as HTMLInputElement).value);
                                const isFinalized = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("name") === "finish";
                                handleUpdateFees(s._id, feeValue, isFinalized);
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                name="feeInput"
                                type="number"
                                min="0"
                                className="w-24 px-3 py-1.5 text-sm font-semibold border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                                defaultValue={s.fees || 0}
                              />
                              <button name="submit" type="submit" className="px-3 py-1.5 bg-[hsl(var(--color-primary))] text-white text-xs font-bold rounded-lg hover:bg-[hsl(var(--color-primary-strong))] transition-colors">
                                Submit
                              </button>
                              <button name="finish" type="submit" className="px-3 py-1.5 bg-[hsl(var(--color-success))] text-white text-xs font-bold rounded-lg hover:bg-[hsl(var(--color-success-strong))] transition-colors flex items-center gap-1">
                                <LuCheck className="text-sm" /> Finish
                              </button>
                              
                              {s.isFollowUp && s.appointmentId && (
                                <button 
                                  type="button" 
                                  onClick={async () => {
                                    if(confirm("Are you sure you want to cancel the follow-up discount for this patient? They will be charged full price.")) {
                                      try {
                                        await fetchClient.patch(`/appointmens/${s.appointmentId}/override-followup`, {});
                                        alert("Follow-up discount cancelled.");
                                        window.location.reload();
                                      } catch (err) {
                                        console.error(err);
                                        alert("Failed to override follow-up.");
                                      }
                                    }
                                  }}
                                  className="ml-2 px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] text-xs font-bold rounded-lg hover:bg-[hsl(var(--color-danger-soft))] transition-colors border border-[hsl(var(--color-danger-soft))]"
                                >
                                  Override Discount
                                </button>
                              )}
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
