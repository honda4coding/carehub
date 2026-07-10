import { fetchClient } from "./fetchClient";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";



// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  profilepicture?: { secure_url: string; public_id: string };
  dateOfBirth?: string;
  age?: number; // for backward compatibility
  governorate?: string;
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
  dateOfBirth?: string;
  governorate?: string;
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
  const formData = new FormData();
  formData.append("profilepicture", file);
  
  const res = await fetchClient.patch("/patient/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  
  return res.data?.data?.profilepicture || res.data?.profilepicture;
}

/** DELETE /patient/profile-image */
export async function deletePatientAvatar(): Promise<void> {
  await fetchClient.delete("/patient/profile-image");
}

// ─── Delete Account ───────────────────────────────────────────────────────────

/** DELETE /user/profile */
export async function deletePatientAccount(): Promise<void> {
  await fetchClient.request("/user/profile", { method: "DELETE" });
}