"use client";

import { useEffect, useState } from "react";
import { PayoutRequest, walletService } from "@/services/walletService";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function AdminPayoutsPage() {
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPayouts = async () => {
        try {
            setLoading(true);
            const data = await walletService.getAllPayoutRequests();
            setPayoutRequests(data);
        } catch (error) {
            toast.error("Failed to load payout requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayouts();
    }, []);

    const handleUpdateStatus = async (requestId: string, status: 'paid' | 'rejected') => {
        const adminNotes = prompt(status === 'rejected' ? "Enter rejection reason:" : "Enter transaction reference (optional):");
        if (status === 'rejected' && !adminNotes) {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            await walletService.updatePayoutStatus(requestId, status, adminNotes || undefined);
            toast.success(`Request marked as ${status}`);
            loadPayouts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
            <DashboardHeader
                title="Payouts Management"
                subtitle="Review and process withdrawal requests from doctors and patients"
            />
            
            <div className="p-6 max-w-6xl mx-auto w-full">
                <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl shadow-sm border border-[hsl(var(--color-border))] p-6">
                    {loading ? (
                        <p className="text-center py-8">Loading requests...</p>
                    ) : payoutRequests.length === 0 ? (
                        <p className="text-center py-8 text-[hsl(var(--color-text-muted))]">No payout requests found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[hsl(var(--color-bg-base))] border-b border-[hsl(var(--color-border))]">
                                    <tr>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Date</th>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">User</th>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Amount</th>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Method & Details</th>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Status</th>
                                        <th className="p-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--color-border))]">
                                    {payoutRequests.map(req => (
                                        <tr key={req._id} className="hover:bg-[hsl(var(--color-bg-base))] transition-colors">
                                            <td className="p-4 text-[13px] font-semibold text-[hsl(var(--color-text))]">
                                                {dayjs(req.createdAt).format('MMM D, YYYY HH:mm')}
                                            </td>
                                            <td className="p-4 text-[13px] font-semibold text-[hsl(var(--color-text))]">
                                                {req.userId?.fullName || 'Unknown User'}
                                                <div className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium capitalize mt-1">
                                                    {req.userId?.role}
                                                </div>
                                            </td>
                                            <td className="p-4 text-[14px] font-bold text-[hsl(var(--color-text))]">
                                                {req.amount.toFixed(2)} EGP
                                            </td>
                                            <td className="p-4 text-[13px]">
                                                <div className="font-semibold capitalize text-[hsl(var(--color-text))]">{req.paymentMethod.replace(/_/g, ' ')}</div>
                                                <div className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">{req.paymentDetails}</div>
                                            </td>
                                            <td className="p-4">
                                                {req.status === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] text-[11px] font-black uppercase"><Clock size={12}/> Pending</span>}
                                                {req.status === 'paid' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] text-[11px] font-black uppercase"><CheckCircle size={12}/> Paid</span>}
                                                {req.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] text-[11px] font-black uppercase"><XCircle size={12}/> Rejected</span>}
                                            </td>
                                            <td className="p-4">
                                                {req.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            className="px-3 py-1.5 rounded-lg bg-[hsl(var(--color-success))] hover:bg-[hsl(var(--color-success-hover))] text-white text-[12px] font-bold transition-colors"
                                                            onClick={() => handleUpdateStatus(req._id, 'paid')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            className="px-3 py-1.5 rounded-lg bg-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-hover))] text-white text-[12px] font-bold transition-colors"
                                                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    req.adminNotes && (
                                                        <div className="text-[12px] text-[hsl(var(--color-text-muted))] italic max-w-[150px] truncate" title={req.adminNotes}>
                                                            {req.adminNotes}
                                                        </div>
                                                    )
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
        </div>
    );
}
