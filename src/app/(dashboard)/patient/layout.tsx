import DashboardShell from "@/components/global/DashboardShell";
import AIChatWidget from "@/components/patient/AIChatWidget";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardShell role="patient">{children}</DashboardShell>
      <AIChatWidget />
    </>
  );
}
