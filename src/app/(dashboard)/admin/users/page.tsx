"use client";

import React from "react";

/**
 * TODO: HASSAN (Task 3: [Admin] User Directory & Account Suspension Page)
 * 
 * Target URL: /admin/users
 * 
 * Tasks to achieve here:
 * 1. Build an administrative user directory interface.
 * 2. Connect search input and role filter dropdown to call backend list API:
 *    - Route: GET /admin/users?page=1&limit=20&role=doctor|patient
 *    - Query params: filter list by search or role.
 * 3. Render a table list of users showing: Name, Email, Role, Created Date, and Current Account Status (active/blocked/pending).
 * 4. Wire up action toggle buttons (Suspend / Activate) to trigger backend PATCH requests:
 *    - Suspend Route: PATCH /admin/:id/deactivate
 *    - Activate Route: PATCH /admin/:id/activate
 * 5. Handle action loading states and refresh table content on successful update.
 */

export default function AdminUserManagementPage() {
  return (
    <div className="flex-1 p-6 bg-[hsl(var(--color-bg))] overflow-auto">
      <div className="max-w-6xl mx-auto bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-md text-center">
        <h1 className="text-lg font-black text-[hsl(var(--color-text))]">
          User Directory & Suspension Management
        </h1>
        <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">
          System Administration · Manage all user accounts and suspension statuses.
        </p>

        {/* TODO: Add user search controls, filters, and user directory table list here */}

      </div>
    </div>
  );
}
