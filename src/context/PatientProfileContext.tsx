"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  PatientProfile,
  UpdatePatientProfilePayload,
  getPatientProfile,
} from "@/services/patientService";

interface ContextType {
  profile: PatientProfile | null;
  loading: boolean;
  updateProfile: (data: UpdatePatientProfilePayload) => void;
  updateAvatar: (
    pic: { secure_url: string; public_id: string } | null
  ) => void;
}

const PatientProfileContext = createContext<ContextType | null>(null);

export function PatientProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = (data: UpdatePatientProfilePayload) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const updateAvatar = (
    pic: { secure_url: string; public_id: string } | null
  ) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            profilepicture: pic ?? undefined,
          }
        : prev
    );
  };

  return (
    <PatientProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </PatientProfileContext.Provider>
  );
}

export const usePatientProfile = () => {
  const context = useContext(PatientProfileContext);

  if (!context) {
    throw new Error(
      "usePatientProfile must be used inside PatientProfileProvider"
    );
  }

  return context;
};