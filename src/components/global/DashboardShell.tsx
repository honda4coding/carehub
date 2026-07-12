import Sidebar from "./Sidebar";

interface props {
  children: React.ReactNode;
  role: string;
}

export default function DashboardShell({ children, role }: props) {
  return (
    <div id="dashboard-shell-root" className="flex min-h-screen bg-[hsl(var(--color-bg))] selection:bg-[hsl(var(--color-primary)/0.2)]">
      <Sidebar role={role} />
      <div id="dashboard-shell-main" className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
