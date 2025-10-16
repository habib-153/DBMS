"use client";

import { useEffect, useState } from "react";

import {
  requestNotificationPermission,
  onMessageListener,
} from "@/src/config/firebase.config";
import { useUser } from "@/src/context/user.provider";

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationPayload | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const { user } = useUser();

  // Request permission and get FCM token
  useEffect(() => {
    const setupNotifications = async () => {
      if (!user) return;

      try {
        const fcmToken = await requestNotificationPermission();

        if (fcmToken) {
          setToken(fcmToken);

          // Register token with backend
          await registerPushToken(fcmToken);
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [user]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        setNotification(payload);

        // Show browser notification if app is in foreground
        if (payload.notification) {
          new Notification(payload.notification.title || "Crime Alert", {
            body: payload.notification.body,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: payload.data,
          });
        }
      })
      .catch((err) => console.error("Failed to listen for messages:", err));

    return () => {
      // Cleanup if needed
    };
  }, []);

  const registerPushToken = async (fcmToken: string) => {
    try {
      const platform = /iPhone|iPad|iPod/.test(navigator.userAgent)
        ? "ios"
        : /Android/.test(navigator.userAgent)
          ? "android"
          : "web";

      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/push-notifications/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            token: fcmToken,
            platform,
          }),
        }
      );

      console.log("✅ Push token registered with backend");
    } catch (error) {
      console.error("❌ Failed to register push token:", error);
    }
  };

  return {
    notification,
    token,
    clearNotification: () => setNotification(null),
  };
};
