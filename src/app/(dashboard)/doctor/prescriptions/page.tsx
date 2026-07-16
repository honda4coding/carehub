"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { LuPill, LuSearch, LuCalendar, LuFileText, LuUser, LuEye } from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

function PrescriptionsContent() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const { token } = useAuth();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterParam]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        let url = `${baseUrl}/doctor/my-prescriptions?page=${page}&limit=10`;

        if (filterParam === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          url += `&startDate=${today.toISOString()}&endDate=${endOfDay.toISOString()}`;
        }

        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrescriptions(response.data.data.prescriptions || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [token, filterParam, page, debouncedSearch]);

  const filteredPrescriptions = prescriptions;

  return (
    <div className="flex flex-col flex-1 h-full">
      <DashboardHeader
        title="My Prescriptions"
        subtitle={filterParam === "today" ? "Prescriptions issued today" : "Your complete archive of issued prescriptions"}
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col max-w-7xl mx-auto w-full gap-6">
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))] focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="w-full overflow-x-auto">
              {/* Mobile View: Cards */}
              <div className="lg:hidden flex flex-col p-4 gap-3">
                {isLoading ? (
                  <div className="py-12 text-center text-[hsl(var(--color-text-muted))] font-bold">
                    Loading prescriptions...
                  </div>
                ) : filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((p) => {
                    const patientName = p.isOfflinePatient ? p.guestName : (p.patientId?.fullName || "Unknown");
                    const phone = p.isOfflinePatient ? p.guestPhone : (p.patientId?.phoneNumber || "N/A");
                    const avatarStyle = p.isOfflinePatient 
                      ? "bg-[hsl(var(--color-primary)/0.1)] text-primary" 
                      : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]";
                    
                    let medsString = "No details";
                    if (p.medications && Array.isArray(p.medications) && p.medications.length > 0) {
                      medsString = p.medications.map((m: any) => m.medicineName).join(", ");
                    } else if (p.prescriptionText) {
                      medsString = p.prescriptionText;
                    } else if (typeof p.medications === 'string') {
                      medsString = p.medications;
                    } else if (p.notes) {
                      medsString = p.notes;
                    }

                    return (
                      <div key={p._id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black ${avatarStyle}`}>
                            {patientName?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))]">{patientName}</h3>
                            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
                              <LuUser className="text-[10px]" /> {phone}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-lg flex flex-col gap-2">
                          <span className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
                            <LuCalendar className="text-[14px]" />
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-start gap-1.5 text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                            <LuPill className="text-[14px] mt-0.5" />
                            <span className="flex-1">{medsString}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-12 text-center text-[hsl(var(--color-text-muted))]">
                    <LuSearch className="text-4xl mb-3 opacity-20 mx-auto" />
                    <p className="text-[14px] font-bold">No prescriptions found</p>
                  </div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden lg:block w-full">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[hsl(var(--color-bg-soft))]">
                    <tr>
                      <th className="px-6 py-4 text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Patient</th>
                      <th className="px-6 py-4 text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Date</th>
                      <th className="px-6 py-4 text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Medications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--color-border))]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-[hsl(var(--color-text-muted))] font-bold">
                          Loading prescriptions...
                        </td>
                      </tr>
                    ) : filteredPrescriptions.length > 0 ? (
                      filteredPrescriptions.map((p) => {
                        const patientName = p.isOfflinePatient ? p.guestName : (p.patientId?.fullName || "Unknown");
                        const phone = p.isOfflinePatient ? p.guestPhone : (p.patientId?.phoneNumber || "N/A");
                        const avatarStyle = p.isOfflinePatient 
                          ? "bg-[hsl(var(--color-primary)/0.1)] text-primary" 
                          : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]";
                        
                        let medsString = "No details";
                        if (p.medications && Array.isArray(p.medications) && p.medications.length > 0) {
                          medsString = p.medications.map((m: any) => m.medicineName).join(", ");
                        } else if (p.prescriptionText) {
                          medsString = p.prescriptionText;
                        } else if (typeof p.medications === 'string') {
                          medsString = p.medications;
                        } else if (p.notes) {
                          medsString = p.notes;
                        }

                        return (
                        <tr key={p._id} className="hover:bg-[hsl(var(--color-bg-soft)/0.5)] transition-colors group">
                          <td className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-black shadow-sm ${avatarStyle}`}>
                                {patientName?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-0.5">{patientName}</h3>
                                <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
                                  <LuUser className="text-[11px]" /> {phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                              <LuCalendar className="text-[14px]" />
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                              <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] flex items-center justify-center shrink-0">
                                <LuPill className="text-[14px]" />
                              </div>
                              <span className="max-w-[400px] truncate" title={medsString}>{medsString}</span>
                            </div>
                          </td>
                        </tr>
                      )})
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-[hsl(var(--color-text-muted))]">
                          <div className="flex flex-col items-center justify-center">
                            <LuSearch className="text-4xl mb-3 opacity-20" />
                            <p className="text-[14px] font-bold">No prescriptions found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-[hsl(var(--color-border))]">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center font-bold text-primary">Loading prescriptions...</div>}>
      <PrescriptionsContent />
    </Suspense>
  );
}
