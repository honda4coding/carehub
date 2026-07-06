import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mt-20 font-medium text-[hsl(var(--color-primary))] text-center">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
