const CACHE_VERSION = "meiguia-v3";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const PAGES_CACHE   = `${CACHE_VERSION}-pages`;

const STATIC_ASSETS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json",
];

const CACHE_FIRST_PATTERNS = [
  /\/icons\//,
  /\/manifest\.json/,
  /\/_next\/static\//,
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Ignora requests de outros domínios (analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // Ignora API routes — sempre network
  if (url.pathname.startsWith("/api/")) return;

  const isCacheFirst = CACHE_FIRST_PATTERNS.some((p) => p.test(url.pathname));

  if (isCacheFirst) {
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached ?? fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network-first para páginas, com fallback para cache e offline
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && e.request.destination === "document") {
          const clone = res.clone();
          caches.open(PAGES_CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(
          (cached) => cached ?? caches.match("/offline")
        )
      )
  );
});
