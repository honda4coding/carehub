import DashboardShell from "@/components/global/DashboardShell";
import DoctorAIChatWidget from "@/components/doctor/DoctorAIChatWidget";
import GlobalClinicLimitGuard from "@/components/global/GlobalClinicLimitGuard";
import { ClinicProvider } from "@/context/ClinicContext";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicProvider>
      <GlobalClinicLimitGuard />
      <DashboardShell role="doctor">
        {children}
        <DoctorAIChatWidget />
      </DashboardShell>
    </ClinicProvider>
  );
}
