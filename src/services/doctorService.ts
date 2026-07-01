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
  certificates?: Array<{
    _id: string;
    title: string;
    issuer: string;
    issueDate?: string;
    secure_url: string;
    public_id: string;
  }>;
}

export interface UpdateDoctorProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
  certificates?: Array<{
    _id: string;
    title: string;
    issuer: string;
    issueDate?: string;
    secure_url: string;
    public_id: string;
  }>;
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

// ─── Certificates ────────────────────────────────────────────────────────────────

/** POST /doctor/profile/certificates — multipart/form-data */
export async function uploadDoctorCertificate(
  file: File,
  title: string,
  issuer: string,
  issueDate?: string
): Promise<DoctorProfile["certificates"]> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const formData = new FormData();
  formData.append("certificate", file);
  formData.append("title", title);
  formData.append("issuer", issuer);
  if (issueDate) formData.append("issueDate", issueDate);

  const res = await fetch(`${BASE_URL}/doctor/profile/certificates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload certificate");
  }
  const data = await res.json();
  return data.data;
}

/** DELETE /doctor/profile/certificates/:id */
export async function deleteDoctorCertificate(id: string): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const res = await fetch(`${BASE_URL}/doctor/profile/certificates/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete certificate");
  }
}

// ─── Profile Image & Delete Account ──────────────────────────────────────────

/** PATCH /doctor/profile-image */
export async function uploadDoctorAvatar(file: File): Promise<{ secure_url: string; public_id: string }> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const formData = new FormData();
  formData.append("profilepicture", file);
  const res = await fetch(`${BASE_URL}/doctor/profile-image`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image");
  }
  const json = await res.json();
  return json.data.profilepicture;
}

/** DELETE /doctor/profile-image */
export async function deleteDoctorAvatar(): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const res = await fetch(`${BASE_URL}/doctor/profile-image`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete image");
  }
}

/** DELETE /user/profile */
export async function deleteDoctorAccount(): Promise<void> {
  await fetchClient.request("/user/profile", { method: "DELETE" });
}