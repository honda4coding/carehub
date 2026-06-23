"use client";

import { LuUser } from "react-icons/lu";
import Image from "next/image";
import { DoctorProfile } from "@/services/doctorService";

interface ProfileHeaderProps {
  profile: DoctorProfile | null;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <div className="p-6 flex items-center gap-5 bg-[hsl(var(--color-bg-surface))]">
      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[hsl(var(--color-border))]">
        {profile?.profilepicture?.secure_url ? (
          <Image
            src={profile.profilepicture.secure_url}
            alt={profile.fullName}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-[hsl(var(--color-primary-strong))] text-xl font-black">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div>
        <h2 className="text-[hsl(var(--color-text))] text-lg font-black">
          {profile?.fullName ?? "Loading..."}
        </h2>
        <p className="text-[hsl(var(--color-text-muted))] text-[14px] font-semibold mt-0.5">
          {profile?.specialization ?? "General Practitioner"}
        </p>
        {profile?.email && (
          <p className="text-[hsl(var(--color-text-muted))] text-xs mt-0.5">{profile.email}</p>
        )}
      </div>
    </div>
  );
}
