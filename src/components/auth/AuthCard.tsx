import React from "react";

export const AuthCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40 shadow-2xl shadow-[hsl(var(--color-primary)/0.05)] ${className}`}
      style={{ backdropFilter: "blur(24px)", background: "rgba(255, 255, 255, 0.7)" }}
    >
      {children}
    </div>
  );
};
