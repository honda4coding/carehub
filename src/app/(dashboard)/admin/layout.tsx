export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-red-900 text-white p-4">Admin Dashboard Header</nav>
      <main className="p-8">{children}</main>
    </div>
  );
}
