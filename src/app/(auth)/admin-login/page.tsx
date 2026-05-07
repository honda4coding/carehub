"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { HiOutlineMail, HiOutlineLockClosed, HiShieldCheck } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { useAuth } from "@/context/AuthContext";
import { adminLoginSchema } from "@/components/schemas/adminLoginSchema";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    // Simulate authentication process
    setTimeout(() => {
      const mockAdmin = { id: "admin-1", email: values.email, name: "System Admin" };
      login("admin_secure_token", "admin", mockAdmin);
      setLoading(false);
    }, 1500);
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-[hsl(var(--color-primary))] outline-none transition-all";

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg-soft))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--color-primary))] text-white rounded-2xl shadow-lg mb-4">
            <HiShieldCheck className="text-3xl" />
          </div>
          <h1 className="text-2xl font-black text-[hsl(var(--color-text))]">Admin Portal</h1>
          <p className="text-[hsl(var(--color-text-muted))] text-sm mt-1">Authorized access only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={adminLoginSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--color-text-muted))] ml-1 uppercase tracking-wider">Admin Email</label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <Field
                      name="email"
                      type="email"
                      placeholder="admin@carehub.com"
                      className={inputClasses}
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs ml-1" />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--color-text-muted))] ml-1 uppercase tracking-wider">Master Password</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <Field
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={inputClasses}
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-xs ml-1" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[hsl(var(--color-primary))] text-white font-bold py-4 rounded-xl shadow-lg shadow-[hsl(var(--color-primary)/0.3)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <ImSpinner2 className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Authorize Access"
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Branding */}
        <p className="text-center mt-8 text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-[0.2em]">
          CareHub Control Systems v1.0
        </p>
      </div>
    </div>
  );
}
