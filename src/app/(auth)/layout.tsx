import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[calc(100vh-73px)] mt-[73px] flex flex-col items-center justify-start pt-10 md:pt-16 px-4 sm:px-6 pb-12 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at top right, hsl(var(--color-secondary) / 0.12) 0%, transparent 40%),
          radial-gradient(circle at bottom left, hsl(var(--color-primary) / 0.12) 0%, transparent 40%),
          hsl(var(--color-bg))
        `,
      }}
    >
      {/* Decorative grid pattern in the background for a modern look */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
      
      <main className="w-full max-w-md z-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
