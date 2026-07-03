"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, PayoutRequest } from "@/services/walletService";
import { LuArrowDownToLine, LuCheckCircle, LuXCircle, LuClock, LuExternalLink, LuAlertCircle } from "react-icons/lu";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await walletService.getAllPayoutRequests();
      setPayouts(data);
    } catch (err) {
      console.error("Failed to load payouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'paid' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    
    let notes = "";
    if (status === 'rejected') {
      const reason = prompt("Enter reason for rejection (optional):");
      if (reason !== null) notes = reason;
      else return; // Cancelled
    }

    setProcessingId(id);
    try {
      await walletService.updatePayoutStatus(id, status, notes);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-black text-slate-800 flex items-center gap-2">
            <LuArrowDownToLine className="text-emerald-600" /> Withdrawal Requests
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">Review and process payout requests from doctors.</p>
        </div>

        {loading ? (
          <div className="animate-pulse h-96 bg-slate-200 rounded-2xl w-full" />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <LuCheckCircle className="text-[48px] text-emerald-300 mb-4" />
                <p className="text-slate-500 text-[16px] font-bold">No pending withdrawal requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500 text-[12px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">User / Role</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Method & Details</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map(p => (
                      <tr key={p._id} className="text-[14px] text-slate-700">
                        <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{p.userId?.fullName || 'Unknown User'}</div>
                          <div className="text-[12px] text-slate-500 uppercase tracking-wider">{p.userId?.role || 'User'}</div>
                        </td>
                        <td className="p-4 font-black text-[16px] text-emerald-600">
                          {p.amount} <span className="text-[12px] text-emerald-600/70">EGP</span>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[12px] font-bold mb-1 uppercase">
                            {p.paymentMethod.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[13px] font-mono text-slate-600">{p.paymentDetails}</div>
                        </td>
                        <td className="p-4">
                          {p.status === "pending" && <span className="flex items-center gap-1 text-amber-600 font-bold text-[13px]"><LuClock/> Pending</span>}
                          {p.status === "paid" && <span className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><LuCheckCircle/> Paid</span>}
                          {p.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 font-bold text-[13px]"><LuXCircle/> Rejected</span>}
                        </td>
                        <td className="p-4 text-right">
                          {p.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(p._id, 'paid')}
                                disabled={processingId === p._id}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[13px] font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(p._id, 'rejected')}
                                disabled={processingId === p._id}
                                className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[13px] font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {p.status !== 'pending' && (
                            <span className="text-[13px] text-slate-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
