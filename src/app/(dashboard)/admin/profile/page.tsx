"use client";

import { useEffect, useState, useCallback } from "react";
import { ImSpinner2 } from "react-icons/im";
import { LuShieldCheck } from "react-icons/lu";
import Image from "next/image";
import AdminInfoForm from "@/components/admin/profile/AdminInfoForm";
import { getAdminProfile, AdminProfile, UpdateAdminProfilePayload } from "@/services/adminService";

export default function AdminProfilePage() {
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

      {/* Page title */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Profile Settings
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Manage your account information
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
            <button onClick={fetchProfile} className="block mt-2 text-xs underline font-bold">Try again</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-5">

            {/* Header card */}
            <div
              className="rounded-2xl p-6 flex items-center gap-4"
              style={{ background: "linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(195 75% 38%) 100%)" }}
            >
              <div className="relative w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                {profile?.profilepicture?.secure_url ? (
                  <Image src={profile.profilepicture.secure_url} alt={profile.fullName} fill className="object-cover" />
                ) : (
                  <span className="text-white text-xl font-black">{initials}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-lg font-black">{profile?.fullName ?? "—"}</h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    <LuShieldCheck className="w-3 h-3" /> Admin
                  </span>
                </div>
                <p className="text-white/70 text-sm mt-0.5">{profile?.email ?? ""}</p>
              </div>
            </div>

            {/* Basic info form */}
            <AdminInfoForm profile={profile} onSaveSuccess={handleSaved} />
          </div>
        )}
      </main>
    </div>
  );
}
