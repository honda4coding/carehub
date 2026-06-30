"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  LuShieldCheck,
  LuClock,
  LuUpload,
  LuExternalLink,
  LuFileImage,
  LuCheck,
  LuX,
  LuHistory,
} from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";
import { DoctorProfile, uploadDoctorLicense, cancelPendingLicense } from "@/services/doctorService";
import { useTranslations } from "next-intl";

interface Props {
  profile: DoctorProfile | null;
  onUploadSuccess: () => void; // refetch profile after upload
}

export default function LicenseSection({ profile, onUploadSuccess }: Props) {
    const t = useTranslations("auto");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const hasCurrent  = !!profile?.licenseimage?.secure_url;
  const hasPending  = !!profile?.pendingLicenseImage?.secure_url;
  const hasPrevious = !!profile?.previousLicenseImage?.secure_url;

  // ─── File pick ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    setError("");
    setSuccess("");

    if (!picked.type.startsWith("image/")) {
      setError("Only image files are accepted.");
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError("File size must be under 5 MB.");
      return;
    }

    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  // ─── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      setSuccess("");
      await uploadDoctorLicense(file);
      setSuccess("License uploaded! Waiting for admin approval.");
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ─── Cancel pending ───────────────────────────────────────────────────────
  const handleCancelPending = async () => {
    try {
      setCancelling(true);
      setError("");
      setSuccess("");
      await cancelPendingLicense();
      setSuccess("Pending license cancelled successfully.");
      onUploadSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-5">
      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <LuShieldCheck className="w-4 h-4 text-[hsl(var(--color-primary))]" />
        <h3 className="text-[13px] font-black text-[hsl(var(--color-text))]">
          {t('licenseManagement')}</h3>
      </div>

      {/* ── Server messages ───────────────────────────────────────────────── */}
      {(error || success) && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium ${
            error
              ? "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]"
              : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
          }`}
        >
          {error ? <LuX className="w-4 h-4 shrink-0" /> : <LuCheck className="w-4 h-4 shrink-0" />}
          {error || success}
        </div>
      )}

      {/* ── Cards row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current license */}
        <LicenseCard
          title={t('currentLicense')}
          subtitle={t('activeApproved')}
          url={profile?.licenseimage?.secure_url}
          badge={{ label: "Approved", color: "success" }}
          emptyText="No license on file yet."
          icon={<LuShieldCheck />}
        />

        {/* Pending license */}
        {hasPending && (
          <div className="space-y-2">
            <LicenseCard
              title={t('pendingLicense')}
              subtitle={t('awaitingAdminReview')}
              url={profile?.pendingLicenseImage?.secure_url}
              badge={{ label: "Under Review", color: "warning" }}
              emptyText=""
              icon={<LuClock />}
            />
            {/* Cancel pending button */}
            <button
              onClick={handleCancelPending}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger-bg))] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {cancelling
                ? <><ImSpinner2 className="w-3.5 h-3.5 animate-spin" /> {t('cancelling')}</>
                : <><LuX className="w-3.5 h-3.5" /> {t('cancelPending')}</>
              }
            </button>
          </div>
        )}

        {/* Previous license — collapsed by default */}
        {hasPrevious && !hasPending && (
          <LicenseCard
            title={t('previousLicense')}
            subtitle={t('replacedAfterLastApproval')}
            url={profile?.previousLicenseImage?.secure_url}
            badge={{ label: "Archived", color: "muted" }}
            emptyText=""
            icon={<LuHistory />}
          />
        )}
      </div>

      {/* ── Upload area ───────────────────────────────────────────────────── */}
      <div className="border border-dashed border-[hsl(var(--color-border))] rounded-2xl p-5 space-y-4">
        <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
          {hasPending
            ? "You already have a license under review. You can still replace it by uploading a new one."
            : "Upload a new license image for admin approval."}
        </p>

        {/* Dropzone / file picker */}
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-bg-surface-hover))] transition-colors cursor-pointer"
          >
            <LuFileImage className="w-8 h-8 text-[hsl(var(--color-text-muted))]" />
            <span className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
              {t('clickToChooseAn')}</span>
            <span className="text-[11px] text-[hsl(var(--color-text-muted))]">
              {t('pngJpgWebpMax')}</span>
          </button>
        ) : (
          /* Preview */
          <div className="relative w-full rounded-xl overflow-hidden border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))]">
            <div className="relative w-full h-48">
              <Image src={preview} alt={t('licensePreview')} fill className="object-contain p-2" />
            </div>
            <div className="px-4 py-3 border-t border-[hsl(var(--color-border))] flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
                {file?.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-[12px] font-bold text-[hsl(var(--color-danger))] hover:underline"
                >
                  {t('cancel')}</button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black text-white bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {uploading ? (
                    <><ImSpinner2 className="w-3.5 h-3.5 animate-spin" /> {t('uploading')}</>
                  ) : (
                    <><LuUpload className="w-3.5 h-3.5" /> {t('submitForReview')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

// ─── LicenseCard ──────────────────────────────────────────────────────────────
type BadgeColor = "success" | "warning" | "muted";

const badgeStyles: Record<BadgeColor, string> = {
  success: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  warning: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  muted:   "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]",
};

function LicenseCard({
  title,
  subtitle,
  url,
  badge,
  emptyText,
  icon,
}: {
  title: string;
  subtitle: string;
  url?: string;
  badge: { label: string; color: BadgeColor };
  emptyText: string;
  icon: React.ReactNode;
}) {
    const t = useTranslations("auto");
  return (
    <div className="border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 flex items-center justify-between bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))]">
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--color-primary))] w-4 h-4">{icon}</span>
          <div>
            <p className="text-[13px] font-black text-[hsl(var(--color-text))]">{title}</p>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium">{subtitle}</p>
          </div>
        </div>
        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${badgeStyles[badge.color]}`}>
          {badge.label}
        </span>
      </div>

      {/* Card body */}
      {url ? (
        <div className="relative w-full h-40 bg-[hsl(var(--color-bg-soft))] group">
          <Image src={url} alt={title} fill className="object-contain p-3" />
          {/* Hover overlay — open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="flex items-center gap-1.5 text-white text-[12px] font-black bg-black/60 px-3 py-1.5 rounded-lg">
              <LuExternalLink className="w-3.5 h-3.5" /> {t('viewFull')}</span>
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
          {emptyText}
        </div>
      )}
    </div>
  );
}
