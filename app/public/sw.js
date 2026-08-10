// Service Worker for Anti-Scam PWA Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming push notifications from server
self.addEventListener("push", (event) => {
  let data = {
    sender: "CẢNH SÁT GIAO THÔNG",
    content: "Bạn có một tin nhắn mới.",
    sessionId: null,
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error("[SW] Failed to parse push data:", e);
  }

  const options = {
    body: data.content.length > 80 ? data.content.slice(0, 80) + "..." : data.content,
    icon: "/zalo-logo.svg",
    badge: "/zalo-logo.svg",
    tag: "scam-notification",
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: {
      // Always navigate to root "/" (the Zalo learner page)
      url: "/",
      sessionId: data.sessionId,
    },
    actions: [
      { action: "view", title: "Xem tin nhắn" },
      { action: "dismiss", title: "Bỏ qua" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(`📨 Tin nhắn từ ${data.sender}`, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Don't do anything if user clicked dismiss
  if (event.action === "dismiss") return;

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // First, try to find and focus an existing window for this app
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          // Match any window of this PWA (/, /learner, /trigger, etc.)
          if (
            (clientUrl.pathname === "/" ||
              clientUrl.pathname === "/learner" ||
              clientUrl.pathname.startsWith("/")) &&
            "focus" in client
          ) {
            // Focus the existing window and post a message to restore state
            client.focus();
            // Send message to the page to trigger state restoration
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              sessionId: notifData.sessionId,
            });
            return;
          }
        }
        // No existing window found — open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
