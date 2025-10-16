import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

// Your web app's Firebase configuration
// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: Messaging | null = null;

// Initialize messaging (only in browser)
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    if (typeof window === "undefined" || !messaging) {
      return null;
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted");

      // Register service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("Service Worker registered:", registration);

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          console.log("FCM Token:", token);
          return token;
        } else {
          console.log("No registration token available");
          return null;
        }
      }
    } else if (permission === "denied") {
      console.log("Notification permission denied");
    }

    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
        resolve(payload);
      });
    }
  });

// Show notification in foreground
export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export { app, messaging };
