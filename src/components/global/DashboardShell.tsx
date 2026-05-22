import Sidebar from "./Sidebar";

interface props {
  children: React.ReactNode;
  role: string;
}

export default function DashboardShell({ children, role }: props) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--color-bg))] pt-16">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
