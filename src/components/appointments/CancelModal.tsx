import { LuTriangleAlert, LuX } from "react-icons/lu";
import { useTranslations } from "next-intl";

export default function CancelModal({
  open,
  message,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("appointments.CancelModal");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden text-center p-6">
        <button
          onClick={onClose}
          className="absolute top-3 end-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
        >
          <LuX className="text-lg" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center mx-auto mb-4">
          <LuTriangleAlert className="text-xl" />
        </div>

        <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
          {t("title")}
        </h3>
        <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-text-muted))] transition-colors"
          >
            {t("keepIt")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-danger))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? t("cancelling") : t("yesCancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
