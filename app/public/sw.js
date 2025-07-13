// TheNinja-RPG Progressive Web App Service Worker

const CACHE_NAME = "theninja-rpg-v3";
const STATIC_CACHE_NAME = "theninja-rpg-static-v3";

// Files to cache for offline functionality
const STATIC_FILES = ["/manifest.json", "/favicon.ico", "/offline.html"];

// Install event - cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("Caching static files");
      return cache.addAll(STATIC_FILES);
    }),
  );

  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  // Take control of all pages
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // For successful responses, just return them without caching app routes
        return response;
      })
      .catch(() => {
        // Network failed, check if it's a navigation request
        if (
          event.request.mode === "navigate" ||
          event.request.destination === "document" ||
          (event.request.method === "GET" &&
            event.request.headers.get("accept").includes("text/html"))
        ) {
          // For any navigation/page request when offline, serve the offline page
          return caches.match("/offline.html");
        }

        // For static assets, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // For other requests that fail, return a generic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      }),
  );
});

console.log("TheNinja-RPG Service Worker loaded");
