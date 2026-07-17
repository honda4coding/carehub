import { fetchClient } from "./fetchClient";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";



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
  tagline?: string;
  languages?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  patientsTreated?: number;
  university?: string;
  graduationYear?: number;
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
  tagline?: string;
  languages?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  patientsTreated?: number;
  university?: string;
  graduationYear?: number;
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
  const formData = new FormData();
  formData.append("license", file);
  await fetchClient.patch("/doctor/license", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** DELETE /doctor/license/pending — cancel pending license */
export async function cancelPendingLicense(): Promise<void> {
  await fetchClient.delete("/doctor/license/pending");
}

// ─── Certificates ────────────────────────────────────────────────────────────────

/** POST /doctor/profile/certificates — multipart/form-data */
export async function uploadDoctorCertificate(
  file: File,
  title: string,
  issuer: string,
  issueDate?: string
): Promise<DoctorProfile["certificates"]> {
  const formData = new FormData();
  formData.append("certificate", file);
  formData.append("title", title);
  formData.append("issuer", issuer);
  if (issueDate) formData.append("issueDate", issueDate);

  const res = await fetchClient.post("/doctor/profile/certificates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
}

/** DELETE /doctor/profile/certificates/:id */
export async function deleteDoctorCertificate(id: string): Promise<void> {
  await fetchClient.delete(`/doctor/profile/certificates/${id}`);
}

// ─── Profile Image & Delete Account ──────────────────────────────────────────

/** PATCH /doctor/profile-image */
export async function uploadDoctorAvatar(file: File): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("profilepicture", file);
  const res = await fetchClient.patch("/doctor/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data?.profilepicture || res.data?.profilepicture;
}

/** DELETE /doctor/profile-image */
export async function deleteDoctorAvatar(): Promise<void> {
  await fetchClient.delete("/doctor/profile-image");
}

/** DELETE /user/profile */
export async function deleteDoctorAccount(): Promise<void> {
  await fetchClient.request("/user/profile", { method: "DELETE" });
}