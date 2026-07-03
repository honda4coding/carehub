"use client";

import { useRouter } from "next/navigation";
import { LuX, LuLock } from "react-icons/lu";

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  featureName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  featureName?: string 
}) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden text-center p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
        >
          <LuX className="text-lg" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-primary-bg))] text-[hsl(var(--color-primary))] flex items-center justify-center mx-auto mb-4">
          <LuLock className="text-xl" />
        </div>

        <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
          Upgrade Required
        </h3>
        <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
          {featureName ? `The feature '${featureName}'` : "This feature"} requires a premium subscription plan. Please upgrade your plan to unlock it.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors bg-white"
          >
            Maybe later
          </button>
          <button
            onClick={() => {
                onClose();
                router.push("/doctor/settings/subscription");
            }}
            className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
