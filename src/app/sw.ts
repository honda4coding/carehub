/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly, StaleWhileRevalidate, NetworkFirst, ExpirationPlugin } from "serwist";

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
    // 1. Bypass caching for Next.js prefetch requests to prevent filling the cache with unvisited links.
    {
      matcher({ request }) {
        return (
          request.headers.get("Next-Router-Prefetch") === "1" ||
          request.headers.get("Purpose") === "prefetch" ||
          request.headers.get("Sec-Purpose") === "prefetch"
        );
      },
      handler: new NetworkOnly(),
    },
    // 2. Bypass caching for non-GET requests (POST, PUT, DELETE, PATCH).
    {
      matcher({ request }) {
        return request.method !== "GET";
      },
      handler: new NetworkOnly(),
    },
    // 3. Cache backend API GET requests (Cross-origin fetch/XHR).
    // This solves the "Failed to fetch" issue by caching the data requested by the page components.
    {
      matcher({ request, sameOrigin }) {
        return !sameOrigin && request.method === "GET" && request.destination === "";
      },
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })],
      }),
    },
    // 4. Bypass caching for ANY OTHER cross-origin requests (e.g., Cloudinary images, external tracking scripts).
    {
      matcher({ sameOrigin }) {
        return !sameOrigin;
      },
      handler: new NetworkOnly(),
    },
    // 5. Cache static assets (JS, CSS, Images, Fonts).
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
    // 6. Cache explicitly visited HTML pages and RSC payloads.
    // We use NetworkFirst so the user always gets fresh data when online,
    // but can view the cached page when offline.
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && (
          request.mode === "navigate" || 
          request.headers.get("RSC") === "1" ||
          request.headers.get("Accept")?.includes("text/html")
        );
      },
      handler: new NetworkFirst({
        cacheName: "visited-pages",
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 })], // 1 day
      }),
    },
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
