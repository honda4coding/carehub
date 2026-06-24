/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
<<<<<<< HEAD
import { Serwist, NetworkFirst, CacheFirst, NetworkOnly, ExpirationPlugin } from "serwist";
=======
import { Serwist, NetworkOnly, StaleWhileRevalidate, NetworkFirst, ExpirationPlugin } from "serwist";
>>>>>>> c51e3111e9e4f8b5fa33ab76766acdf19c6fdaeb

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
<<<<<<< HEAD
  navigationPreload: true,
  runtimeCaching: [
    // 0. Bypass caching for Next.js prefetch requests to prevent caching unvisited pages
    {
      matcher({ request }) {
        return (
          request.headers.get("Purpose") === "prefetch" ||
          request.headers.get("Sec-Purpose") === "prefetch"
        );
      },
      handler: new NetworkOnly(),
    },
    // 1. Transactional Write APIs (POST, PUT, DELETE, PATCH) -> NetworkOnly
    {
      matcher({ request }) {
        return request.method !== "GET";
      },
      handler: new NetworkOnly(),
    },
    // 2. Dynamic Portal Page Navigations (/patient, /doctor, /admin) -> NetworkFirst
    {
      matcher({ request, url }) {
        const path = url.pathname;
        return (
          request.mode === "navigate" &&
          (path.startsWith("/patient") || path.startsWith("/doctor") || path.startsWith("/admin"))
        );
      },
      handler: new NetworkFirst({
        cacheName: "portal-pages",
        networkTimeoutSeconds: 3, // fallback to cache quickly if connection is slow
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20, // Limit to 20 portal pages
            maxAgeSeconds: 24 * 60 * 60 * 7, // Keep pages up to 7 days
          }),
        ],
      }),
    },
    // 3. Dynamic GET APIs (Appointments, History, Notifications) -> NetworkFirst
    {
      matcher({ request, url }) {
        const path = url.pathname;
        const isGet = request.method === "GET";
        
        let backendOrigin = "";
        if (process.env.NEXT_PUBLIC_API_URL) {
          try {
            backendOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
          } catch {
            backendOrigin = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
          }
        }
        
        const isBackendApi =
          url.origin === "http://localhost:3000" ||
          url.origin === "http://localhost:5000" ||
          (backendOrigin && url.origin === backendOrigin);
          
        return isGet && (isBackendApi || path.startsWith("/api/"));
      },
      handler: new NetworkFirst({
        cacheName: "dynamic-api-data",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50, // Limit to 50 dynamic API responses (LRU)
            maxAgeSeconds: 24 * 60 * 60 * 3, // Keep API data up to 3 days
          }),
        ],
      }),
    },
    // 4. Static Public Assets and Media -> CacheFirst
    {
      matcher({ url }) {
        return (
          url.pathname.startsWith("/icons/") ||
          url.pathname.endsWith(".png") ||
          url.pathname.endsWith(".jpg") ||
          url.pathname.endsWith(".ico")
        );
      },
      handler: new CacheFirst({
        cacheName: "static-media",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30, // Limit to 30 static images/assets
            maxAgeSeconds: 24 * 60 * 60 * 30, // Keep static assets up to 30 days
          }),
        ],
      }),
    },
    // Fallback to standard Next.js service worker cache settings
    ...defaultCache,
=======
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
>>>>>>> c51e3111e9e4f8b5fa33ab76766acdf19c6fdaeb
  ],
  fallbacks: {
    entries: [
      {
<<<<<<< HEAD
=======
        // When a navigation request fails (offline and page isn't cached),
        // serve the precached /~offline page instead of a browser error.
>>>>>>> c51e3111e9e4f8b5fa33ab76766acdf19c6fdaeb
        url: "/~offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();

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
