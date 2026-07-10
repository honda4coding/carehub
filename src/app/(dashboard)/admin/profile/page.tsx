"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuLoader } from "react-icons/lu";
import AdminInfoForm from "@/components/admin/profile/AdminInfoForm";
import AdminAvatarSection from "@/components/admin/profile/AdminAvatarSection";
import DeleteAccountModal from "@/components/shared/DeleteAccountModal";
import { getAdminProfile, AdminProfile, UpdateAdminProfilePayload, deleteAdminAccount } from "@/services/adminService";
import DashboardHeader from "@/components/global/DashboardHeader";

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile,   setProfile]   = useState<AdminProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

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

  const handleAvatarUpdate = (pic: { secure_url: string; public_id: string } | null) => {
    setProfile((prev) => prev ? { ...prev, profilepicture: pic ?? undefined } : prev);
  };

  const handleDeleteAccount = async () => {
    await deleteAdminAccount();
    router.replace("/");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">

      <DashboardHeader
        title="Profile Settings"
        subtitle="Manage your account information"
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LuLoader className="w-7 h-7 animate-spin text-[hsl(var(--color-primary))]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.4)] text-[hsl(var(--color-danger))] text-sm font-medium px-5 py-4 rounded-2xl">
            {error}
            <button onClick={fetchProfile} className="block mt-2 text-xs underline font-bold">Try again</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
              <AdminAvatarSection profile={profile} onUpdate={handleAvatarUpdate} />
              <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6"></div>
              <AdminInfoForm profile={profile} onSaveSuccess={handleSaved} />
            </div>

            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6">
                <h3 className="text-[14px] font-black text-[hsl(var(--color-danger))] mb-1">Danger Zone</h3>
                <p className="text-[12px] text-[hsl(var(--color-text-muted))] mb-5">
                  Permanently delete your account. This cannot be undone.
                </p>
                <DeleteAccountModal onConfirm={handleDeleteAccount} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
