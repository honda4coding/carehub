"use client";
import { useEffect } from "react";
import { LuCheck, LuTriangleAlert } from "react-icons/lu";

export default function AppointmentToast({
  message,
  variant = "success",
  onClose,
}: {
  message: string;
  variant?: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = variant === "error";

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-bold ${
        isError
          ? "bg-[hsl(var(--color-danger))] text-white"
          : "bg-[hsl(var(--color-text))] text-[hsl(var(--color-bg-surface))]"
      }`}
    >
      {isError ? (
        <LuTriangleAlert className="text-[15px]" />
      ) : (
        <LuCheck className="text-[15px]" />
      )}
      {message}
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity ml-1"
      >
        ✕
      </button>
    </div>
  );
}
