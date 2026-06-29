"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { LuCamera, LuTrash2 } from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";
import { DoctorProfile, uploadDoctorAvatar, deleteDoctorAvatar } from "@/services/doctorService";

interface Props {
  profile: DoctorProfile | null;
  onUpdate: (profilepicture: { secure_url: string; public_id: string } | null) => void;
}

export default function DoctorAvatarSection({ profile, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [error,     setError]     = useState("");

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "DR";

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError("");
      const pic = await uploadDoctorAvatar(file);
      onUpdate(pic);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      await deleteDoctorAvatar();
      onUpdate(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const hasImage = !!profile?.profilepicture?.secure_url;

  return (
    <div className="p-6">
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] flex items-center justify-center">
            {hasImage ? (
              <Image
                src={profile!.profilepicture!.secure_url}
                alt={profile?.fullName || "Avatar"}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-black text-[hsl(var(--color-primary-strong))]">
                {initials}
              </span>
            )}
          </div>

          {/* Camera button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[hsl(var(--color-primary))] text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {uploading
              ? <ImSpinner2 className="w-3.5 h-3.5 animate-spin" />
              : <LuCamera className="w-3.5 h-3.5" />
            }
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-[hsl(var(--color-text))] truncate">
            {profile?.fullName ?? "—"}
          </p>
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-0.5">
            {profile?.email ?? ""}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {uploading ? "Uploading..." : hasImage ? "Change Photo" : "Upload Photo"}
            </button>

            {hasImage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting
                  ? <ImSpinner2 className="w-3 h-3 animate-spin" />
                  : <LuTrash2 className="w-3 h-3" />
                }
                {deleting ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-danger text-xs font-medium mt-3">{error}</p>
      )}
    </div>
  );
}