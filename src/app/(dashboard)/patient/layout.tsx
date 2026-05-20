import DashboardShell from "@/components/global/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="patient">{children}</DashboardShell>;
}
