import { LuTriangleAlert, LuX, LuInfo, LuCircleCheck } from "react-icons/lu";
import type { Appointment } from "@/services/appointmentService";
import type { PublicAppConfig } from "@/services/appConfigService";
import { dayLabel, isoTo12Hour } from "@/components/appointments/format";

export default function CancelModal({
  open,
  appointment,
  config,
  message,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  appointment?: Appointment | null;
  config?: PublicAppConfig | null;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const doctorName = appointment && typeof appointment.doctorId === "object" ? (appointment.doctorId as any).fullName : "Doctor";
  const apptDateStr = appointment ? `${dayLabel(appointment.appointmentDate)} at ${isoTo12Hour(appointment.startDateTime)}` : "";

  let refundInfo = null;
  
  if (appointment && appointment.paymentStatus === "paid" && config) {
    const paidAmount = appointment.paidAmount || appointment.amount || 0;
    const apptStart = new Date(appointment.startDateTime);
    const now = new Date();
    const hoursUntil = (apptStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil >= 24) {
      refundInfo = { type: "full", refundAmount: paidAmount, percentage: 100 };
    } else {
      const refundAmount = Math.round((paidAmount * config.patientCancellationRefundPercentage) / 100 * 100) / 100;
      refundInfo = {
        type: "partial",
        refundAmount,
        percentage: config.patientCancellationRefundPercentage,
        hoursUntil: Math.max(0, hoursUntil)
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden text-center p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
        >
          <LuX className="text-lg" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center mx-auto mb-4">
          <LuTriangleAlert className="text-xl" />
        </div>

        <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
          Cancel this appointment?
        </h3>
        {message ? (
          <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-4 leading-relaxed">
            {message}
          </p>
        ) : (
          <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-4 leading-relaxed">
            Dr. {doctorName} <br/> {apptDateStr}
          </p>
        )}

        {appointment && appointment.paymentStatus === "paid" && refundInfo && (
          <div className="mb-6 text-left p-3 rounded-xl border bg-[hsl(var(--color-bg-soft))] border-[hsl(var(--color-border-soft))]">
            {refundInfo.type === "full" ? (
              <>
                <div className="flex items-center gap-1.5 text-[hsl(var(--color-success))] font-bold text-[13px] mb-1">
                  <LuCircleCheck className="text-[15px]" /> Full Refund Eligible
                </div>
                <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">
                  You are cancelling more than 24 hours in advance. <strong className="text-[hsl(var(--color-text))]">{refundInfo.refundAmount} EGP</strong> will be refunded to your wallet.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[hsl(var(--color-warning))] font-bold text-[13px] mb-1">
                  <LuInfo className="text-[15px]" /> Partial Refund ({refundInfo.percentage}%)
                </div>
                <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">
                  Because you are cancelling less than 24 hours before the appointment, <strong className="text-[hsl(var(--color-text))]">{refundInfo.refundAmount} EGP</strong> will be refunded to your wallet.
                </p>
              </>
            )}
          </div>
        )}
        
        {appointment && appointment.paymentStatus !== "paid" && (
           <div className="mb-6 p-3 rounded-xl border bg-[hsl(var(--color-bg-soft))] border-[hsl(var(--color-border-soft))]">
             <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">
               This appointment is unpaid. It will be cancelled without any fees or refunds.
             </p>
           </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-text-muted))] transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-danger))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
