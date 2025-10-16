"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = exports.subscribeToTopic = exports.sendTopicNotification = exports.sendMulticastNotification = exports.sendPushNotification = exports.initializeFirebase = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const index_1 = __importDefault(require("./index"));
// Initialize Firebase Admin SDK
let firebaseApp = null;
const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }
    try {
        // Parse the service account from environment variable
        const serviceAccount = index_1.default.firebaseServiceAccount
            ? JSON.parse(index_1.default.firebaseServiceAccount)
            : null;
        if (!serviceAccount) {
            console.warn('Firebase service account not configured. Push notifications will be disabled.');
            return null;
        }
        firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized successfully');
        return firebaseApp;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        return null;
    }
};
exports.initializeFirebase = initializeFirebase;
// Send push notification to a single device
const sendPushNotification = (token, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!firebaseApp) {
            (0, exports.initializeFirebase)();
        }
        if (!firebaseApp) {
            console.warn('Firebase not initialized. Cannot send push notification.');
            return false;
        }
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token,
        };
        const response = yield firebase_admin_1.default.messaging().send(message);
        console.log('✅ Push notification sent successfully:', response);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending push notification:', error);
        // Handle invalid token
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            // Token is invalid, should be removed from database
            return false;
        }
        return false;
    }
});
exports.sendPushNotification = sendPushNotification;
// Send push notification to multiple devices
const sendMulticastNotification = (tokens, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!firebaseApp) {
            (0, exports.initializeFirebase)();
        }
        if (!firebaseApp || tokens.length === 0) {
            return { successCount: 0, failureCount: 0 };
        }
        // Build individual messages and send each one in parallel since sendAll/sendMulticast may not exist in the installed types
        const messages = tokens.map((token) => ({
            notification: {
                title,
                body,
            },
            data: data || {},
            token,
        }));
        const results = yield Promise.allSettled(messages.map((msg) => firebase_admin_1.default.messaging().send(msg)));
        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failureCount = results.length - successCount;
        console.log(`✅ Multicast notification sent: ${successCount} success, ${failureCount} failed`);
        return {
            successCount,
            failureCount,
        };
    }
    catch (error) {
        console.error('❌ Error sending multicast notification:', error);
        return { successCount: 0, failureCount: tokens.length };
    }
});
exports.sendMulticastNotification = sendMulticastNotification;
// Send topic-based notification
const sendTopicNotification = (topic, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!firebaseApp) {
            (0, exports.initializeFirebase)();
        }
        if (!firebaseApp) {
            return false;
        }
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            topic,
        };
        yield firebase_admin_1.default.messaging().send(message);
        console.log(`✅ Topic notification sent to: ${topic}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error sending topic notification:', error);
        return false;
    }
});
exports.sendTopicNotification = sendTopicNotification;
// Subscribe tokens to a topic
const subscribeToTopic = (tokens, topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!firebaseApp) {
            (0, exports.initializeFirebase)();
        }
        if (!firebaseApp || tokens.length === 0) {
            return;
        }
        yield firebase_admin_1.default.messaging().subscribeToTopic(tokens, topic);
        console.log(`✅ Subscribed ${tokens.length} devices to topic: ${topic}`);
    }
    catch (error) {
        console.error('❌ Error subscribing to topic:', error);
    }
});
exports.subscribeToTopic = subscribeToTopic;
exports.FirebaseService = {
    initializeFirebase: exports.initializeFirebase,
    sendPushNotification: exports.sendPushNotification,
    sendMulticastNotification: exports.sendMulticastNotification,
    sendTopicNotification: exports.sendTopicNotification,
    subscribeToTopic: exports.subscribeToTopic,
};
