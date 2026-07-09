"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/auth/AuthCard";
import { LuMail, LuLock, LuShieldCheck } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { adminLoginSchema } from "@/components/schemas/adminLoginSchema";
import { fetchClient } from "@/services/fetchClient";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (values: { email: string; password: string }) => {
  setLoading(true);
  try {
    const data = await fetchClient.post("/users/signin", {
      email: values.email,
      password: values.password,
    });

    login(data.data.access_token, "admin", {
      id: data.data.id,
      email: values.email,
      name: "System Admin",
    });

  } catch (err: any) {
    let errorMsg = err.message || "Invalid credentials. Please try again.";
    if (err.message === "validation error" && Array.isArray(err.error)) {
      errorMsg = err.error.map((e: any) => e.message).join(", ");
    }
    alert(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    
      
        <AuthCard>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--color-primary))] text-white rounded-2xl mx-auto mb-4 shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
              <LuShieldCheck className="text-3xl" />
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
                        leftIcon={<LuMail className="w-5 h-5" />}
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
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        leftIcon={<LuLock className="w-5 h-5" />}
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
  );
}

