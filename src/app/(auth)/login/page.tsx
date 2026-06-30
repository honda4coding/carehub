import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
<div
      className="min-h-screen flex items-center justify-center pt-24 px-6 pb-6"
      style={{
        background: `
          radial-gradient(circle at top right, hsl(var(--color-secondary) / 0.15) 0%, transparent 40%),
          radial-gradient(circle at bottom left, hsl(var(--color-primary) / 0.15) 0%, transparent 40%),
          hsl(var(--color-bg))
        `,
      }}
    >
      <main className="w-full max-w-md">
        <Suspense fallback={<div className="mt-20 font-medium text-primary text-center">Loading Login...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}

