import React from "react";

export const AuthCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`rounded-2xl p-8 sm:p-10 relative overflow-hidden border border-[hsl(var(--color-border))] shadow-[var(--shadow-modal)] bg-[hsl(var(--color-bg-surface))] ${className}`}
    >
      {/* Subtle top highlight for glass/premium feel */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--color-primary)/0.3)] to-transparent" />
      {children}
    </div>
  );
};
