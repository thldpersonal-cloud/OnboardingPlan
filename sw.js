const CACHE_NAME = 'onboarding-v1';
const URLS_TO_CACHE = [
  '/OnboardingPlan/',
  '/OnboardingPlan/index.html',
  '/OnboardingPlan/manifest.json'
];

// Установка — кэшируем основные файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Активация — удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Запросы — сначала сеть, при ошибке — кэш
self.addEventListener('fetch', event => {
  // Не кэшируем запросы к GitHub API (данные должны быть свежими)
  if (event.request.url.includes('api.github.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Обновляем кэш свежим ответом
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
