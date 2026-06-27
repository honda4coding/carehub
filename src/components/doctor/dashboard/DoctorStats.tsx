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
      link: "/doctor/patients?filter=today"
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
      iconStyle: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
      onClick: () => {
        if(setStatusFilter) {
          setStatusFilter("pending_otp");
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map((s) => {
        const CardContent = (
          <div
            onClick={s.onClick}
            className={`bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 h-full flex flex-col justify-center ${
              (s.link || s.onClick) ? 'hover:border-[hsl(var(--color-primary)/0.5)] transition-colors cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] shrink-0 ${s.iconStyle}`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1">{s.label}</p>
                <div className="flex items-end gap-3 flex-wrap">
                  <p className="text-[30px] leading-none font-black text-[hsl(var(--color-text))]">{s.value}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex whitespace-nowrap mb-1 ${
                    s.up ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                  }`}>
                    {s.trend}
                  </span>
                </div>
              </div>
            </div>
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
