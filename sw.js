const CACHE_NAME = 'huntdesk-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// 설치 시 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', (e) => {
  // API 요청은 캐시 안 함
  if (e.request.url.includes('api.anthropic.com') ||
      e.request.url.includes('api.openai.com') ||
      e.request.url.includes('script.google.com') ||
      e.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
