// DigiCash Worldwide Offline, PWA & Background Push Notification Service Worker
const CACHE_NAME = 'digicash-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/digicash_logo.png',
  '/assets/digicash_logo_transparent.png',
];

let watchedAccountPhone = '09171234567';
let lastCheckedTimestamp = Date.now();
let backgroundSettings = {
  enabled: true,
  incomingTransfers: true,
  billPayments: true,
  backgroundSync: true,
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Do not cache API calls
  if (event.request.url.includes('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html') || fetch(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

/**
 * Helper to display a native Browser Push Notification from Service Worker
 */
async function displaySwPushNotification(payload) {
  const title = payload.title || 'DigiCash Worldwide Alert';
  const category = payload.category || 'INCOMING_TRANSFER';
  const tag = payload.tag || payload.id || `digicash-${Date.now()}`;

  const options = {
    body: payload.body || 'You have a new wallet transaction update.',
    icon: '/assets/digicash_logo.png',
    badge: '/assets/digicash_logo_transparent.png',
    tag,
    renotify: true,
    requireInteraction: Boolean(payload.requireInteraction ?? false),
    vibrate: category === 'INCOMING_TRANSFER' ? [180, 80, 220] : [140, 70, 140],
    data: {
      id: payload.id || tag,
      category,
      transactionId: payload.transactionId || null,
      referenceNumber: payload.referenceNumber || null,
      amount: payload.amount || null,
      url: '/',
    },
    actions: [
      {
        action: 'view_receipt',
        title: 'View Receipt',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  await self.registration.showNotification(title, options);
}

/**
 * Web Push Event Listener (for standard Push API payloads)
 */
self.addEventListener('push', (event) => {
  let payload = {
    title: 'DigiCash Worldwide',
    body: 'New wallet transaction alert.',
    category: 'INCOMING_TRANSFER',
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(displaySwPushNotification(payload));
});

/**
 * Message Listener for Foreground & Background Client Synchronization
 */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'CONFIGURE_BACKGROUND_WATCH') {
    if (data.phone) watchedAccountPhone = data.phone;
    if (data.settings) {
      backgroundSettings = { ...backgroundSettings, ...data.settings };
    }
    if (data.lastCheckedTimestamp) {
      lastCheckedTimestamp = data.lastCheckedTimestamp;
    }
    return;
  }

  if (data.type === 'SHOW_PUSH_NOTIFICATION' && data.payload) {
    event.waitUntil(displaySwPushNotification(data.payload));
    return;
  }

  if (data.type === 'SCHEDULE_BACKGROUND_PUSH' && data.payload) {
    const delayMs = Number(data.delayMs || 3500);
    const payload = data.payload;
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await displaySwPushNotification(payload);
            const allClients = await self.clients.matchAll({
              type: 'window',
              includeUncontrolled: true,
            });
            for (const client of allClients) {
              client.postMessage({
                type: 'BACKGROUND_PUSH_DELIVERED',
                payload,
              });
            }
          } catch {
            // ignore if notification permission not granted
          }
          resolve();
        }, delayMs);
      })
    );
    return;
  }

  if (data.type === 'CHECK_BACKGROUND_ALERTS') {
    const phone = data.phone || watchedAccountPhone;
    event.waitUntil(
      fetch(`/api/fintech/notifications/pending?phone=${encodeURIComponent(phone)}&since=${lastCheckedTimestamp}`)
        .then((res) => (res.ok ? res.json() : null))
        .then(async (resData) => {
          if (!resData || !Array.isArray(resData.notifications)) return;
          for (const item of resData.notifications) {
            if (item.createdAt > lastCheckedTimestamp) {
              lastCheckedTimestamp = item.createdAt;
            }
            if (
              (item.category === 'INCOMING_TRANSFER' && backgroundSettings.incomingTransfers) ||
              (item.category === 'BILL_PAYMENT' && backgroundSettings.billPayments)
            ) {
              await displaySwPushNotification(item);
            }
          }
        })
        .catch(() => {})
    );
  }
});

/**
 * Notification Click Handler — Focuses or opens the DigiCash window and opens the transaction receipt
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: notificationData,
            });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(notificationData.url || '/');
        }
      })
  );
});
