export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-800 text-white p-4">Patient Dashboard Header</nav>
      <main className="p-8">{children}</main>
    </div>
  );
}
