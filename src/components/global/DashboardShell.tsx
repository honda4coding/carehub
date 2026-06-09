import Sidebar from "./Sidebar";

interface props {
  children: React.ReactNode;
  role: string;
}

export default function DashboardShell({ children, role }: props) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--color-bg))]">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
