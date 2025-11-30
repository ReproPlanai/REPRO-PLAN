// Service Worker for SafeLink - Offline-first SRHR Platform with Comprehensive Caching
const CACHE_NAME = 'safelink-v2.1';
const STATIC_CACHE = 'safelink-static-v2.1';
const DYNAMIC_CACHE = 'safelink-dynamic-v2.1';
const QR_CACHE = 'safelink-qr-v2.1';
const COMPONENT_CACHE = 'safelink-components-v2.1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// New feature components to cache
const COMPONENT_FILES = [
  '/src/components/QRCode/QRCodeGenerator.tsx',
  '/src/components/QRCode/QRCodeScanner.tsx',
  '/src/components/QRCode/QRVerificationManager.tsx',
  '/src/components/AppDownloadModal.tsx',
  '/src/components/FloatingDownloadButton.tsx',
  '/src/components/AppInstallBanner.tsx',
  '/src/components/PWAInstallPrompt.tsx',
  '/src/components/DataVisualization/SecureDataViewer.tsx',
  '/src/components/EmergencyAlertSystem.tsx',
  '/src/components/MapTracking.tsx'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/verification',
  '/api/qr-generate',
  '/api/qr-scan',
  '/api/emergency-alerts',
  '/api/location-tracking'
];

// Install event - cache static files and new components
self.addEventListener('install', (event) => {
  console.log('Service Worker installing v2.1 with stakeholder authentication fixes...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Cache new component files
      caches.open(COMPONENT_CACHE).then((cache) => {
        console.log('Caching new feature components');
        return cache.addAll(COMPONENT_FILES);
      }),
      // Cache QR code assets
      caches.open(QR_CACHE).then((cache) => {
        console.log('Caching QR code assets');
        return cache.addAll([
          '/qr-templates/',
          '/qr-assets/',
          '/verification-assets/'
        ]);
      })
    ]).then(() => {
      console.log('All caches populated successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating v2.1...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== QR_CACHE && 
                     cacheName !== COMPONENT_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Cache cleanup completed');
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_UPDATE',
              version: '2.1',
              features: [
                'QR Code Verification',
                'App Download System',
                'Enhanced Mobile Support',
                'Improved Caching',
                'Fixed Stakeholder Authentication'
              ]
            });
          });
        });
      })
  );
});

// Enhanced fetch event - comprehensive caching for new features
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with optimized caching
  if (request.method === 'GET') {
    // QR Code and verification API calls
    if (url.pathname.startsWith('/api/qr-') || url.pathname.startsWith('/api/verification')) {
      event.respondWith(
        caches.open(QR_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              // Return cached response and update in background
              fetch(request).then((response) => {
                if (response.status === 200) {
                  cache.put(request, response.clone());
                }
              }).catch(() => {});
              return cachedResponse;
            }
            return fetch(request).then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => {
              // Return offline fallback for QR features
              return new Response(JSON.stringify({
                offline: true,
                message: 'QR verification available offline',
                features: ['qr-generate', 'qr-scan', 'verification']
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
        })
      );
    }
    // Emergency and location API calls
    else if (url.pathname.startsWith('/api/emergency') || url.pathname.startsWith('/api/location')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return emergency offline response
              return new Response(JSON.stringify({
                offline: true,
                emergency: true,
                message: 'Emergency services available offline',
                features: ['emergency-alerts', 'location-tracking']
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          })
      );
    }
    // Component files and new features
    else if (url.pathname.includes('/components/') || url.pathname.includes('/QRCode/')) {
      event.respondWith(
        caches.open(COMPONENT_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request).then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            });
          });
        })
      );
    }
    // Regular API calls
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request);
          })
      );
    }
    // Static files - cache first strategy
    else {
      event.respondWith(
        caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }
            return fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                  });
                }
                return response;
              });
          })
      );
    }
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline data when connection is restored
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB
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
  // Sync data with server when online
  for (const item of data) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      // Remove from offline storage after successful sync
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
  }
});
