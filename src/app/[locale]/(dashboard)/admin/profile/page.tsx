"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImSpinner2 } from "react-icons/im";
import { LuShieldCheck, LuCamera, LuTrash2 } from "react-icons/lu";
import Image from "next/image";
import AdminInfoForm from "@/components/admin/profile/AdminInfoForm";
import AdminAvatarSection from "@/components/admin/profile/AdminAvatarSection";
import DeleteAccountModal from "@/components/shared/DeleteAccountModal";
import { getAdminProfile, AdminProfile, UpdateAdminProfilePayload, deleteAdminAccount } from "@/services/adminService";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useTranslations } from "next-intl";

type Tab = "profile" | "avatar" | "danger";

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "profile", label: "Profile", icon: <LuShieldCheck className="w-4 h-4" />, desc: "Account info" },
  { id: "avatar",  label: "Photo",   icon: <LuCamera className="w-4 h-4" />,      desc: "Profile picture" },
  { id: "danger",  label: "Danger",  icon: <LuTrash2 className="w-4 h-4" />,      desc: "Delete account" },
];

export default function AdminProfilePage() {
    const t = useTranslations("auto");
  const router = useRouter();
  const [profile,   setProfile]   = useState<AdminProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">

      <DashboardHeader
        title={t('profileSettings')}
        subtitle={t('manageYourAccountInformation')}
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
            <button onClick={fetchProfile} className="block mt-2 text-xs underline font-bold">{t('tryAgain_bsai')}</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-4 items-start">

            {/* ── Left sidebar ── */}
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
                      isDanger ? "text-[hsl(var(--color-danger))]" : isActive ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"
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

            {/* ── Right content card ── */}
            <div className="flex-1 min-w-0 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">

              {/* Header (يظهر بس في profile tab) */}
              {activeTab === "profile" && (
                <>
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
                  <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6" />
                  <AdminInfoForm profile={profile} onSaveSuccess={handleSaved} />
                </>
              )}

              {activeTab === "avatar" && (
                <AdminAvatarSection profile={profile} onUpdate={handleAvatarUpdate} />
              )}

              {activeTab === "danger" && (
                <div className="p-6">
                  <h3 className="text-[14px] font-black text-[hsl(var(--color-danger))] mb-1">{t('dangerZone')}</h3>
                  <p className="text-[12px] text-[hsl(var(--color-text-muted))] mb-5">
                    {t('permanentlyDeleteYourAccount')}</p>
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