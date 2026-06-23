import React from "react";
import { LuChevronLeft } from "react-icons/lu";
import { useRouter } from "next/navigation";

export default function NotificationsHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all cursor-pointer shadow-sm"
      >
        <LuChevronLeft className="text-[15px]" />
      </button>

      <div>
        <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight">
          Notifications
        </h1>
        <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
          View and manage all notifications
        </p>
      </div>
    </div>
  );
}
