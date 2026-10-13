// 축구 작전판 — offline cache
const CACHE = "tactics-board-v1";
const BASE = new URL("./", self.location.href).pathname;
const CORE = [BASE, BASE + "manifest.webmanifest", BASE + "icons/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); const same = url.origin === self.location.origin;
  const isPage = same && (url.pathname === BASE || url.pathname === BASE + "index.html");
  const isFont = /fonts.googleapis.com$|fonts.gstatic.com$/.test(url.host);
  if (isPage) e.respondWith(fetch(req).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); return res; }).catch(() => caches.match(req)));
  else if (same || isFont) e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); } return res; })));
});
