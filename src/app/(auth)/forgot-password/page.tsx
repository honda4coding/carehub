"use client";

import React from "react";

/**
 * TODO: DALIA (Task 1: Auth Pages Setup - Forgot Password Request)
 * 
 * Target URL: /forgot-password
 * 
 * Tasks to achieve here:
 * 1. Build Forgot Password UI using Formik and Yup validation.
 * 2. Add email input field with standard email validation rules.
 * 3. Connect onSubmit action to Backend:
 *    - Route: PATCH /users/forget-password
 *    - Body: { email }
 * 4. Redirect on success to `/verify-otp` so the user can verify the recovery code.
 */

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 max-w-md w-full shadow-lg text-center">
        <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
          Forgot Password
        </h2>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
          Placeholder - Forgot password recovery request form goes here.
        </p>

        {/* TODO: Add Formik recovery request form here */}

      </div>
    </div>
  );
}
