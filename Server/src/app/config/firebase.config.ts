/* eslint-disable @typescript-eslint/no-explicit-any */
import admin from 'firebase-admin';
import config from './index';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Parse the service account from environment variable
    const serviceAccount = config.firebaseServiceAccount
      ? JSON.parse(config.firebaseServiceAccount)
      : null;

    if (!serviceAccount) {
      console.warn(
        'Firebase service account not configured. Push notifications will be disabled.'
      );
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    return null;
  }
};

// Send push notification to a single device
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    if (!firebaseApp) {
      initializeFirebase();
    }

    if (!firebaseApp) {
      console.warn('Firebase not initialized. Cannot send push notification.');
      return false;
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending push notification:', error);

    // Handle invalid token
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      // Token is invalid, should be removed from database
      return false;
    }

    return false;
  }
};

// Send push notification to multiple devices
export const sendMulticastNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> => {
  try {
    if (!firebaseApp) {
      initializeFirebase();
    }

    if (!firebaseApp || tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // Build individual messages and send each one in parallel since sendAll/sendMulticast may not exist in the installed types
    const messages: admin.messaging.Message[] = tokens.map((token) => ({
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    }));

    const results = await Promise.allSettled(
      messages.map((msg) => admin.messaging().send(msg))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    console.log(
      `✅ Multicast notification sent: ${successCount} success, ${failureCount} failed`
    );

    return {
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('❌ Error sending multicast notification:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
};

// Send topic-based notification
export const sendTopicNotification = async (
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    if (!firebaseApp) {
      initializeFirebase();
    }

    if (!firebaseApp) {
      return false;
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      topic,
    };

    await admin.messaging().send(message);
    console.log(`✅ Topic notification sent to: ${topic}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    return false;
  }
};

// Subscribe tokens to a topic
export const subscribeToTopic = async (
  tokens: string[],
  topic: string
): Promise<void> => {
  try {
    if (!firebaseApp) {
      initializeFirebase();
    }

    if (!firebaseApp || tokens.length === 0) {
      return;
    }

    await admin.messaging().subscribeToTopic(tokens, topic);
    console.log(`✅ Subscribed ${tokens.length} devices to topic: ${topic}`);
  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
  }
};

export const FirebaseService = {
  initializeFirebase,
  sendPushNotification,
  sendMulticastNotification,
  sendTopicNotification,
  subscribeToTopic,
};
