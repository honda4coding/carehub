// Settings is now unified inside /doctor/profile under the "Security" tab.
// We keep this route alive so old links still work — it just redirects.
import { redirect } from "next/navigation";

export default function DoctorSettingsPage() {
  redirect("/doctor/profile?tab=security");
}
