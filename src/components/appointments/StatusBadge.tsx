import type { DisplayStatus } from "@/services/appointmentService";
import { useTranslations } from "next-intl";

const STYLES: Record<DisplayStatus, string> = {
  upcoming:
    "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
  completed:
    "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
  cancelled:
    "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]",
};

export default function StatusBadge({ status }: { status: DisplayStatus }) {
  const t = useTranslations("appointments.StatusBadge");
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STYLES[status]}`}
    >
      {t(status)}
    </span>
  );
}
