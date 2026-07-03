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

  useEffect(() => {
    // Auto-select first clinic if not set or set to "all"
    if (clinics.length > 0 && (!activeClinicId || activeClinicId === "all")) {
      setActiveClinicId(clinics[0]._id);
    }
  }, [clinics, activeClinicId, setActiveClinicId]);

  const activeClinics = clinics.filter(c => c.isActive);

  if (role !== "doctor" || loading || activeClinics.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeClinicId}
        onChange={(e) => setActiveClinicId(e.target.value)}
        className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-xs md:text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] cursor-pointer font-medium"
      >
        {clinics.map((clinic) => (
          <option key={clinic._id} value={clinic._id}>
            {clinic.name}
          </option>
        ))}
      </select>
    </div>
  );
}
