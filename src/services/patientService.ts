import { fetchClient } from "./fetchClient";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  profilepicture?: { secure_url: string; public_id: string };
  age?: number;
  gender?: "male" | "female";
  bloodType?: string;
  height?: string;
  weight?: string;
  pulse?: string;
  allergies?: string[];
  chronic?: string[];
  sharingSetting?: "all" | "own_only" | "otp";
  surgeries?: {
    operationName: string;
    surgeonName: string;
    date: string;
    report: string;
  }[];
}

export interface UpdatePatientProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  age?: number;
  gender?: "male" | "female";
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  pulse?: string;
  height?: string;
  weight?: string;
  sharingSetting?: "all" | "own_only" | "otp";
  surgeries?: {
    operationName: string;
    surgeonName: string;
    date: string;
    report: string;
  }[];
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** GET /patient/profile */
export async function getPatientProfile(): Promise<PatientProfile> {
  const res = await fetchClient.get("/patient/profile");
  return res.data;
}

/** PATCH /patient/profile */
export async function updatePatientProfile(
  payload: UpdatePatientProfilePayload
): Promise<void> {
  await fetchClient.request("/patient/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** PATCH /patient/profile-image */
export async function uploadPatientAvatar(file: File): Promise<{ secure_url: string; public_id: string }> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const formData = new FormData();
  formData.append("profilepicture", file);

  const res = await fetch(`${BASE_URL}/patient/profile-image`, {
    method: "PATCH",
    credentials: "include", headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image");
  }

  const json = await res.json();
  return json.data.profilepicture;
}

/** DELETE /patient/profile-image */
export async function deletePatientAvatar(): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const res = await fetch(`${BASE_URL}/patient/profile-image`, {
    method: "DELETE",
    credentials: "include", headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete image");
  }
}
