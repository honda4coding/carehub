"use client";
import { LuUser, LuActivity } from "react-icons/lu";
import { HealthHubProfile } from "@/types/patient";
import Link from "next/link";
import Image from "next/image";
import TrackerBanner from "@/components/patients/TrackerBanner";

interface Props {
  profile: HealthHubProfile;
}

export default function ProfileOverview({ profile }: Props) {
  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Main Bio Card */}
        <div className="md:col-span-12 xl:col-span-5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0 border-2 border-[hsl(var(--color-primary))] overflow-hidden relative">
              {profile.profilepicture ? (
                <Image src={profile.profilepicture} alt={profile.fullName} fill className="object-cover" />
              ) : (
                <LuUser className="text-3xl" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--color-text))]">{profile.fullName}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-[hsl(var(--color-text-muted))]">
                <span>{profile.age} yrs</span>
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--color-border-strong))]" />
                <span>{profile.gender}</span>
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--color-border-strong))]" />
                <span>{profile.phoneNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1">
            <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Address</p>
            <p className="text-sm font-medium text-[hsl(var(--color-text))] md:text-right line-clamp-2 max-w-[200px]">
              {profile.address}
            </p>
          </div>
        </div>

        {/* Tracker Banner */}
        <div className="md:col-span-12 xl:col-span-5 flex shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px rounded-2xl">
          <TrackerBanner className="w-full h-full flex-1" />
        </div>

        {/* Blood Type Card */}
        <div className="md:col-span-12 xl:col-span-2 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger-bg))] rounded-2xl p-4 flex flex-col items-center justify-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
          <p className="text-[10px] font-bold text-[hsl(var(--color-danger))] uppercase tracking-widest mb-1 opacity-80">Blood Type</p>
          <p className="text-3xl font-extrabold text-[hsl(var(--color-danger))] leading-none tracking-tighter">{profile.bloodType || "—"}</p>
        </div>

      </div>
    </section>
  );
}
