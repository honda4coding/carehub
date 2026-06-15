import { LuUsers, LuCalendarDays, LuShieldCheck, LuPill, LuFileText } from "react-icons/lu";
import Link from "next/link";

export const DoctorStats = ({ dashboardStats, sessions, setStatusFilter }: { dashboardStats: any, sessions: any[], setStatusFilter?: (status: string) => void }) => {
  const STATS = [
    {
      label: "Total Patients",
      value: dashboardStats.totalPatients?.toString() || "0",
      trend: "Today's patients",
      up: true,
      icon: <LuUsers />,
      iconStyle: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
    },
    {
      label: "Total Prescriptions",
      value: dashboardStats.totalPrescriptions?.toString() || "0",
      trend: "Today's prescriptions",
      up: true,
      icon: <LuPill />,
      iconStyle: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
      link: "/doctor/prescriptions?filter=today"
    },
    {
      label: "Active Sessions",
      value: sessions.filter(s => s.status === "in_progress").length.toString(),
      trend: "Currently in clinic",
      up: true,
      icon: <LuCalendarDays />,
      iconStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
      onClick: () => {
        if(setStatusFilter) {
          setStatusFilter("in_progress");
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    },
    {
      label: "Pending OTPs",
      value: sessions.filter(s => s.status === 'pending_otp').length.toString(),
      trend: "Waiting for verification",
      up: false,
      icon: <LuShieldCheck />,
      iconStyle: "bg-red-100 text-red-600",
      onClick: () => {
        if(setStatusFilter) {
          setStatusFilter("pending_otp");
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS.map((s) => {
        const CardContent = (
          <div
            onClick={s.onClick}
            className={`bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm h-full ${(s.link || s.onClick) ? 'hover:border-primary transition-colors cursor-pointer' : ''}`}
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
        );

        return s.link ? (
          <Link href={s.link} key={s.label} className="block h-full">
            {CardContent}
          </Link>
        ) : (
          <div key={s.label} className="h-full">
            {CardContent}
          </div>
        );
      })}
    </div>
  );
};
