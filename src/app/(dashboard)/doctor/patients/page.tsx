"use client";

import { useState, useEffect, Suspense } from "react";
import { LuUsers } from "react-icons/lu";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import PatientDirectoryFilters from "@/components/doctor/patients/PatientDirectoryFilters";
import PatientTable from "@/components/doctor/patients/PatientTable";
import DashboardHeader from "@/components/global/DashboardHeader";

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
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))] relative">
      <DashboardHeader
        title="Patient Directory"
        subtitle="Your complete archive of all clinic patients"
        backPath="/doctor"
        rightElement={
          <span className="text-sm font-bold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] px-3 py-1.5 rounded-full border border-[hsl(var(--color-primary)/0.2)]">
            Total: {patients.length}
          </span>
        }
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto flex">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          
          <PatientDirectoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            onReset={handleResetFilters}
          />

          <PatientTable
            patients={filteredPatients}
            loading={loading}
            onViewHistory={handleViewHistory}
          />

        </div>
      </main>
    </div>
  );
}

export default function PatientDirectoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-base font-bold text-[hsl(var(--color-text-muted))]">Loading Patient Directory...</div>}>
      <PatientDirectoryContent />
    </Suspense>
  )
}
