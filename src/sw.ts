/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, NetworkOnly, ExpirationPlugin } from "serwist";

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
    {
      // 🛠️ Forced Bypass: Completely block RSC and API routes from ever touching the cache
      matcher({ url }) {
        return (
          url.pathname.includes("/_next/data/") || 
          url.searchParams.has("_rsc") ||
          url.pathname.includes("/api/")
        );
      },
      handler: new NetworkOnly(),
    },
    {
      // Cache HTML Navigations ONLY for public/static pages, heavily excluding all Dashboards
      matcher({ request, url }) {
        const isNav = request.mode === "navigate";
        const isDashboard = url.pathname.startsWith("/admin") || url.pathname.startsWith("/patient") || url.pathname.startsWith("/doctor");
        return isNav && !isDashboard;
      },
      handler: new NetworkFirst({
        cacheName: "dynamic-pages",
        plugins: [new ExpirationPlugin({ maxEntries: 10 })],
      }),
    },
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
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Background Sync Event Listener
self.addEventListener("sync", (event: any) => {
  const BASE_URL = "http://localhost:3000"; // Can be hardcoded or injected
  
  if (event.tag === "sync-vitals") {
    event.waitUntil(processBackgroundSync("vitals_sync_queue", `${BASE_URL}/patient/tracking`));
  } else if (event.tag === "sync-medications") {
    event.waitUntil(processBackgroundSync("medications_sync_queue", `${BASE_URL}/patient/medications/track`));
  }
});

async function processBackgroundSync(storeName: string, apiUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const dbRequest = indexedDB.open("carehub-db", 2);
    
    dbRequest.onerror = () => reject(new Error("Failed to open IndexedDB in Service Worker"));
    
    dbRequest.onsuccess = function (event: any) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async function () {
        const records = getAllRequest.result;
        // Filter only unsynced
        const unsynced = records.filter((r: any) => !r.synced).sort((a: any, b: any) => a.timestamp - b.timestamp);
        
        if (unsynced.length === 0) return resolve();
        
        for (const record of unsynced) {
          try {
            const headers: HeadersInit = { "Content-Type": "application/json" };
            if (record.authToken) {
              headers["Authorization"] = `Bearer ${record.authToken}`;
            }
            
            const response = await fetch(apiUrl, {
              method: "POST",
              headers,
              body: JSON.stringify(record.payload),
            });
            
            if (!response.ok) {
              throw new Error(`Server responded with status ${response.status}`);
            }
            
            // Delete from IndexedDB upon success
            const deleteTx = db.transaction([storeName], "readwrite");
            deleteTx.objectStore(storeName).delete(record.syncId);
            
          } catch (error) {
            console.error(`[SW Sync Failure] Retrying later via Native Backoff:`, error);
            return reject(error); // Rejecting causes the browser to execute exponential backoff
          }
        }
        resolve();
      };
    };
  });
}
