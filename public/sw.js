const CACHE_NAME = "gaucho-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
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

// Fetch - network first, cache fallback for API, cache first for assets
self.addEventListener("fetch", (event) => {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.headers.get("Accept") && request.headers.get("Accept").includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, clone); });
          return response;
        })
        .catch(function () { return caches.match(request); })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, clone); });
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
