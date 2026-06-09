import { LuUsers, LuCalendarDays, LuShieldCheck } from "react-icons/lu";

export const DoctorStats = ({ dashboardStats, sessions }: { dashboardStats: any, sessions: any[] }) => {
  const STATS = [
    {
      label: "Total Consultations",
      value: dashboardStats.totalConsultations.toString(),
      trend: "Lifetime visits",
      up: true,
      icon: <LuUsers />,
      iconStyle: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    },
    {
      label: "Active Sessions",
      value: sessions.filter(s => s.status === "in_progress").length.toString(),
      trend: "Currently in clinic",
      up: true,
      icon: <LuCalendarDays />,
      iconStyle: "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
    },
    {
      label: "Pending OTPs",
      value: sessions.filter(s => s.status === "pending_otp").length.toString(),
      trend: "Waiting for patient",
      up: false,
      icon: <LuShieldCheck />,
      iconStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.iconStyle}`}>
              {s.icon}
            </div>
          </div>
          <p className="text-[24px] font-black text-[hsl(var(--color-text))]">{s.value}</p>
          <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">{s.label}</p>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full mt-2 inline-flex ${
              s.up ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
            }`}>
            {s.trend}
          </span>
        </div>
      ))}
    </div>
  );
};
