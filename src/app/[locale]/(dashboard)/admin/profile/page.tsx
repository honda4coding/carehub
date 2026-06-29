"use client";

import { useEffect, useState, useCallback } from "react";
import { ImSpinner2 } from "react-icons/im";
import { LuShieldCheck } from "react-icons/lu";
import Image from "next/image";
import AdminInfoForm from "@/components/admin/profile/AdminInfoForm";
import { getAdminProfile, AdminProfile, UpdateAdminProfilePayload } from "@/services/adminService";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useTranslations } from "next-intl";

export default function AdminProfilePage() {
    const t = useTranslations("auto");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSaved = (updated: UpdateAdminProfilePayload) => {
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
  };

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">

      <DashboardHeader
        title={t('profileSettings')}
        subtitle="Manage your account information"
        backPath="/admin"
      />

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
            <button onClick={fetchProfile} className="block mt-2 text-xs underline font-bold">{t('tryAgain_79js')}</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
              {/* Header card */}
              <div className="p-6 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full border-2 border-[hsl(var(--color-border))] overflow-hidden bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0">
                  {profile?.profilepicture?.secure_url ? (
                    <Image src={profile.profilepicture.secure_url} alt={profile.fullName} fill className="object-cover" />
                  ) : (
                    <span className="text-[hsl(var(--color-primary-strong))] text-xl font-black">{initials}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[hsl(var(--color-text))] text-lg font-black">{profile?.fullName ?? "—"}</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[10px] font-bold">
                      <LuShieldCheck className="w-3 h-3" /> {t('admin')}</span>
                  </div>
                  <p className="text-[hsl(var(--color-text-muted))] text-sm mt-0.5">{profile?.email ?? ""}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6"></div>

              {/* Basic info form */}
              <AdminInfoForm profile={profile} onSaveSuccess={handleSaved} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
