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
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 self-start">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-dark">
          Create New Account
        </h1>
        <p className="text-gray-500 mt-2">
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

      <div className="text-center mt-6 pt-6 border-t border-gray-100">
        <p className="text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-gradient font-bold hover:opacity-80 transition underline-offset-4 hover:underline"
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