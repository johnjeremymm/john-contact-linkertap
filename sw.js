/* sw.js  -  tiny service worker used ONLY for iOS "Save contact".
   It answers requests for /contact.vcf with the vCard that script.js stored in the Cache API, sending it with
   Content-Type text/vcard and Content-Disposition inline. Safari then opens its native contact card
   (Create New Contact / Add to Existing Contact) instead of downloading a blob file.
   Every other request is left alone: no caching, no offline mode, no effect on the rest of the site.
   Keep this file next to index.html (same folder). */
const VCF_CACHE = "linkertap-vcf-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || !/\/contact\.vcf$/.test(u.pathname)) return;
  e.respondWith(
    caches
      .open(VCF_CACHE)
      .then((c) => c.match(u.origin + u.pathname))
      .then(
        (r) =>
          r ||
          new Response("The contact card is not ready yet. Go back and tap Save contact again.", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          }),
      ),
  );
});