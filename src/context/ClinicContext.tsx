'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ClinicContextType {
  activeClinicId: string; // actual clinicId or empty
  setActiveClinicId: (id: string) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const CLINIC_STORAGE_KEY = 'carehub_active_clinic_id';

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [activeClinicId, setActiveClinicIdState] = useState<string>('');

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem(CLINIC_STORAGE_KEY);
    if (saved) {
      setActiveClinicIdState(saved);
    }
  }, []);

  const setActiveClinicId = (id: string) => {
    setActiveClinicIdState(id);
    localStorage.setItem(CLINIC_STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("clinic-changed", { detail: id }));
  };

  return (
    <ClinicContext.Provider value={{ activeClinicId, setActiveClinicId }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinicContext() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    // Return a fallback context if used outside of ClinicProvider
    // e.g., when a Doctor is viewing the Patient layout where ClinicProvider is absent.
    return { activeClinicId: '', setActiveClinicId: () => {} };
  }
  return context;
}
