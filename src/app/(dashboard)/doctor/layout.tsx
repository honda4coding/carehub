import DashboardShell from "@/components/global/DashboardShell";
import DoctorAIChatWidget from "@/components/doctor/DoctorAIChatWidget";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="doctor">
      {children}
      <DoctorAIChatWidget />
    </DashboardShell>
  );
}
