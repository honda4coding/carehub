/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, NetworkOnly, ExpirationPlugin } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that points to where the precache manifest should be injected.
// By default, that string is `"self.__SW_MANIFEST"`.
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
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();

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

