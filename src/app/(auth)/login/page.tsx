import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
<div
      className="min-h-screen flex items-start justify-center p-6 pt-28" 
      style={{
        background: `
          radial-gradient(circle at top right, hsl(var(--color-secondary) / 0.15) 0%, transparent 40%),
          radial-gradient(circle at bottom left, hsl(var(--color-primary) / 0.15) 0%, transparent 40%),
          hsl(var(--color-bg))
        `,
      }}
    >
      {/* ===== HEADER ===== */}
      {/* <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-md">
        <div className="flex items-center justify-between px-10 py-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8"
              style={{ color: "hsl(var(--color-primary))" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
              <path d="M12 14c-5 0-9 2-9 4v1h18v-1c0-2-4-4-9-4z" />
              <line x1="12" y1="6" x2="12" y2="10" />
              <line x1="10" y1="8" x2="14" y2="8" />
            </svg>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #0891B2, hsl(var(--color-secondary)))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              CareHub
            </h1>
          </div>
        </div>
      </header> */}

      {/* ===== MAIN ===== */}
      <main className="w-full max-w-2xl  pt-20">
        <LoginForm />
      </main>

      {/* ===== FOOTER ===== */}
      {/* <footer className="fixed bottom-0 w-full py-6">
        <div className="flex flex-col md:flex-row justify-between items-center px-10 max-w-7xl mx-auto opacity-50">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            © 2024 CareHub. All rights reserved.
          </span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-[10px] uppercase tracking-widest text-slate-400 underline underline-offset-4"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[10px] uppercase tracking-widest text-slate-400 underline underline-offset-4"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
