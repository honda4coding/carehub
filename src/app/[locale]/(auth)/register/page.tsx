"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RoleSelector from "@/components/auth/RoleSelector";
import DoctorRegisterForm from "@/components/auth/DoctorRegisterForm";
import PatientRegisterForm from "@/components/auth/PatientRegisterForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { useTranslations } from "next-intl";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("auth.RegisterPage");
  const roleFromUrl = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient">("doctor");

  useEffect(() => {
    if (roleFromUrl === "patient" || roleFromUrl === "doctor") {
      setSelectedRole(roleFromUrl as "doctor" | "patient");
    }
  }, [roleFromUrl]);

  const handleRoleChange = (role: "doctor" | "patient") => {
    setSelectedRole(role);
    router.push(`/register?role=${role}`, { scroll: false });
  };

  return (
    <AuthCard className="max-w-2xl w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text))]">
          {t("title")}
        </h1>
        <p className="text-[hsl(var(--color-text-muted))] mt-2">
          {selectedRole === "doctor" ? t("subtitleDoctor") : t("subtitlePatient")}
        </p>
      </div>

      <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />

      <div className="mt-4 transition-all duration-500">
        {selectedRole === "doctor" ? (
          <DoctorRegisterForm />
        ) : (
          <PatientRegisterForm />
        )}
      </div>

      <div className="text-center mt-10 pt-8 border-t border-soft/50">
        <p className="text-[hsl(var(--color-text-muted))]">
          {t("alreadyHaveAccount")}{" "}
          <a
            href="/login"
            className="font-bold hover:underline underline-offset-4 transition-all"
            style={{ color: "hsl(var(--color-primary-strong))" }}
          >
            {t("signIn")}
          </a>
        </p>
      </div>
    </AuthCard>
  );
}


export default function RegisterPage() {
    const t = useTranslations("auto");
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
      <Suspense fallback={<div className="mt-20 font-medium text-[hsl(var(--color-primary))] text-center">{t('loadingRegistration')}</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}