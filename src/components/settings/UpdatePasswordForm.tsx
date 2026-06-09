"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { HiOutlineLockClosed } from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const updatePasswordSchema = Yup.object({
  oldpassword: Yup.string().required("Old password is required"),
  newpassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  cpassword: Yup.string()
    .oneOf([Yup.ref("newpassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type UpdatePasswordValues = {
  oldpassword: string;
  newpassword: string;
  cpassword: string;
};

export default function UpdatePasswordForm() {
  const { token } = useAuth();
  const [serverError, setServerError] = React.useState("");
  const [serverSuccess, setServerSuccess] = React.useState("");

  const handleSubmit = async (
    values: UpdatePasswordValues,
    { setSubmitting, resetForm }: FormikHelpers<UpdatePasswordValues>
  ) => {
    try {
      setServerError("");
      setServerSuccess("");

      const res = await fetch(`${BASE_URL}/users/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldpassword: values.oldpassword,
          newpassword: values.newpassword,
          cpassword: values.cpassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Something went wrong.");
        return;
      }

      setServerSuccess("Password updated successfully!");
      resetForm();
    } catch {
      setServerError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
<div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 w-5xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-[hsl(var(--color-text))]">
          Update Password
        </h2>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">
          Enter your current password and choose a new one.
        </p>
      </div>

      {/* Server Messages */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
          {serverError}
        </div>
      )}
      {serverSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
          {serverSuccess}
        </div>
      )}

      <Formik
        initialValues={{ oldpassword: "", newpassword: "", cpassword: "" }}
        validationSchema={updatePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-4">

            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                style={{ color: "hsl(var(--color-text-muted))" }}>
                Current Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Field name="oldpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  style={{
                    backgroundColor: errors.oldpassword && touched.oldpassword ? "#fff5f5" : "white",
                    border: errors.oldpassword && touched.oldpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="oldpassword" component="p" className="text-red-500 text-xs pl-4 font-medium" />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                style={{ color: "hsl(var(--color-text-muted))" }}>
                New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Field name="newpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  style={{
                    backgroundColor: errors.newpassword && touched.newpassword ? "#fff5f5" : "white",
                    border: errors.newpassword && touched.newpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="newpassword" component="p" className="text-red-500 text-xs pl-4 font-medium" />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                style={{ color: "hsl(var(--color-text-muted))" }}>
                Confirm New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Field name="cpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  style={{
                    backgroundColor: errors.cpassword && touched.cpassword ? "#fff5f5" : "white",
                    border: errors.cpassword && touched.cpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="cpassword" component="p" className="text-red-500 text-xs pl-4 font-medium" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))" }}>
              {isSubmitting ? (
                <><ImSpinner2 className="w-5 h-5 animate-spin" /> Updating...</>
              ) : (
                <>Update Password <HiOutlineArrowRight className="w-5 h-5" /></>
              )}
            </button>

          </Form>
        )}
      </Formik>
    </div>
  );
}