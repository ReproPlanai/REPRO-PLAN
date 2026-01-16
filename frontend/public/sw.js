// Service Worker for REPRO PLAN - Offline-first SRHR Platform with update-safe caching
const CACHE_VERSION = '3.0.1';
const STATIC_CACHE = `repro-plan-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `repro-plan-runtime-${CACHE_VERSION}`;
const API_CACHE = `repro-plan-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `repro-plan-images-${CACHE_VERSION}`;
const CURRENT_CACHES = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE];

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/logo192.png',
  '/logo512.png',
  '/sitemap.xml',
  '/robots.txt'
];

self.addEventListener('install', (event) => {
  console.log(`Service Worker installing v${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

async function clearOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => !CURRENT_CACHES.includes(cacheName))
      .map((cacheName) => caches.delete(cacheName))
  );
}

self.addEventListener('activate', (event) => {
  console.log(`Service Worker activating v${CACHE_VERSION}...`);
  event.waitUntil(
    clearOldCaches()
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATE',
            version: CACHE_VERSION,
            features: ['Faster updates', 'Fresh cache', 'Favicon refresh']
          });
        });
      })
  );
});

const isApiRequest = (url) => url.pathname.startsWith('/api/');
const isQrRequest = (url) => url.pathname.startsWith('/api/qr-') || url.pathname.startsWith('/api/verification');
const isEmergencyRequest = (url) => url.pathname.startsWith('/api/emergency') || url.pathname.startsWith('/api/location');

async function networkFirst(request, cacheName, fallbackResponse) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    if (fallbackResponse) {
      return fallbackResponse;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  if (isApiRequest(url)) {
    if (isQrRequest(url)) {
      const offlineResponse = new Response(JSON.stringify({
        offline: true,
        message: 'QR verification available offline',
        features: ['qr-generate', 'qr-scan', 'verification']
      }), { headers: { 'Content-Type': 'application/json' } });

      event.respondWith(networkFirst(request, API_CACHE, offlineResponse));
      return;
    }

    if (isEmergencyRequest(url)) {
      const offlineResponse = new Response(JSON.stringify({
        offline: true,
        emergency: true,
        message: 'Emergency services available offline',
        features: ['emergency-alerts', 'location-tracking']
      }), { headers: { 'Content-Type': 'application/json' } });

      event.respondWith(networkFirst(request, API_CACHE, offlineResponse));
      return;
    }

    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (['script', 'style', 'worker', 'manifest'].includes(request.destination)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (['image', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('SafeLinkDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
    request.onerror = () => resolve([]);
  });
}

async function syncOfflineData(data) {
  for (const item of data) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      await removeOfflineData(item.id);
    } catch (error) {
      console.error('Failed to sync item:', error);
    }
  }
}

async function removeOfflineData(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('SafeLinkDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      store.delete(id);
      transaction.oncomplete = () => resolve();
    };
  });
}

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/emergency')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(clearOldCaches());
  }
});
