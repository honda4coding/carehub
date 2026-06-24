import { fetchClient } from "./fetchClient";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  status?: string;   
  profilepicture?: { secure_url: string; public_id: string };
  specialization?: string;
  experience?: number;
  bio?: string;
  licenseimage?: { secure_url: string; public_id: string };
  pendingLicenseImage?: { secure_url: string; public_id: string };
  previousLicenseImage?: { secure_url: string; public_id: string };
}

export interface UpdateDoctorProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** GET /doctor/profile */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  const res = await fetchClient.get("/doctor/profile");
  return res.data;
}

/** PATCH /doctor/profile */
export async function updateDoctorProfile(
  payload: UpdateDoctorProfilePayload
): Promise<void> {
  await fetchClient.request("/doctor/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** PATCH /doctor/license — multipart/form-data */
export async function uploadDoctorLicense(file: File): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const formData = new FormData();
  formData.append("license", file);

  const res = await fetch(`${BASE_URL}/doctor/license`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload license");
  }
}

/** DELETE /doctor/license/pending — cancel pending license */
export async function cancelPendingLicense(): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const res = await fetch(`${BASE_URL}/doctor/license/pending`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to cancel pending license");
  }
}

