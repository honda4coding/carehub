"use client";

import { useEffect, useState, useCallback } from "react";
import { ImSpinner2 } from "react-icons/im";
import { LuUser, LuShieldCheck } from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";
import ProfileHeader from "@/components/doctor/profile/ProfileHeader";
import ProfessionalInfoForm from "@/components/doctor/profile/ProfessionalInfoForm";
import LicenseSection from "@/components/doctor/profile/LicenseSection";

import {
  getDoctorProfile,
  DoctorProfile,
  UpdateDoctorProfilePayload,
} from "@/services/doctorService";

type Tab = "profile" | "license";

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "profile", label: "Profile",  icon: <LuUser className="w-4 h-4" />,        desc: "Personal info" },
  { id: "license", label: "License",  icon: <LuShieldCheck className="w-4 h-4" />, desc: "Manage license" },
];

export default function DoctorProfilePage() {
  const [profile,    setProfile]    = useState<DoctorProfile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState<Tab>("profile");

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

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleProfileSaved = (updated: UpdateDoctorProfilePayload) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title="Profile Settings"
        subtitle="Manage your personal information and license"
        backPath="/doctor"
      />

      <main className="flex-1 p-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <ImSpinner2 className="w-7 h-7 animate-spin text-[hsl(var(--color-primary))]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-[hsl(var(--color-danger-bg))] border border-red-200 text-[hsl(var(--color-danger))] text-sm font-medium px-5 py-4 rounded-2xl">
            {error}
            <button onClick={fetchProfile} className="block mt-2 text-xs underline font-bold">
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto w-full flex gap-4 items-start">

            {/* ── Left sidebar — cards ── */}
            <aside className="flex flex-col gap-3 w-44 shrink-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                      isActive
                        ? "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-primary)/0.4)] shadow-[0_0_0_1px_hsl(var(--color-primary)/0.15)]"
                        : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.25)] hover:shadow-md"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                      isActive
                        ? "bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]"
                        : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                    }`}>
                      {tab.icon}
                    </div>

                    {/* Label */}
                    <p className={`text-[13px] font-black leading-tight ${
                      isActive ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"
                    }`}>
                      {tab.label}
                    </p>

                    {/* Desc */}
                    <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">
                      {tab.desc}
                    </p>

                    {/* Active bar */}
                    {isActive && (
                      <div className="mt-3 h-[3px] w-8 rounded-full bg-[hsl(var(--color-primary))]" />
                    )}
                  </button>
                );
              })}
            </aside>

            {/* ── Right content card ── */}
            <div className="flex-1 min-w-0 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
              <ProfileHeader profile={profile} />
              <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6" />

              {activeTab === "profile" && (
                <ProfessionalInfoForm
                  profile={profile}
                  onSaveSuccess={handleProfileSaved}
                />
              )}
              {activeTab === "license" && (
                <LicenseSection
                  profile={profile}
                  onUploadSuccess={fetchProfile}
                />
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
