"use client";

import { useState } from "react";
import { LuCreditCard, LuCheck } from "react-icons/lu";
import { useTranslations } from "next-intl";

export default function PayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("appointments.PayModal");
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-sm overflow-hidden border border-[hsl(var(--color-border))]">
        <div className="bg-[hsl(var(--color-primary))] px-6 py-5 text-white text-center">
          <LuCreditCard className="text-[32px] mx-auto mb-2" />
          <p className="text-[18px] font-black">{t("title")}</p>
          <p className="text-[13px] opacity-80 mt-1">{t("subtitle")}</p>
        </div>
        <div className="p-6 space-y-4">
          {paid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-success-bg))] flex items-center justify-center mx-auto mb-3">
                <LuCheck className="text-[hsl(var(--color-success))] text-[28px]" />
              </div>
              <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{t("successTitle")}</p>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">
                {t("successSubtitle")}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-4 border border-[hsl(var(--color-border))]">
                <div className="flex justify-between text-[14px] font-semibold text-[hsl(var(--color-text-muted))] mb-1">
                  <span>{t("consultationFee")}</span>
                  <span className="text-[hsl(var(--color-text))] font-black">EGP 350</span>
                </div>
                <div className="flex justify-between text-[13px] text-[hsl(var(--color-text-muted))]">
                  <span>{t("platformFee")}</span>
                  <span>EGP 20</span>
                </div>
                <div className="border-t border-[hsl(var(--color-border))] mt-3 pt-3 flex justify-between text-[16px] font-black text-[hsl(var(--color-text))]">
                  <span>{t("total")}</span>
                  <span className="text-[hsl(var(--color-primary))]">EGP 370</span>
                </div>
              </div>
              <button
                onClick={() => setPaid(true)}
                className="w-full cursor-pointer py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[16px] font-black hover:opacity-90 transition-all"
              >
                {t("payNow")}
              </button>
            </>
          )}
          <button
            onClick={() => {
              setPaid(false);
              onClose();
            }}
            className="w-full cursor-pointer py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            {paid ? t("close") : t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
