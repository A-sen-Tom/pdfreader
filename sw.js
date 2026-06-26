var C='v_1782371852253';
var localAssets = ['./', './index.html', './manifest.json'];
var externalAssets = ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js', 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(C).then(c => {
      c.addAll(localAssets); // 本地核心文件必须成功
      // 外部 CDN 采用非阻塞的静默缓存，就算被墙了也不影响主程序安装
      externalAssets.forEach(url => {
        fetch(url, { mode: 'no-cors' }).then(res => c.put(url, res)).catch(() => console.warn('PWA预加载受阻:', url));
      });
    })
  );
});
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== C && caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let req = e.request;
  if (req.mode === 'navigate') req = new Request(req, { cache: 'reload' });
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.status === 200 || res.status === 0)) {
          var resClone = res.clone();
          caches.open(C).then(c => c.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => cached || new Response('Network Error', { status: 503 })))
  );
});
