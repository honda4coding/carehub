"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, PayoutRequest, PayoutChangeRequest } from "@/services/walletService";
import { LuArrowDownToLine, LuCircleCheck, LuCircleX, LuClock, LuRefreshCw, LuImage } from "react-icons/lu";

export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'changes'>('withdrawals');
  
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<PayoutChangeRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    try {
      if (activeTab === 'withdrawals') {
        const data = await walletService.getAllPayoutRequests();
        setPayouts(data);
      } else {
        const data = await walletService.getAllChangeRequests();
        setChangeRequests(data);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

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
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader title="Finance & Payouts" subtitle="Review withdrawals and payout profiles" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-4 px-2 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'withdrawals' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Withdrawal Requests
          </button>
          <button
            onClick={() => setActiveTab('changes')}
            className={`pb-4 px-2 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'changes' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Profile Change Requests
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse h-96 bg-slate-200 rounded-2xl w-full" />
        ) : activeTab === 'withdrawals' ? (
          /* WITHDRAWALS TAB */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <LuCircleCheck className="text-[48px] text-emerald-300 mb-4" />
                <p className="text-slate-500 text-[16px] font-bold">No pending withdrawal requests.</p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr className="text-slate-500 text-[12px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">Amount</th>
                        <th className="p-4 font-bold">Destination</th>
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
                            {p.status === "paid" && <span className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><LuCircleCheck/> Paid</span>}
                            {p.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 font-bold text-[13px]"><LuCircleX/> Rejected</span>}
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
                <div className="grid grid-cols-1 gap-4 xl:hidden p-4 bg-slate-50">
                  {payouts.map(p => (
                    <div key={p._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <div className="font-bold text-slate-800 text-[15px]">{p.userId?.fullName || 'Unknown User'}</div>
                          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{p.userId?.role || 'User'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[18px] text-emerald-600">{p.amount} <span className="text-[12px] text-emerald-600/70">EGP</span></div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/50 text-slate-700 rounded-lg text-[11px] font-bold mb-1.5 uppercase">
                          {p.paymentMethod.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[13px] font-mono text-slate-800 font-bold break-all">{p.paymentDetails}</div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          {p.status === "pending" && <span className="flex items-center gap-1 text-amber-600 font-bold text-[13px]"><LuClock/> Pending</span>}
                          {p.status === "paid" && <span className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><LuCircleCheck/> Paid</span>}
                          {p.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                        </div>
                        {p.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('withdrawals', 'paid', p._id)}
                              disabled={processingId === p._id}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[12px] font-bold hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => openModal('withdrawals', 'rejected', p._id)}
                              disabled={processingId === p._id}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[12px] font-bold hover:bg-rose-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-400 font-medium">Processed</span>
                        )}
                      </div>
                      <div className="flex justify-end mt-1 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => openModal('suspend', 'suspend', p._id, p.userId?._id)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold hover:bg-rose-100 transition-colors"
                        >
                          Suspend Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* CHANGE REQUESTS TAB */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {changeRequests.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <LuCircleCheck className="text-[48px] text-emerald-300 mb-4" />
                <p className="text-slate-500 text-[16px] font-bold">No pending profile change requests.</p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr className="text-slate-500 text-[12px] uppercase tracking-wider">
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold">New Destination</th>
                        <th className="p-4 font-bold">Verification ID</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {changeRequests.map(c => (
                        <tr key={c._id} className="text-[14px] text-slate-700">
                          <td className="p-4 whitespace-nowrap font-medium text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{c.userId?.fullName || 'Unknown User'}</div>
                            <div className="text-[12px] text-slate-500 uppercase tracking-wider">{c.userId?.role || 'User'}</div>
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[12px] font-bold mb-1 uppercase">
                              {c.newPaymentMethod.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[13px] font-mono text-slate-800 font-bold">{c.newAccountDetails}</div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => setSelectedImage(c.idPhotoUrl)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-slate-200 transition-colors"
                            >
                              <LuImage /> View ID Photo
                            </button>
                          </td>
                          <td className="p-4">
                            {c.status === "pending" && <span className="flex items-center gap-1 text-amber-600 font-bold text-[13px]"><LuClock/> Pending</span>}
                            {c.status === "approved" && <span className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><LuCircleCheck/> Approved</span>}
                            {c.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 font-bold text-[13px]"><LuCircleX/> Rejected</span>}
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
                <div className="grid grid-cols-1 gap-4 xl:hidden p-4 bg-slate-50">
                  {changeRequests.map(c => (
                    <div key={c._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <div className="font-bold text-slate-800 text-[15px]">{c.userId?.fullName || 'Unknown User'}</div>
                          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{c.userId?.role || 'User'}</div>
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/50 text-slate-700 rounded-lg text-[11px] font-bold mb-1.5 uppercase">
                          {c.newPaymentMethod.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[13px] font-mono text-slate-800 font-bold break-all mb-3">{c.newAccountDetails}</div>
                        <button 
                          onClick={() => setSelectedImage(c.idPhotoUrl)}
                          className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-slate-50 transition-colors"
                        >
                          <LuImage /> View ID Photo
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          {c.status === "pending" && <span className="flex items-center gap-1 text-amber-600 font-bold text-[13px]"><LuClock/> Pending</span>}
                          {c.status === "approved" && <span className="flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><LuCircleCheck/> Approved</span>}
                          {c.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 font-bold text-[13px]"><LuCircleX/> Rejected</span>}
                        </div>
                        {c.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('changes', 'approved', c._id)}
                              disabled={processingId === c._id}
                              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModal('changes', 'rejected', c._id)}
                              disabled={processingId === c._id}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[12px] font-bold hover:bg-rose-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-400 font-medium">Processed</span>
                        )}
                      </div>
                      <div className="flex justify-end mt-1 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => openModal('suspend', 'suspend', c._id, c.userId?._id)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold hover:bg-rose-100 transition-colors"
                        >
                          Suspend Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-[20px] font-black text-slate-800 mb-2">
              {modal.action === 'paid' && 'Upload Receipt'}
              {modal.action === 'approved' && 'Approve Change'}
              {modal.action === 'rejected' && 'Reject Request'}
              {modal.action === 'suspend' && 'Suspend User Wallet'}
            </h3>
            <p className="text-[14px] text-slate-500 font-medium mb-6">
              {modal.action === 'paid' && 'Please upload the transfer receipt image to mark this withdrawal as paid.'}
              {modal.action === 'approved' && 'Are you sure you want to approve this profile change request?'}
              {modal.action === 'rejected' && 'Please provide a clear reason for rejecting this request so the user can fix the issue.'}
              {modal.action === 'suspend' && 'Please provide a reason for suspending this user\'s wallet. They will not be able to withdraw funds until unsuspended.'}
            </p>

            <div className="space-y-4">
              {(modal.action === 'rejected' || modal.action === 'paid' || modal.action === 'approved' || modal.action === 'suspend') && (
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    {modal.action === 'suspend' ? 'Suspension Reason' : `Admin Notes ${modal.action !== 'rejected' ? '(Optional)' : ''}`}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={modal.action === 'rejected' ? "e.g., ID photo is blurry, please re-upload." : modal.action === 'suspend' ? "e.g., Fraudulent activity detected." : "Internal notes..."}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700 h-24 resize-none"
                  />
                </div>
              )}

              {modal.type === 'withdrawals' && modal.action === 'paid' && (
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Transfer Receipt Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all"
                  >
                    {receiptPhoto ? (
                      <p className="text-[13px] font-bold text-emerald-600 truncate max-w-full px-2">{receiptPhoto.name}</p>
                    ) : (
                      <p className="text-[13px] font-bold text-slate-500">Click to upload receipt</p>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => e.target.files && setReceiptPhoto(e.target.files[0])} className="hidden" />
                </div>
              )}

              <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processingId === modal.requestId || (modal.action === 'suspend' && !adminNotes.trim())}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
                  modal.action === 'rejected' || modal.action === 'suspend' 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
