"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/auth/AuthCard";
import { HiOutlineMail, HiOutlineLockClosed, HiShieldCheck } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { useAuth } from "@/context/AuthContext";
import { adminLoginSchema } from "@/components/schemas/adminLoginSchema";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export default function AdminLoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (values: { email: string; password: string }) => {
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Invalid credentials");
      return;
    }

    login(data.data.access_token, "admin", {
      id: data.data.id,
      email: values.email,
      name: "System Admin",
    });

  } catch {
    alert("Something went wrong. Please check your connection.");
  } finally {
    setLoading(false);
  }
};

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
        <AuthCard>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--color-primary))] text-white rounded-2xl mx-auto mb-4 shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
              <HiShieldCheck className="text-3xl" />
            </div>
            <h1 className="text-2xl font-black text-[hsl(var(--color-text))]">Admin Portal</h1>
            <p className="text-[hsl(var(--color-text-muted))] text-sm mt-1">Authorized access only</p>
          </div>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={adminLoginSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label>Admin Email</Label>
                  <Field name="email">
                    {({ field, meta }: FieldProps) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@carehub.com"
                        leftIcon={<HiOutlineMail className="w-5 h-5" />}
                        error={!!(meta.touched && meta.error)}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="email" component="p" className="text-[hsl(var(--color-danger))] text-xs pl-2 font-bold mt-1" />
                </div>

                {/* Password Field */}
                <div>
                  <Label>Master Password</Label>
                  <Field name="password">
                    {({ field, meta }: FieldProps) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        leftIcon={<HiOutlineLockClosed className="w-5 h-5" />}
                        error={!!(meta.touched && meta.error)}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="password" component="p" className="text-[hsl(var(--color-danger))] text-xs pl-2 font-bold mt-1" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    isLoading={loading}
                  >
                    Authorize Access
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-10 pt-8 border-t border-[hsl(var(--color-border))] text-center">
            <p className="text-center text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-[0.2em]">
              CareHub Control Systems v1.0
            </p>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
