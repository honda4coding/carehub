"use client";

import { useEffect, useState, useCallback } from "react";
import { ImSpinner2 } from "react-icons/im";
import ProfileHeader from "@/components/doctor/profile/ProfileHeader";
import ProfessionalInfoForm from "@/components/doctor/profile/ProfessionalInfoForm";

import {
  getDoctorProfile,
  DoctorProfile,
  UpdateDoctorProfilePayload,
} from "@/services/doctorService";

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctorProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSaved = (updated: UpdateDoctorProfilePayload) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      {/* Page title */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Profile Settings
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Manage your personal information
        </p>
      </header>

      <main className="flex-1 p-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <ImSpinner2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-danger-light border border-red-200 text-danger text-sm font-medium px-5 py-4 rounded-2xl">
            {error}
            <button
              onClick={fetchProfile}
              className="block mt-2 text-xs underline font-bold"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-5">
            <ProfileHeader profile={profile} />
            <ProfessionalInfoForm
              profile={profile}
              onSaveSuccess={handleProfileSaved}
            />
          </div>
        )}
      </main>
    </div>
  );
}
