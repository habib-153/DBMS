// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBwz_2YYhGJ8nuOEQDxdaQ3SM6R8bKSNUQ",
  authDomain: "warden-2025.firebaseapp.com",
  projectId: "warden-2025",
  storageBucket: "warden-2025.firebasestorage.app",
  messagingSenderId: "256733088719",
  appId: "1:256733088719:web:94391c9986339ae9d0a0ba",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification?.title || "Crime Alert";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
    requireInteraction: true, // Keeps notification visible until user interacts
    vibrate: [200, 100, 200], // Vibration pattern
    tag: payload.data?.type || "general", // Groups similar notifications
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked", event);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data;

  // Determine the URL to open based on notification type
  let urlToOpen = "/";

  if (data?.type === "GEOFENCE_WARNING") {
    urlToOpen = "/"; // Open homepage or map
  } else if (data?.type === "POST_APPROVED" || data?.type === "POST_REJECTED") {
    urlToOpen = "/profile"; // Open user profile
  } else if (data?.postId) {
    urlToOpen = `/posts/${data.postId}`;
  }

  // Open the appropriate page
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
