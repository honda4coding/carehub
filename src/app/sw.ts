/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // IMPORTANT: navigationPreload must be false for the offline fallback to work reliably.
  navigationPreload: false,
  runtimeCaching: [
    // 1. Cache static assets (JS, CSS, Images, Fonts) to ensure the offline page renders correctly.
    // Safe to use StaleWhileRevalidate here as these do not contain sensitive medical data.
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && (
          request.destination === "image" ||
          request.destination === "script" ||
          request.destination === "style" ||
          request.destination === "font"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "static-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })],
      }),
    },
    // 2. Strict NetworkOnly for EVERYTHING else (API, HTML, RSC, Cross-origin, Prefetch).
    // This guarantees absolute data security (no medical data cached) and prevents SPA hydration issues.
    {
      matcher: () => true,
      handler: new NetworkOnly(),
    }
  ],
  fallbacks: {
    entries: [
      {
        // When a navigation request fails (offline and page isn't cached),
        // serve the precached /~offline page instead of a browser error.
        url: "/~offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// --- Cache Cleanup on Activation ---
// This ensures that old data caches are strictly deleted when this new security policy takes effect.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes("api-cache") || cacheName.includes("visited-pages")) {
            console.log(`[Service Worker] Deleting outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- Push Notification Handling ---

self.addEventListener("push", (event) => {
  let data = { title: "CareHub Alert", body: "You have a new update", url: "/" };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        data = {
          title: payload.notification.title || data.title,
          body: payload.notification.body || data.body,
          url: payload.notification.data?.url || data.url,
        };
      }
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options: NotificationOptions = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: {
      url: data.url,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
