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
    <div
      className="rounded-2xl p-6 flex items-center gap-5 mb-6"
      style={{
        background: "linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(195 75% 38%) 100%)",
      }}
    >
      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/40">
        {profile?.profilepicture?.secure_url ? (
          <Image
            src={profile.profilepicture.secure_url}
            alt={profile.fullName}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-white text-xl font-black">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div>
        <h2 className="text-white text-lg font-black">
          {profile?.fullName ?? "Loading..."}
        </h2>
        <p className="text-white/75 text-sm font-semibold">
          {profile?.specialization ?? "General Practitioner"}
        </p>
        {profile?.email && (
          <p className="text-white/60 text-xs mt-0.5">{profile.email}</p>
        )}
      </div>
    </div>
  );
}
