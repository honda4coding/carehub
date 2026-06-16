"use client";
import { LuActivity, LuShieldAlert, LuUser, LuRuler, LuWeight, LuScissors } from "react-icons/lu";
import { HealthHubProfile } from "@/types/patient";

interface Props {
  profile: HealthHubProfile;
}

export default function HealthHub({ profile }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3 flex items-center gap-1.5">
        <LuUser className="text-[14px]" /> Centralized Health Hub
      </h2>

      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

        {/* Bio */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <p className="text-[16px] font-black text-[hsl(var(--color-text))] leading-tight">{profile.fullName}</p>
              <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] uppercase">
                {profile.nationalIdStatus}
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-1">National ID Verified · Egyptian Citizen</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-[hsl(var(--color-text))]">
              <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">Age: {profile.age} yrs</span>
              <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">Gender: {profile.gender}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))] text-[10px] text-[hsl(var(--color-text-muted))]">
            <p className="font-bold text-[hsl(var(--color-text))]">Contact Details:</p>
            <p className="mt-1">{profile.phoneNumber}</p>
            <p>{profile.address}</p>
          </div>
        </div>

        {/* Blood Type */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Blood Group</p>
            <span className="text-[11px] text-red-500">❤️</span>
          </div>
          <div className="my-2">
            <p className="text-[36px] font-black text-[hsl(var(--color-text))] leading-none">{profile.bloodType || "—"}</p>
            <p className="text-[10px] font-bold text-[hsl(var(--color-success))] mt-1.5">● Compatible Donor</p>
          </div>
          <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
            Crucial parameter stored securely for trauma or emergency transfusion guidance.
          </p>
        </div>

        {/* Chronic Diseases */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Chronic Diseases</p>
            <LuActivity className="text-[14px] text-[hsl(var(--color-primary))]" />
          </div>
          <div className="my-2 flex flex-col gap-1.5">
            {(profile.chronicDiseases ?? []).length === 0 ? (
              <span className="text-[11px] text-[hsl(var(--color-text-muted))]">None recorded</span>
            ) : profile.chronicDiseases.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]">
                ● {d}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
            Synced with direct clinical records generated during doctor consultations.
          </p>
        </div>

        {/* Allergies */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Allergies</p>
            <LuShieldAlert className="text-[14px] text-[hsl(var(--color-danger))]" />
          </div>
          <div className="my-2 flex flex-wrap gap-1.5">
            {(profile.allergies ?? []).length === 0 ? (
              <span className="text-[11px] text-[hsl(var(--color-text-muted))]">None recorded</span>
            ) : profile.allergies.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]">
                ⚠️ {a}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
            Alerts medical personnel prior to clinical prescription generation to prevent reactions.
          </p>
        </div>
      </div>

      {/* Row 2 — Height, Weight, Surgeries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Height */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary-bg,var(--color-bg-soft)))] flex items-center justify-center shrink-0">
            <LuRuler className="text-[18px] text-[hsl(var(--color-primary))]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Height</p>
            <p className="text-[20px] font-black text-[hsl(var(--color-text))] leading-tight">
              {profile.height ? `${profile.height} cm` : "—"}
            </p>
          </div>
        </div>

        {/* Weight */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-bg-soft))] flex items-center justify-center shrink-0">
            <LuWeight className="text-[18px] text-[hsl(var(--color-primary))]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Weight</p>
            <p className="text-[20px] font-black text-[hsl(var(--color-text))] leading-tight">
              {profile.weight ? `${profile.weight} kg` : "—"}
            </p>
          </div>
        </div>

        {/* Surgeries */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-bg-soft))] flex items-center justify-center shrink-0">
              <LuScissors className="text-[18px] text-[hsl(var(--color-text-muted))]" />
            </div>
            <p className="text-[10px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">Past Surgeries</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {(profile.surgeries ?? []).length === 0 ? (
              <span className="text-[11px] text-[hsl(var(--color-text-muted))]">None recorded</span>
            ) : profile.surgeries!.map((s, i) => (
              <span key={i} className="text-[11px] font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-soft))] px-2.5 py-1 rounded-lg">
                🔹 {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
