"use client";

import { useState } from "react";
import { 
  LuUsers, LuSearch, LuCalendar, LuFilter, 
  LuHistory, LuPhone, LuMail, LuActivity, LuChevronRight, LuPlus, LuStethoscope, LuUserPlus, LuX
} from "react-icons/lu";

// Dummy Data
const MOCK_PATIENTS = [
  {
    id: "p1",
    name: "Ahmed Ali",
    phone: "01011223344",
    email: "ahmed.ali@example.com",
    firstVisit: "2023-01-15",
    lastVisit: "2024-06-07",
    totalVisits: 12,
    lastType: "Online",
    status: "Active",
    bloodType: "O+",
    avatarStyle: "bg-[hsl(var(--color-primary)/0.1)] text-primary"
  },
  {
    id: "p2",
    name: "Noura Saeed",
    phone: "01233445566",
    email: "noura.saeed@example.com",
    firstVisit: "2024-05-20",
    lastVisit: "2024-06-01",
    totalVisits: 2,
    lastType: "Walk-in",
    status: "Active",
    bloodType: "A+",
    avatarStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
  },
  {
    id: "p3",
    name: "Khaled Samy",
    phone: "01122334455",
    email: "k.samy@example.com",
    firstVisit: "2022-11-05",
    lastVisit: "2023-08-12",
    totalVisits: 4,
    lastType: "Walk-in",
    status: "Inactive",
    bloodType: "B-",
    avatarStyle: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
  },
  {
    id: "p4",
    name: "Mona Fathy",
    phone: "01555667788",
    email: "mona.f@example.com",
    firstVisit: "2024-06-08",
    lastVisit: "2024-06-08",
    totalVisits: 1,
    lastType: "Online",
    status: "Active",
    bloodType: "AB+",
    avatarStyle: "bg-purple-100 text-purple-600"
  }
];

export default function PatientDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Filtering Logic
  const filteredPatients = MOCK_PATIENTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
    const matchesDate = dateFilter ? p.lastVisit === dateFilter : true;
    const matchesType = typeFilter === "All" || p.lastType === typeFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesType && matchesStatus;
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
            Total Patients: 1,432
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
              <div className="relative">
                <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors"
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

              {/* Status Filter */}
              <div className="relative">
                <LuActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer appearance-none focus:border-primary transition-colors"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Database Table */}
          <div className="flex-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
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
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-[hsl(var(--color-bg-soft)/0.5)] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black ${p.avatarStyle}`}>
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))]">{p.name}</h3>
                              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
                                <LuPhone className="text-[10px]" /> {p.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">{p.firstVisit}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[12px] font-bold text-[hsl(var(--color-text))]">{p.lastVisit}</p>
                            <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5">{p.lastType}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[13px] font-black text-[hsl(var(--color-text))]">
                            {p.totalVisits}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setSelectedPatient(p)}
                            className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-primary hover:text-white text-primary text-[11px] font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100"
                          >
                            <LuHistory /> View History
                          </button>
                        </td>
                      </tr>
                    ))
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
            <div className="p-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between text-[11px] font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))]">
              <span>Showing {filteredPatients.length} of {MOCK_PATIENTS.length} patients</span>
              <div className="flex gap-1">
                <button className="px-3 py-1.5 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-border))] transition-colors disabled:opacity-50">Previous</button>
                <button className="px-3 py-1.5 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-border))] transition-colors disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Quick History Sidebar Modal */}
      {selectedPatient && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedPatient(null)} />
          <div className="absolute top-0 right-0 h-full w-[400px] bg-[hsl(var(--color-bg-surface))] shadow-2xl z-50 border-l border-[hsl(var(--color-border))] flex flex-col transform transition-transform duration-300">
            <div className="p-5 border-b border-[hsl(var(--color-border))] bg-gradient-to-r from-[hsl(var(--color-primary)/0.05)] to-transparent">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-black shadow-sm ${selectedPatient.avatarStyle}`}>
                    {selectedPatient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[hsl(var(--color-text))]">{selectedPatient.name}</h2>
                    <span className="text-[10px] font-bold bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] px-2 py-0.5 rounded border border-[hsl(var(--color-border))]">
                      ID: {selectedPatient.id.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] transition-colors"
                >
                  <LuX className="text-xl" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-4">
                <div className="flex items-center gap-1.5"><LuPhone /> {selectedPatient.phone}</div>
                <div className="flex items-center gap-1.5"><LuMail className="truncate" /> {selectedPatient.email}</div>
                <div className="flex items-center gap-1.5"><LuActivity /> Blood: <span className="font-bold text-red-500">{selectedPatient.bloodType}</span></div>
                <div className="flex items-center gap-1.5"><LuCalendar /> Visits: <span className="font-bold text-[hsl(var(--color-text))]">{selectedPatient.totalVisits}</span></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <h3 className="text-[13px] font-black uppercase text-[hsl(var(--color-text))] mb-4 flex items-center gap-2">
                <LuHistory /> Visit History Summary
              </h3>
              
              <div className="relative border-l-2 border-[hsl(var(--color-border))] ml-2 space-y-6 pb-4">
                {/* Dummy Timeline Items */}
                <div className="relative pl-6">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-[hsl(var(--color-bg-surface))]" />
                  <div className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-primary">07 Jun 2024</span>
                      <span className="text-[9px] font-bold uppercase bg-white px-2 py-0.5 rounded text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]">Online</span>
                    </div>
                    <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mb-1">Follow-up Consultation</p>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] line-clamp-2">Patient reported improvement in headaches. Blood pressure stabilized at 120/80.</p>
                  </div>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[hsl(var(--color-border))] ring-4 ring-[hsl(var(--color-bg-surface))]" />
                  <div className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl p-3 shadow-sm opacity-70">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">15 May 2024</span>
                      <span className="text-[9px] font-bold uppercase bg-white px-2 py-0.5 rounded text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]">Walk-in</span>
                    </div>
                    <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mb-1">General Checkup</p>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] line-clamp-2">Prescribed paracetamol for fever. Requested CBC blood test.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))]">
              <button className="w-full bg-white text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] text-[12px] font-bold py-2.5 rounded-xl shadow-sm hover:bg-[hsl(var(--color-bg-base))] transition-colors flex justify-center items-center gap-2">
                View Full Medical Record <LuChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
