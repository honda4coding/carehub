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
  navigationPreload: false,
  runtimeCaching: [
    // 1. Handle CORS preflight requests (OPTIONS).
    {
      matcher({ request }) {
        return request.method === "OPTIONS";
      },
      handler: async ({ request }) => {
        try {
          return await fetch(request);
        } catch (err) {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          });
        }
      },
    },
    // 2. Cache static assets (JS, CSS, Images, Fonts).
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
    // 3. Network Only for EVERYTHING ELSE (No PWA caching for pages or API data)
    {
      matcher: () => true,
      handler: new NetworkOnly(),
    }
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

// Cleanup any old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.includes("api-cache") || cacheName.includes("visited-pages") || cacheName.includes("next-rsc")) {
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
