"use client";

import { useEffect } from "react";

export default function PWARegistry() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }).then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      }).catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }
  }, []);

  return null;
}
