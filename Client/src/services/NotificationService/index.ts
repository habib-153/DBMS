import axiosInstance from "@/src/libs/AxiosInstance";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  isPush: boolean;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification[];
}

interface SingleNotificationResponse {
  success: boolean;
  message: string;
  data: Notification;
}

interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data: null;
}

// Get all user notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  const { data } =
    await axiosInstance.get<NotificationResponse>("/notifications");

  return data.data;
};

// Get unread notifications only
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const { data } = await axiosInstance.get<NotificationResponse>(
    "/notifications/unread"
  );

  return data.data;
};

// Mark specific notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await axiosInstance.patch<MarkAsReadResponse>(
    `/notifications/${notificationId}/read`
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axiosInstance.patch<MarkAsReadResponse>("/notifications/mark-all-read");
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await axiosInstance.delete(`/notifications/${notificationId}`);
};

// Export all services
export const NotificationService = {
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
