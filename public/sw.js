const CACHE_NAME = "gaucho-v2";
const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.ico",
];

// Max items to keep in cache to avoid QuotaExceededError
const MAX_CACHE_ITEMS = 30;

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Trim cache to prevent quota issues
async function trimCache(cacheName, maxItems) {
  var cache = await caches.open(cacheName);
  var keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// Fetch — network-only for API and Next.js chunks, light caching for other assets
self.addEventListener("fetch", (event) => {
  var request = event.request;
  var url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Skip Next.js internal chunks and large assets to avoid filling quota
  if (url.pathname.startsWith("/_next/")) return;

  // For HTML pages — network first, no caching (pages change often)
  if (request.headers.get("Accept") && request.headers.get("Accept").includes("text/html")) {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match(request);
      })
    );
    return;
  }

  // For other static assets (images, fonts) — cache first, network fallback
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        // Only cache successful responses and limit size
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
            trimCache(CACHE_NAME, MAX_CACHE_ITEMS);
          });
        }
        return response;
      });
    })
  );
});

// ─── PUSH NOTIFICATIONS ───────────────────────

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    var data = event.data.json();

    self.registration.showNotification(data.title || "Gaucho", {
      body: data.body,
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "gaucho",
      vibrate: [200, 100, 200],
      data: {
        url: (data.data && data.data.url) || "/",
      },
    });
  } catch (e) {
    self.registration.showNotification(event.data.text(), {
      icon: "/favicon.ico",
    });
  }
});

// Click on notification → open the app
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var urlToOpen = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(self.location.origin) !== -1 && "focus" in client) {
          return client.focus().then(function (client) {
            if ("navigate" in client) {
              client.navigate(urlToOpen);
            }
          });
        }
      }
      if ("openWindow" in self.clients) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
