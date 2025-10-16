"use client";

import React, { useEffect } from "react";

import { useNotifications } from "@/src/hooks/notification.hook";

const NotificationToast = () => {
  const { notification, clearNotification } = useNotifications();

  useEffect(() => {
    if (notification) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const { notification: notifData, data } = notification;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md animate-slide-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              {data?.type === "GEOFENCE_WARNING" ? (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              ) : data?.type === "POST_APPROVED" ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-sm">
                {notifData?.title || "Notification"}
              </h4>
            </div>
          </div>
          <button aria-label="clear"
            className="text-white hover:text-gray-200 transition-colors"
            onClick={clearNotification}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {notifData?.body || "You have a new notification"}
          </p>

          {/* Action button for specific notification types */}
          {data?.postId && (
            <button
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
              onClick={() => {
                window.location.href = `/posts/${data.postId}`;
              }}
            >
              View Details →
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-blue-500 animate-progress w-full" />
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
