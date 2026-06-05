"use client";

import React from "react";

/**
 * TODO: DALIA (Task 1: Auth Pages Setup - OTP Verification)
 * 
 * Target URL: /verify-otp
 * 
 * Tasks to achieve here:
 * 1. Implement segmented numeric inputs (e.g., 4 or 6 boxes).
 * 2. Handlers to shift focus between input segments automatically as user types.
 * 3. Form validation to ensure numeric-only characters.
 * 4. Wire the verify trigger to the Backend PATCH request:
 *    - Route: /users/confirm-email (if verify sign-up)
 *    - Route: /users/reset-password (verify forget-password OTP verification)
 * 5. Handle success/error states with user-friendly alerts.
 */

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 max-w-md w-full shadow-lg text-center">
        <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
          Verify OTP Code
        </h2>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
          Placeholder - OTP verification view goes here.
        </p>
        
        {/* TODO: Add segmented numeric input form here */}

      </div>
    </div>
  );
}
