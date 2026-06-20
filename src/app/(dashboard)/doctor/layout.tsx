import DashboardShell from "@/components/global/DashboardShell";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="doctor">
      {children}
    </DashboardShell>
  );
}
