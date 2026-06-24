/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

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
  // IMPORTANT: navigationPreload must be false for the offline fallback to work.
  // When true, the browser makes a parallel network request that fails offline,
  // and the SW never gets the chance to serve the cached /~offline fallback page.
  navigationPreload: false,
  runtimeCaching: [
    // 1. Bypass caching for Next.js prefetch requests.
    //    This prevents pages the user hasn't actually visited from being cached.
    {
      matcher({ request }) {
        return (
          request.headers.get("Purpose") === "prefetch" ||
          request.headers.get("Sec-Purpose") === "prefetch"
        );
      },
      handler: new NetworkOnly(),
    },
    // 2. Bypass caching for non-GET requests (POST, PUT, DELETE, PATCH).
    //    Mutations must always go to the network.
    {
      matcher({ request }) {
        return request.method !== "GET";
      },
      handler: new NetworkOnly(),
    },
    // 3. Everything else is handled by serwist's built-in defaultCache which provides:
    //    - Google Fonts → CacheFirst
    //    - Static assets (fonts, images, JS, CSS) → CacheFirst / StaleWhileRevalidate
    //    - Next.js static JS → CacheFirst
    //    - Next.js data → NetworkFirst
    //    - RSC prefetch / RSC payloads → NetworkFirst (pages-rsc-prefetch / pages-rsc)
    //    - HTML pages → NetworkFirst (pages cache)
    //    - Same-origin APIs → NetworkFirst
    //    - Cross-origin requests → NetworkFirst
    //    - Catch-all → NetworkOnly
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        // When any navigation request fails (user is offline and page isn't cached),
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
