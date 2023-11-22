// Service Worker
const pwaCache = "opticsbench-cache-1.2";

// importScripts('/cache-polyfill.js');  // obsolete

self.addEventListener("install", e => {
  let cacheReady = caches.open(pwaCache).then(cache => {
    console.log("New cache ready");
    return cache.addAll(["./",
    './index.html',
    "./optics.html",
    './ejss.css',
    "./swingjs/swingjs2.min.js",
    "./swingjs/j2s/core/core_opticsbench.z.js"]);
  });

  e.waitUntil(cacheReady);
});

self.addEventListener("activate", e => {
  let catchCleaned = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== pwaCache) return caches.delete(key);
    });
  });
  e.waitUntil(catchCleaned);
});

self.addEventListener("fetch", e => {
  //  skip for remote fetch
  console.log("New request: " + e.request.url);
  if (!e.request.url.match(location.origin)) return;

  let newResp = caches.open(pwaCache).then(cache => {
    return cache.match(e.request).then(res => {
      if (res) {
        console.log("Serving ${res.url} from cache.");
        return res;
      }
      // fetch missing resources and add to cache.
      return fetch(e.request).then(fetchRes => {
        cache.put(e.request, fetchRes.clone());
        return fetchRes;
      });
    });
  });
  e.respondWith(newResp);
});
