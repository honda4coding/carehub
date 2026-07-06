"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuLoader } from "react-icons/lu";
import { LuUser, LuShieldCheck, LuCamera, LuTrash2, LuAward } from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";
import ProfileHeader from "@/components/doctor/profile/ProfileHeader";
import ProfessionalInfoForm from "@/components/doctor/profile/ProfessionalInfoForm";
import LicenseSection from "@/components/doctor/profile/LicenseSection";
import DoctorAvatarSection from "@/components/doctor/profile/DoctorAvatarSection";
import CertificateSection from "@/components/doctor/profile/CertificateSection";
import DeleteAccountModal from "@/components/shared/DeleteAccountModal";

import {
  getDoctorProfile,
  DoctorProfile,
  UpdateDoctorProfilePayload,
  deleteDoctorAccount,
} from "@/services/doctorService";

type Tab = "profile" | "license" | "avatar" | "certificates" | "danger";

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "profile", label: "Profile",  icon: <LuUser className="w-4 h-4" />,        desc: "Personal info" },
  { id: "license", label: "License",  icon: <LuShieldCheck className="w-4 h-4" />, desc: "Manage license" },
  { id: "avatar",  label: "Photo",    icon: <LuCamera className="w-4 h-4" />,       desc: "Profile picture" },
  { id: "certificates", label: "Certificates", icon: <LuAward className="w-4 h-4" />, desc: "Achievements" },
  { id: "danger",  label: "Danger",   icon: <LuTrash2 className="w-4 h-4" />,       desc: "Delete account" },
];

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile,   setProfile]   = useState<DoctorProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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

  const handleAvatarUpdate = (pic: { secure_url: string; public_id: string } | null) => {
    setProfile((prev) => prev ? { ...prev, profilepicture: pic ?? undefined } : prev);
  };

  const handleDeleteAccount = async () => {
    await deleteDoctorAccount();
    router.replace("/");
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
            <LuLoader className="w-7 h-7 animate-spin text-[hsl(var(--color-primary))]" />
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
        {!loading && !error && profile && (
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-4 items-start">

            {/* â”€â”€ Left sidebar â”€â”€ */}
            <aside className="flex flex-row md:flex-col gap-3 w-full md:w-44 shrink-0 overflow-x-auto scrollbar-hide pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-[140px] md:w-full shrink-0 text-left p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col md:block ${
                      isDanger
                        ? isActive
                          ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.4)]"
                          : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-danger)/0.3)]"
                        : isActive
                          ? "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-primary)/0.4)] shadow-[0_0_0_1px_hsl(var(--color-primary)/0.15)]"
                          : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.25)] hover:shadow-md"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                      isDanger
                        ? "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]"
                        : isActive
                          ? "bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]"
                          : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                    }`}>
                      {tab.icon}
                    </div>

                    <p className={`text-[13px] font-black leading-tight ${
                      isDanger
                        ? "text-[hsl(var(--color-danger))]"
                        : isActive
                          ? "text-[hsl(var(--color-text))]"
                          : "text-[hsl(var(--color-text-muted))]"
                    }`}>
                      {tab.label}
                    </p>

                    <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">
                      {tab.desc}
                    </p>

                    {isActive && !isDanger && (
                      <div className="mt-3 h-[3px] w-8 rounded-full bg-[hsl(var(--color-primary))]" />
                    )}
                  </button>
                );
              })}
            </aside>

            {/* â”€â”€ Right content card â”€â”€ */}
            <div className="flex-1 min-w-0 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">

              {/* ProfileHeader ÙŠØ¸Ù‡Ø± Ø¨Ø³ ÙÙŠ profile Ùˆ license */}
              {(activeTab === "profile" || activeTab === "license") && (
                <>
                  <ProfileHeader profile={profile} />
                  <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6" />
                </>
              )}

              {activeTab === "profile" && (
                <ProfessionalInfoForm profile={profile} onSaveSuccess={handleProfileSaved} />
              )}
              {activeTab === "license" && (
                <LicenseSection profile={profile} onUploadSuccess={fetchProfile} />
              )}
              {activeTab === "avatar" && (
                <DoctorAvatarSection profile={profile} onUpdate={handleAvatarUpdate} />
              )}
              {activeTab === "certificates" && (
                <CertificateSection
                  profile={profile!}
                  onUpdate={(updated) => setProfile(updated)}
                />
              )}
              {activeTab === "danger" && (
                <div className="p-6">
                  <h3 className="text-[14px] font-black text-[hsl(var(--color-danger))] mb-1">Danger Zone</h3>
                  <p className="text-[12px] text-[hsl(var(--color-text-muted))] mb-5">
                    Permanently delete your account. This cannot be undone.
                  </p>
                  <DeleteAccountModal onConfirm={handleDeleteAccount} />
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
