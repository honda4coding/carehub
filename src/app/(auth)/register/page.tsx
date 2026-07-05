import DoctorRegisterForm from "@/components/auth/DoctorRegisterForm";
import PatientRegisterForm from "@/components/auth/PatientRegisterForm";
import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

// Using a wrapper component since Register requires handling role logic
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role || "patient";

  return (
    <div className="w-full">
      <AuthCard>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[hsl(var(--color-text))] tracking-tight">Create an Account</h1>
          <p className="text-sm text-[hsl(var(--color-text-muted))] mt-2">Join CareHub to manage your health</p>
        </div>

        <div className="flex gap-2 p-1 bg-[hsl(var(--color-bg-soft))] rounded-xl mb-8">
          <Link
            href="/register?role=patient"
            className={`flex-1 text-center py-2 text-sm font-medium rounded-[10px] transition-all ${
              role === "patient"
                ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-primary))] shadow-[var(--shadow-sm)]"
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))/50]"
            }`}
          >
            Patient
          </Link>
          <Link
            href="/register?role=doctor"
            className={`flex-1 text-center py-2 text-sm font-medium rounded-[10px] transition-all ${
              role === "doctor"
                ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-primary))] shadow-[var(--shadow-sm)]"
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))/50]"
            }`}
          >
            Doctor
          </Link>
        </div>

        <Suspense fallback={<div className="text-center text-[hsl(var(--color-primary))]">Loading Form...</div>}>
          {role === "doctor" ? <DoctorRegisterForm /> : <PatientRegisterForm />}
        </Suspense>

        <div className="mt-6 text-center text-sm text-[hsl(var(--color-text-muted))]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-strong))] transition-colors">
            Sign in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
