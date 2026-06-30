"use client";
import { LuUser, LuActivity } from "react-icons/lu";
import { HealthHubProfile } from "@/types/patient";
import Link from "next/link";
import Image from "next/image";
import TrackerBanner from "@/components/patients/TrackerBanner";
import { useTranslations } from "next-intl";

interface Props {
  profile: HealthHubProfile;
}

export default function ProfileOverview({ profile }: Props) {
  const t = useTranslations("patient.ProfileOverview");

  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Main Bio Card */}
        <div className="md:col-span-12 xl:col-span-5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <h2 className="text-2xl font-black text-[hsl(var(--color-text))]">{profile.fullName}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm font-bold text-[hsl(var(--color-text-muted))]">
                <span>{profile.age} {t("years")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-border))]" />
                <span>{profile.gender === "Male" ? t("male") : t("female")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-border))]" />
                <span>{profile.phoneNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1">
            <p className="text-xs font-extrabold text-[hsl(var(--color-text-muted))] uppercase">{t("address")}</p>
            <p className="text-sm font-bold text-[hsl(var(--color-text))] md:text-right line-clamp-2 max-w-[200px]">
              {profile.address}
            </p>
          </div>
        </div>

        {/* Tracker Banner */}
        <div className="md:col-span-12 xl:col-span-5 flex">
          <TrackerBanner className="w-full h-full flex-1" />
        </div>

        {/* Blood Type Card */}
        <div className="md:col-span-12 xl:col-span-2 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger-bg))] rounded-2xl p-4 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-[hsl(var(--color-danger))] uppercase tracking-widest mb-1 opacity-80">{t("bloodType")}</p>
          <p className="text-3xl font-black text-[hsl(var(--color-danger))] leading-none">{profile.bloodType || "—"}</p>
        </div>

      </div>
    </section>
  );
}
