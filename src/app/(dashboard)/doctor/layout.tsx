export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-teal-800 text-white p-4">Doctor Dashboard Header</nav>
      <main className="p-8">{children}</main>
    </div>
  );
}
