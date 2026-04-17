// Service worker for Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {
    title: 'Nueva Noticia en SnappNews',
    body: 'Hay una noticia nueva esperando por ti.',
    icon: '/icon-192x192.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
