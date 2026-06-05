"use client";

import React from "react";

/**
 * TODO: DALIA (Task 1: Auth Pages Setup - Reset Password)
 * 
 * Target URL: /reset-password
 * 
 * Tasks to achieve here:
 * 1. Build Reset Password UI with fields for email, OTP code, new password, and password confirmation.
 * 2. Setup Yup validations:
 *    - Password must be at least 6 characters.
 *    - Confirmation must match the password field exactly.
 * 3. Connect onSubmit to Backend:
 *    - Route: POST /users/reset-password
 *    - Body: { email, code: otpCode, newpassword }
 * 4. Redirect upon success to `/login` with success banner.
 */

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 max-w-md w-full shadow-lg text-center">
        <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
          Reset Password
        </h2>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
          Placeholder - Reset password entry form goes here.
        </p>

        {/* TODO: Add Formik password reset input fields here */}

      </div>
    </div>
  );
}
