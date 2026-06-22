"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RoleSelector from "@/components/auth/RoleSelector";
import DoctorRegisterForm from "@/components/auth/DoctorRegisterForm";
import PatientRegisterForm from "@/components/auth/PatientRegisterForm";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 self-start border border-white/40 backdrop-blur-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text))]">
          Create New Account
        </h1>
        <p className="text-[hsl(var(--color-text-muted))] mt-2">
          Register as {selectedRole === "doctor" ? "Medical Professional" : "Patient"}
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
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold hover:underline underline-offset-4 transition-all"
            style={{ color: "hsl(var(--color-primary-strong))" }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}


export default function RegisterPage() {
  return (
   
    <div className="min-h-screen flex justify-center p-4 bg-gradient-bg pt-28">
      <Suspense fallback={<div className="mt-20 font-medium text-primary">Loading CareHub...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}