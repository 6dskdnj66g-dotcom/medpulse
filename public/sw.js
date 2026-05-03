const CACHE_NAME = 'medpulse-ai-v4';
const STATIC_ASSETS = [
  '/',
  '/encyclopedia',
  '/calculators',
  '/drug-checker',
  '/usmle',
  '/progress',
  '/professors',
  '/simulator',
  '/ecg',
  '/notes',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || new Response('Offline', { status: 503 })))
  );
});

// --- Web Push: per-user scheduled reminders ---
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'لديك إشعار جديد',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      requireInteraction: true,
      data: {
        actionUrl: data.action_url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'تنبيه من MedPulse', options)
    );
  } catch (error) {
    console.error('Push event error: Payload is not valid JSON', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const actionUrl = event.notification.data?.actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(actionUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});
