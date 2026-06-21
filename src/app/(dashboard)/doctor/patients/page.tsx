"use client";

import { useState, useEffect, Suspense } from "react";
import { 
  LuUsers, LuSearch, LuCalendar, LuFilter, 
  LuHistory, LuPhone, LuMail, LuActivity, LuChevronRight, LuX
} from "react-icons/lu";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

function PatientDirectoryContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const token = Cookies.get("auth_token");

  useEffect(() => {
    if(!token) return;
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        let url = `${baseUrl}/doctor/my-patients?limit=1000`;
        
        if (filterParam === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          url += `&startDate=${today.toISOString()}&endDate=${endOfDay.toISOString()}`;
        } else if (startDate || endDate) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            url += `&startDate=${start.toISOString()}`;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            url += `&endDate=${end.toISOString()}`;
          }
        }

        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setPatients(res.data.data.patients || []);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token, filterParam, startDate, endDate]);

  const handleViewHistory = (patient: any) => {
    if (patient.isOfflinePatient) {
      const queryParams = new URLSearchParams();
      if (patient.guestName) queryParams.set('guestName', patient.guestName);
      if (patient.guestPhone) queryParams.set('guestPhone', patient.guestPhone);
      router.push(`/doctor/history/walkin?${queryParams.toString()}`);
    } else {
      const queryParams = new URLSearchParams();
      if (patient.fullName) queryParams.set('name', patient.fullName);
      if (patient.phoneNumber) queryParams.set('phone', patient.phoneNumber);
      router.push(`/doctor/history/${patient.patientId}?${queryParams.toString()}`);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setTypeFilter("All");
    if (filterParam) {
      router.push('/doctor/patients');
    }
  };

  // Filtering Logic
  const filteredPatients = patients.filter(p => {
    const name = p.isOfflinePatient ? p.guestName : p.fullName;
    const phone = p.isOfflinePatient ? p.guestPhone : p.phoneNumber;
    
    const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase()) || phone?.includes(searchTerm);
    const matchesType = typeFilter === "All" || p.lastType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))] relative">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
            <LuUsers className="text-primary" /> Patient Directory
          </h1>
          <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-1 pl-11 md:pl-0">
            Your complete archive of all clinic patients
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[11px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
            Total Patients: {patients.length}
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-hidden flex">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          
          {/* Advanced Filter Bar */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[250px]">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search by patient name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))] focus:border-primary transition-colors"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors flex-1 min-w-[120px]"
                />
                <span className="text-[12px] text-[hsl(var(--color-text-muted))]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors flex-1 min-w-[120px]"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer appearance-none focus:border-primary transition-colors"
                >
                  <option value="All">All Visit Types</option>
                  <option value="Online">Online</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>

              {/* Reset Filter */}
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-red-50 text-red-600 font-bold text-[12px] rounded-xl hover:bg-red-100 transition-colors border border-red-100"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Database Table */}
          <div className="flex-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="w-full">
              {/* Mobile View: Cards */}
              <div className="lg:hidden flex flex-col p-4 gap-3">
                {loading ? (
                   <div className="py-12 text-center text-[hsl(var(--color-text-muted))]">
                     <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                     <p className="text-[12px] font-bold">Loading patients...</p>
                   </div>
                ) : filteredPatients.length > 0 ? (
                   filteredPatients.map((p) => {
                      const name = p.isOfflinePatient ? p.guestName : p.fullName;
                      const phone = p.isOfflinePatient ? p.guestPhone : p.phoneNumber;
                      const avatarStyle = p.isOfflinePatient 
                        ? "bg-[hsl(var(--color-primary)/0.1)] text-primary" 
                        : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]";
                      const status = p.status || "active";

                      return (
                        <div key={p.id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black ${avatarStyle}`}>
                              {name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))]">{name}</h3>
                              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
                                <LuPhone className="text-[10px]" /> {phone || "N/A"}
                              </p>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="bg-[hsl(var(--color-bg-soft))] p-2 rounded-lg">
                              <p className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-wider">First Visit</p>
                              <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mt-0.5">{p.firstVisit ? new Date(p.firstVisit).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="bg-[hsl(var(--color-bg-soft))] p-2 rounded-lg">
                              <p className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-wider">Last Visit</p>
                              <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mt-0.5">{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}</p>
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5">{p.lastType}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--color-border-soft))]">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">Visits:</span>
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[12px] font-black text-[hsl(var(--color-text))]">
                                {p.totalVisits}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleViewHistory(p)}
                              className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-primary hover:text-white text-primary text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                            >
                              <LuHistory /> View History
                            </button>
                          </div>
                        </div>
                      )
                   })
                ) : (
                   <div className="py-12 text-center text-[hsl(var(--color-text-muted))]">
                     <LuSearch className="text-4xl mb-3 opacity-20 mx-auto" />
                     <p className="text-[14px] font-bold">No patients found</p>
                     <p className="text-[11px] mt-1">Try adjusting your filters or search term.</p>
                   </div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden lg:block overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead className="bg-[hsl(var(--color-bg-soft))] sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Patient details</th>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">First Visit</th>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Last Visit</th>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] text-center">Visits</th>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))]">Status</th>
                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--color-border))]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-[hsl(var(--color-text-muted))]">
                           <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                           <p className="text-[12px] font-bold">Loading patients...</p>
                        </td>
                      </tr>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => {
                        const name = p.isOfflinePatient ? p.guestName : p.fullName;
                        const phone = p.isOfflinePatient ? p.guestPhone : p.phoneNumber;
                        const avatarStyle = p.isOfflinePatient 
                          ? "bg-[hsl(var(--color-primary)/0.1)] text-primary" 
                          : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]";
                        const status = p.status || "active";

                        return (
                        <tr key={p.id} className="hover:bg-[hsl(var(--color-bg-soft)/0.5)] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black ${avatarStyle}`}>
                                {name?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))]">{name}</h3>
                                <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
                                  <LuPhone className="text-[10px]" /> {phone || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                                {p.firstVisit ? new Date(p.firstVisit).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-[12px] font-bold text-[hsl(var(--color-text))]">
                                  {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5">{p.lastType}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[13px] font-black text-[hsl(var(--color-text))]">
                              {p.totalVisits}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button 
                              onClick={() => handleViewHistory(p)}
                              className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-primary hover:text-white text-primary text-[11px] font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100"
                            >
                              <LuHistory /> View History
                            </button>
                          </td>
                        </tr>
                      )})
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-[hsl(var(--color-text-muted))]">
                          <div className="flex flex-col items-center justify-center">
                            <LuSearch className="text-4xl mb-3 opacity-20" />
                            <p className="text-[14px] font-bold">No patients found</p>
                            <p className="text-[11px] mt-1">Try adjusting your filters or search term.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between text-[11px] font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))]">
              <span>Showing {filteredPatients.length} of {patients.length} patients</span>
              <div className="flex gap-1">
                <button className="px-3 py-1.5 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-border))] transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1.5 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-border))] transition-colors disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PatientDirectoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Patient Directory...</div>}>
      <PatientDirectoryContent />
    </Suspense>
  )
}
