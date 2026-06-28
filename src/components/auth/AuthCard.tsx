import React from "react";

export const AuthCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-[hsl(var(--color-border))] shadow-2xl shadow-[hsl(var(--color-primary)/0.05)] bg-[hsl(var(--color-bg-surface)/0.7)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
};
