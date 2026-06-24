"use client";

import { useEffect } from "react";

/**
 * Manages the service worker lifecycle:
 * 1. On app load/reopen: checks for SW updates
 * 2. On visibility change (tab focus / app foreground): checks for updates
 * 3. When a new SW is waiting: auto-activates it and reloads
 * 
 * Combined with skipWaiting + clientsClaim in sw.ts, this ensures
 * the user always gets the latest cached version without stale content.
 */
export default function SWLifecycleManager() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdate = () => {
      if (registration) {
        registration.update().catch((err) => {
          console.log("[SW] Update check failed:", err);
        });
      }
    };

    // When the user returns to the tab / reopens the PWA from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    // When connectivity is restored after being offline
    const handleOnline = () => {
      checkForUpdate();
    };

    // Listen for SW controllerchange (new SW took over) → reload to get fresh content
    const handleControllerChange = () => {
      window.location.reload();
    };

    const init = async () => {
      try {
        registration = await navigator.serviceWorker.ready;

        // Check for updates immediately on mount
        checkForUpdate();

        // Listen for updates when tab gains focus
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Listen for connectivity restoration
        window.addEventListener("online", handleOnline);

        // Reload when a new service worker takes control
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
      } catch (err) {
        console.log("[SW] Registration not available:", err);
      }
    };

    init();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null; // Invisible lifecycle manager
}
