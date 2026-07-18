"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, PayoutRequest, PayoutChangeRequest, PaginationMeta } from "@/services/walletService";
import { adminService } from "@/services/adminService";
import { LuArrowDownToLine, LuCircleCheck, LuCircleX, LuClock, LuRefreshCw, LuImage, LuSearch, LuFilter, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'changes'>('withdrawals');
  
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<PayoutChangeRequest[]>([]);
  const [counts, setCounts] = useState({ withdrawals: 0, changes: 0 });
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Search, Filter, Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const debouncedSearch = useDebounce(search, 500);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'withdrawals' | 'changes' | 'suspend';
    action: 'paid' | 'approved' | 'rejected' | 'suspend';
    requestId: string;
    userId?: string;
  } | null>(null);
  
  const [adminNotes, setAdminNotes] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'withdrawals') {
        const res = await walletService.getAllPayoutRequests(page, limit, debouncedSearch, statusFilter);
        setPayouts(res.data);
        setPagination(res.pagination);
      } else {
        const res = await walletService.getAllChangeRequests(page, limit, debouncedSearch, statusFilter);
        setChangeRequests(res.data);
        setPagination(res.pagination);
      }

      const countsRes = await adminService.getPendingPayoutsCount();
      if (countsRes?.data) {
        setCounts({
          withdrawals: countsRes.data.withdrawals,
          changes: countsRes.data.changes
        });
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, debouncedSearch, statusFilter]);

  // Reset page to 1 on filter/tab change without triggering an extra loadData call
  const prevFiltersRef = useRef({ activeTab, debouncedSearch, statusFilter });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.activeTab !== activeTab ||
      prev.debouncedSearch !== debouncedSearch ||
      prev.statusFilter !== statusFilter;

    if (filtersChanged) {
      prevFiltersRef.current = { activeTab, debouncedSearch, statusFilter };
      if (page !== 1) {
        setPage(1); // this will trigger loadData via the first effect
        return; // skip the manual loadData since page change will trigger it
      }
    }
  }, [activeTab, debouncedSearch, statusFilter]);

  const handleActionSubmit = async () => {
    if (!modal) return;
    
    if (modal.action === 'rejected' && !adminNotes.trim()) {
      return alert("Please enter a reason for rejection.");
    }
    if (modal.type === 'withdrawals' && modal.action === 'paid' && !receiptPhoto) {
      return alert("Please upload a receipt photo for this transfer.");
    }

    setProcessingId(modal.requestId);
    setModal(null);
    
    try {
      if (modal.type === 'withdrawals') {
        const formData = new FormData();
        formData.append("status", modal.action);
        formData.append("adminNotes", adminNotes);
        if (receiptPhoto) formData.append("receiptPhoto", receiptPhoto);
        
        await walletService.updatePayoutStatus(formData, modal.requestId);
      } else if (modal.type === 'changes') {
        await walletService.updateChangeRequestStatus(modal.requestId, modal.action as 'approved'|'rejected', adminNotes);
      } else if (modal.type === 'suspend' && modal.userId) {
        await walletService.suspendPayoutProfile(modal.userId, true, adminNotes);
      }
      loadData();
      window.dispatchEvent(new Event("pending-payouts-changed"));
    } catch (err: any) {
      alert(err.message || "Failed to process request");
    } finally {
      setProcessingId(null);
      setAdminNotes("");
      setReceiptPhoto(null);
    }
  };

  const openModal = (type: 'withdrawals'|'changes'|'suspend', action: 'paid'|'approved'|'rejected'|'suspend', id: string, userId?: string) => {
    setAdminNotes("");
    setReceiptPhoto(null);
    setModal({ isOpen: true, type, action, requestId: id, userId });
  };

  const handleUnsuspend = async (userId: string) => {
    if (!window.confirm("Are you sure you want to unsuspend this wallet?")) return;
    try {
      await walletService.suspendPayoutProfile(userId, false);
      alert("Wallet unsuspended successfully.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to unsuspend wallet");
    }
  };



  return (
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] overflow-y-auto">
      <DashboardHeader 
        title="Finance & Payouts" 
        subtitle="Review withdrawals and payout profiles" 
        rightElement={
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw className={`text-[14px] ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="w-full lg:w-auto shrink-0 flex flex-col md:flex-row gap-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full">
              {[
                { id: 'withdrawals', label: 'Withdrawal Requests', count: counts.withdrawals },
                { id: 'changes', label: 'Profile Change Requests', count: counts.changes }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'withdrawals' | 'changes')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                        : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-[6px] text-[10px] font-black bg-[hsl(var(--color-secondary))] text-white">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))] shadow-sm"
            />
          </div>
          <div className="relative w-full md:w-48 shrink-0">
            <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[hsl(var(--color-text-muted))]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))] shadow-sm appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse h-96 bg-slate-200 rounded-2xl w-full" />
        ) : activeTab === 'withdrawals' ? (
          /* WITHDRAWALS TAB */
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <LuCircleCheck className="text-[48px] text-[hsl(var(--color-success))] mb-4" />
                <p className="text-[hsl(var(--color-text-muted))] text-[16px] font-bold">No pending withdrawal requests.</p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[hsl(var(--color-bg-soft))]">
                      <tr className="text-[hsl(var(--color-text-muted))] text-[12px] uppercase tracking-wider border-b border-[hsl(var(--color-border))]">
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">Amount</th>
                        <th className="p-4 font-bold">Destination</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--color-border))]">
                      {payouts.map(p => (
                        <tr key={p._id} className="text-[14px] text-[hsl(var(--color-text))]">
                          <td className="p-4 whitespace-nowrap font-medium text-[hsl(var(--color-text-muted))]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[hsl(var(--color-text))]">{p.userId?.fullName || 'Unknown User'}</div>
                            <div className="text-[12px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider">{p.userId?.role || 'User'}</div>
                          </td>
                          <td className="p-4 font-black text-[16px] text-[hsl(var(--color-success))]">
                            {p.amount} <span className="text-[12px] text-[hsl(var(--color-success))/70] opacity-80">EGP</span>
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] rounded-lg text-[12px] font-bold mb-1 uppercase">
                              {p.paymentMethod.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[13px] font-mono text-[hsl(var(--color-text-muted))]">{p.paymentDetails}</div>
                          </td>
                          <td className="p-4">
                            {p.status === "pending" && <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] font-bold text-[13px]"><LuClock/> Pending</span>}
                            {p.status === "paid" && <span className="flex items-center gap-1 text-[hsl(var(--color-success))] font-bold text-[13px]"><LuCircleCheck/> Paid</span>}
                            {p.status === "rejected" && <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                          </td>
                          <td className="p-4 text-right">
                            {p.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openModal('withdrawals', 'paid', p._id)}
                                  disabled={processingId === p._id}
                                  className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[13px] font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => openModal('withdrawals', 'rejected', p._id)}
                                  disabled={processingId === p._id}
                                  className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[13px] font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {p.status !== 'pending' && (
                              <span className="text-[13px] text-slate-400 font-medium mr-2">Processed</span>
                            )}
                            <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => openModal('suspend', 'suspend', p._id, p.userId?._id)}
                                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                                >
                                  Suspend Wallet
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 xl:hidden p-4 bg-[hsl(var(--color-bg-base))]">
                  {payouts.map(p => (
                    <div key={p._id} className="bg-[hsl(var(--color-bg-surface))] p-4 rounded-2xl shadow-sm border border-[hsl(var(--color-border))] flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-[hsl(var(--color-border-soft))] pb-3">
                        <div>
                          <div className="font-bold text-[hsl(var(--color-text))] text-[15px]">{p.userId?.fullName || 'Unknown User'}</div>
                          <div className="text-[11px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold bg-[hsl(var(--color-bg))] px-2 py-0.5 rounded-md inline-block mt-1">{p.userId?.role || 'User'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[18px] text-[hsl(var(--color-success))]">{p.amount} <span className="text-[12px] text-[hsl(var(--color-success))/70] opacity-80">EGP</span></div>
                          <div className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] rounded-lg text-[11px] font-bold mb-1.5 uppercase">
                          {p.paymentMethod.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[13px] font-mono text-[hsl(var(--color-text))] font-bold break-all">{p.paymentDetails}</div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          {p.status === "pending" && <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] font-bold text-[13px]"><LuClock/> Pending</span>}
                          {p.status === "paid" && <span className="flex items-center gap-1 text-[hsl(var(--color-success))] font-bold text-[13px]"><LuCircleCheck/> Paid</span>}
                          {p.status === "rejected" && <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                        </div>
                        {p.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('withdrawals', 'paid', p._id)}
                              disabled={processingId === p._id}
                              className="px-3 py-1.5 bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success-strong))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-success-bg))/80] disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => openModal('withdrawals', 'rejected', p._id)}
                              disabled={processingId === p._id}
                              className="px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger-strong))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-danger-bg))/80] disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">Processed</span>
                        )}
                      </div>
                      <div className="flex justify-end mt-1 pt-3 border-t border-[hsl(var(--color-border-soft))]">
                        <button
                          onClick={() => openModal('suspend', 'suspend', p._id, p.userId?._id)}
                          className="px-3 py-1 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger-strong))] rounded-lg text-[11px] font-bold hover:bg-[hsl(var(--color-danger-bg))/80] transition-colors"
                        >
                          Suspend Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between bg-[hsl(var(--color-bg-soft))]">
                <span className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="p-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))] disabled:opacity-50 transition-colors"
                  >
                    <LuChevronLeft />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))] disabled:opacity-50 transition-colors"
                  >
                    <LuChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CHANGE REQUESTS TAB */
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden">
            {changeRequests.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <LuCircleCheck className="text-[48px] text-[hsl(var(--color-success))] mb-4" />
                <p className="text-[hsl(var(--color-text-muted))] text-[16px] font-bold">No pending profile change requests.</p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[hsl(var(--color-bg-soft))]">
                      <tr className="text-[hsl(var(--color-text-muted))] text-[12px] uppercase tracking-wider border-b border-[hsl(var(--color-border))]">
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">New Destination</th>
                        <th className="p-4 font-bold">Verification ID</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--color-border))]">
                      {changeRequests.map(c => (
                        <tr key={c._id} className="text-[14px] text-[hsl(var(--color-text))]">
                          <td className="p-4 whitespace-nowrap font-medium text-[hsl(var(--color-text-muted))]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-[hsl(var(--color-text))]">{c.userId?.fullName || 'Unknown User'}</div>
                            <div className="text-[12px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider">{c.userId?.role || 'User'}</div>
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success-strong))] rounded-lg text-[12px] font-bold mb-1 uppercase">
                              {c.newPaymentMethod.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[13px] font-mono text-[hsl(var(--color-text))] font-bold">{c.newAccountDetails}</div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => setSelectedImage(c.idPhotoUrl)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-bg-soft))] transition-colors border border-[hsl(var(--color-border))]"
                            >
                              <LuImage /> View ID Photo
                            </button>
                          </td>
                          <td className="p-4">
                            {c.status === "pending" && <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] font-bold text-[13px]"><LuClock/> Pending</span>}
                            {c.status === "approved" && <span className="flex items-center gap-1 text-[hsl(var(--color-success))] font-bold text-[13px]"><LuCircleCheck/> Approved</span>}
                            {c.status === "rejected" && <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                          </td>
                          <td className="p-4 text-right">
                            {c.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openModal('changes', 'approved', c._id)}
                                  disabled={processingId === c._id}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openModal('changes', 'rejected', c._id)}
                                  disabled={processingId === c._id}
                                  className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[13px] font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {c.status !== 'pending' && (
                              <span className="text-[13px] text-slate-400 font-medium mr-2">Processed</span>
                            )}
                            <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => openModal('suspend', 'suspend', c._id, c.userId?._id)}
                                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-colors"
                                >
                                  Suspend Wallet
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 xl:hidden p-4 bg-[hsl(var(--color-bg-base))]">
                  {changeRequests.map(c => (
                    <div key={c._id} className="bg-[hsl(var(--color-bg-surface))] p-4 rounded-2xl shadow-sm border border-[hsl(var(--color-border))] flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-[hsl(var(--color-border-soft))] pb-3">
                        <div>
                          <div className="font-bold text-[hsl(var(--color-text))] text-[15px]">{c.userId?.fullName || 'Unknown User'}</div>
                          <div className="text-[11px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold bg-[hsl(var(--color-bg))] px-2 py-0.5 rounded-md inline-block mt-1">{c.userId?.role || 'User'}</div>
                        </div>
                        <div className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] rounded-lg text-[11px] font-bold mb-1.5 uppercase">
                          {c.newPaymentMethod.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[13px] font-mono text-[hsl(var(--color-text))] font-bold break-all mb-3">{c.newAccountDetails}</div>
                        <button 
                          onClick={() => setSelectedImage(c.idPhotoUrl)}
                          className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                        >
                          <LuImage /> View ID Photo
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          {c.status === "pending" && <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] font-bold text-[13px]"><LuClock/> Pending</span>}
                          {c.status === "approved" && <span className="flex items-center gap-1 text-[hsl(var(--color-success))] font-bold text-[13px]"><LuCircleCheck/> Approved</span>}
                          {c.status === "rejected" && <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                        </div>
                        {c.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('changes', 'approved', c._id)}
                              disabled={processingId === c._id}
                              className="px-4 py-1.5 bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success-strong))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-success-bg))/80] disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModal('changes', 'rejected', c._id)}
                              disabled={processingId === c._id}
                              className="px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger-strong))] rounded-lg text-[12px] font-bold hover:bg-[hsl(var(--color-danger-bg))/80] disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">Processed</span>
                        )}
                      </div>
                      <div className="flex justify-end mt-1 pt-3 border-t border-[hsl(var(--color-border-soft))]">
                        <button
                          onClick={() => openModal('suspend', 'suspend', c._id, c.userId?._id)}
                          className="px-3 py-1 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger-strong))] rounded-lg text-[11px] font-bold hover:bg-[hsl(var(--color-danger-bg))/80] transition-colors"
                        >
                          Suspend Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between bg-[hsl(var(--color-bg-soft))]">
                <span className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="p-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))] disabled:opacity-50 transition-colors"
                  >
                    <LuChevronLeft />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))] disabled:opacity-50 transition-colors"
                  >
                    <LuChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ID Photo Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-2 rounded-2xl max-w-2xl w-full relative">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-800 rounded-full font-black text-xl shadow-xl flex items-center justify-center hover:bg-slate-100"
            >
              ×
            </button>
            <img src={selectedImage} alt="ID Verification" className="w-full h-auto rounded-xl max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-[20px] font-black text-[hsl(var(--color-text))] mb-2">
              {modal.action === 'paid' && 'Upload Receipt'}
              {modal.action === 'approved' && 'Approve Change'}
              {modal.action === 'rejected' && 'Reject Request'}
              {modal.action === 'suspend' && 'Suspend User Wallet'}
            </h3>
            <p className="text-[14px] text-[hsl(var(--color-text-muted))] font-medium mb-6">
              {modal.action === 'paid' && 'Please upload the transfer receipt image to mark this withdrawal as paid.'}
              {modal.action === 'approved' && 'Are you sure you want to approve this profile change request?'}
              {modal.action === 'rejected' && 'Please provide a clear reason for rejecting this request so the user can fix the issue.'}
              {modal.action === 'suspend' && 'Please provide a reason for suspending this user\'s wallet. They will not be able to withdraw funds until unsuspended.'}
            </p>

            <div className="space-y-4">
              {(modal.action === 'rejected' || modal.action === 'paid' || modal.action === 'approved' || modal.action === 'suspend') && (
                <div>
                  <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">
                    {modal.action === 'suspend' ? 'Suspension Reason' : `Admin Notes ${modal.action !== 'rejected' ? '(Optional)' : ''}`}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={modal.action === 'rejected' ? "e.g., ID photo is blurry, please re-upload." : modal.action === 'suspend' ? "e.g., Fraudulent activity detected." : "Internal notes..."}
                    className="w-full px-4 py-3 bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20 font-medium text-[hsl(var(--color-text))] h-24 resize-none"
                  />
                </div>
              )}

              {modal.type === 'withdrawals' && modal.action === 'paid' && (
                <div>
                  <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">Transfer Receipt Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[hsl(var(--color-bg))] hover:border-[hsl(var(--color-primary))] transition-all"
                  >
                    {receiptPhoto ? (
                      <p className="text-[13px] font-bold text-[hsl(var(--color-primary))] truncate max-w-full px-2">{receiptPhoto.name}</p>
                    ) : (
                      <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">Click to upload receipt</p>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => e.target.files && setReceiptPhoto(e.target.files[0])} className="hidden" />
                </div>
              )}

              <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-3 bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] font-bold rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processingId === modal.requestId || (modal.action === 'suspend' && !adminNotes.trim())}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
                  modal.action === 'rejected' || modal.action === 'suspend' 
                    ? 'bg-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-strong))] text-white' 
                    : 'bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white'
                }`}
              >
                {processingId === modal.requestId ? 'Processing...' : modal.action === 'suspend' ? 'Suspend Wallet' : 'Confirm'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
