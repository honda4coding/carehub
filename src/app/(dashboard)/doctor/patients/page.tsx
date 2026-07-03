"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import PatientDirectoryFilters from "@/components/doctor/patients/PatientDirectoryFilters";
import PatientTable from "@/components/doctor/patients/PatientTable";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import VitalsModal from "@/components/assistant/VitalsModal";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

import { useClinicContext } from "@/context/ClinicContext";

function PatientDirectoryContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { role } = useAuth();
  const { activeClinicId } = useClinicContext();
  const token = Cookies.get("auth_token");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, startDate, endDate, typeFilter, filterParam, activeClinicId]);

  useEffect(() => {
    if(!token) return;
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        let url = `${baseUrl}/doctor/my-patients?page=${page}&limit=10`;
        
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
        }
        if (typeFilter !== "All") {
          url += `&typeFilter=${encodeURIComponent(typeFilter)}`;
        }
        if (activeClinicId && activeClinicId !== "all") {
          url += `&clinicId=${activeClinicId}`;
        }

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
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setTotalRecords(res.data.data.pagination?.total || 0);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token, filterParam, startDate, endDate, debouncedSearchTerm, typeFilter, page]);

  const handleViewHistory = (patient: any) => {
    const basePath = role === 'assistant' ? '/assistant' : '/doctor';
    if (patient.isOfflinePatient) {
      const queryParams = new URLSearchParams();
      if (patient.guestName) queryParams.set('guestName', patient.guestName);
      if (patient.guestPhone) queryParams.set('guestPhone', patient.guestPhone);
      router.push(`${basePath}/history/walkin?${queryParams.toString()}`);
    } else {
      const queryParams = new URLSearchParams();
      if (patient.fullName) queryParams.set('name', patient.fullName);
      if (patient.phoneNumber) queryParams.set('phone', patient.phoneNumber);
      router.push(`${basePath}/history/${patient.patientId}?${queryParams.toString()}`);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setTypeFilter("All");
    setPage(1);
    if (filterParam) {
      const basePath = role === 'assistant' ? '/assistant' : '/doctor';
      router.push(`${basePath}/patients`);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))] relative">
      <DashboardHeader
        title="Patient Directory"
        subtitle="Your complete archive of all clinic patients"
        backPath="/doctor"
        rightElement={
          <span className="text-sm font-bold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] px-3 py-1.5 rounded-full border border-[hsl(var(--color-primary)/0.2)]">
            Total: {totalRecords}
          </span>
        }
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto flex flex-col">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full space-y-4">
          
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
            patients={patients}
            loading={loading}
            onViewHistory={handleViewHistory}
            onRecordVitals={(patient: any) => {
              setSelectedPatientForVitals(patient);
              setIsVitalsModalOpen(true);
            }}
            isAssistant={role === 'assistant'}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center pb-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

        </div>
      </main>

      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patient={selectedPatientForVitals}
        onSuccess={() => {
          alert('Vitals recorded successfully');
        }}
      />
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
