"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useClinicContext } from "@/context/ClinicContext";
import { fetchClient } from "@/services/fetchClient";

interface Clinic {
  _id: string;
  name: string;
  address: string;
  isActive?: boolean;
}

export default function ClinicSelector() {
  const { role, user } = useAuth();
  const { activeClinicId, setActiveClinicId } = useClinicContext();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "doctor") {
      fetchClient.get("/clinics")
        .then((res) => {
          if (res.data?.clinics) {
            setClinics(res.data.clinics);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [role]);

  const activeClinics = clinics.filter(c => c.isActive);

  useEffect(() => {
    // Auto-select first active clinic if not set or set to "all"
    if (activeClinics.length > 0 && (!activeClinicId || activeClinicId === "all")) {
      setActiveClinicId(activeClinics[0]._id);
    } else if (activeClinics.length === 0 && activeClinicId) {
      setActiveClinicId("");
    }
  }, [clinics, activeClinicId, setActiveClinicId]);

  if (role !== "doctor" || loading) {
    return null;
  }

  if (activeClinics.length === 0) {
    return (
      <div className="flex items-center shrink-0 pl-1">
         <span className="text-[hsl(var(--color-danger))] text-[12px] px-1 font-bold whitespace-nowrap">
           No Active Clinics
         </span>
      </div>
    );
  }

  if (activeClinics.length === 1) {
    return (
      <div className="flex items-center shrink min-w-0 pl-1 max-w-[200px] sm:max-w-[300px]">
         <span 
           className="text-[hsl(var(--color-primary-strong))] text-[12px] px-1 font-bold whitespace-nowrap truncate w-full cursor-pointer transition-all"
           title={activeClinics[0].name}
           onClick={(e) => {
             e.currentTarget.classList.toggle("truncate");
             e.currentTarget.classList.toggle("break-all");
             e.currentTarget.classList.toggle("whitespace-normal");
           }}
         >
           {activeClinics[0].name}
         </span>
      </div>
    );
  }

  return (
    <div className="flex items-center shrink min-w-0 pl-1">
      <select
        value={activeClinicId}
        onChange={(e) => setActiveClinicId(e.target.value)}
        className="bg-transparent border-none text-[hsl(var(--color-primary-strong))] text-[12px] focus:outline-none cursor-pointer font-bold max-w-[200px] sm:max-w-[350px] truncate"
        title={activeClinics.find(c => c._id === activeClinicId)?.name || "Select Clinic"}
      >
        {activeClinics.map((clinic) => (
          <option key={clinic._id} value={clinic._id}>
            {clinic.name}
          </option>
        ))}
      </select>
    </div>
  );
}
