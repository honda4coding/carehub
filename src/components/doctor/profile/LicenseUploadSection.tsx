"use client";

import { useRef, useState } from "react";
import { LuUpload, LuFileCheck, LuExternalLink, LuCheck, LuX, LuClock } from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";
import { DoctorProfile, uploadDoctorLicense } from "@/services/doctorService";

interface LicenseUploadSectionProps {
  profile: DoctorProfile | null;
  onUploadSuccess: () => void;
  isPending?: boolean;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const MAX_SIZE_MB = 5;

export default function LicenseUploadSection({
  profile,
  onUploadSuccess,
  isPending = false,
}: LicenseUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only PNG, JPG, or PDF files are allowed.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File must be smaller than ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validate(file);
    if (err) { setError(err); setSelectedFile(null); return; }
    setError("");
    setSuccess("");
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setError("");
      await uploadDoctorLicense(selectedFile);
      setSuccess("License uploaded! Pending admin approval before activation.");
      setSelectedFile(null);
      onUploadSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const hasExistingLicense = !!profile?.licenseimage?.secure_url;

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm mt-5">
      <div className="mb-5">
        <h3 className="text-base font-black text-[hsl(var(--color-text))]">Medical License</h3>
        <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
          Upload or update your medical license document
        </p>
      </div>

      {/* Existing License Preview */}
      {hasExistingLicense && (
        <>
        <div className="flex items-center gap-3 bg-[hsl(var(--color-badge-bg))] border border-[hsl(var(--color-primary)/0.2)] rounded-xl px-4 py-3 mb-5">
          <LuFileCheck className="w-5 h-5 text-[hsl(var(--color-primary-strong))] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[hsl(var(--color-badge-text))]">
              Current License on File
            </p>
            <p className="text-xs text-[hsl(var(--color-text-muted))] truncate">
              Verified document uploaded
            </p>
          </div>
          <a
            href={profile!.licenseimage!.secure_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary-strong))] hover:underline shrink-0"
          >
            View <LuExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Pending badge */}
        {isPending && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2.5 rounded-xl mt-3">
            <LuClock className="w-3.5 h-3.5 shrink-0" />
            Awaiting admin approval — your account will be reactivated once reviewed.
          </div>
        )}
        </>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{
          borderColor: dragging
            ? "hsl(var(--color-primary))"
            : selectedFile
            ? "hsl(var(--color-success))"
            : "hsl(var(--color-border))",
          backgroundColor: dragging
            ? "hsl(var(--color-primary)/0.05)"
            : selectedFile
            ? "hsl(var(--color-success-bg))"
            : "hsl(var(--color-bg-soft))",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {selectedFile ? (
          <>
            <LuFileCheck className="w-10 h-10 text-[hsl(var(--color-success))]" />
            <div className="text-center">
              <p className="text-sm font-bold text-[hsl(var(--color-text))]">{selectedFile.name}</p>
              <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — ready to upload
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setSuccess(""); }}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/80 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LuX className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center">
              <LuUpload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[hsl(var(--color-text))]">
                Drop your file here, or{" "}
                <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">
                PNG, JPG, PDF — max {MAX_SIZE_MB}MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      {error && (
        <p className="text-red-500 text-xs font-medium mt-3 pl-1">{error}</p>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-3 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <LuCheck className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full mt-4 py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))",
          }}
        >
          {uploading ? (
            <><ImSpinner2 className="w-5 h-5 animate-spin" /> Uploading...</>
          ) : (
            <><LuUpload className="w-5 h-5" /> Upload License</>
          )}
        </button>
      )}
    </div>
  );
}
