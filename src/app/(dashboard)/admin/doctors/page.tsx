import { adminService } from "@/services/adminService";
import DoctorManagementClient from "./DoctorManagementClient";

export default async function AdminDoctorsPage() {
  let initialDoctors = [];
  let error = null;

  try {
    const res = await adminService.getDoctors("");
    initialDoctors = res.data ?? [];
  } catch (err: any) {
    error = err?.message || "Failed to load doctors.";
  }

  return <DoctorManagementClient initialDoctors={initialDoctors} error={error} />;
}
