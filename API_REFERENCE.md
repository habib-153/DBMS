# 📚 API Reference Guide

## Base URL

```
Development: http://localhost:5000/api/v1
Production: YOUR_PRODUCTION_URL/api/v1
```

## Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔔 Push Notifications

### Register Push Token

Register FCM token for push notifications.

```http
POST /push-notifications/register
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Request Body:**

```json
{
  "token": "FCM_TOKEN_HERE",
  "platform": "web" // "web" | "ios" | "android"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Push token registered successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "token": "FCM_TOKEN",
    "platform": "web",
    "isActive": true,
    "createdAt": "2025-01-16T10:00:00.000Z"
  }
}
```

---

### Get User Tokens

Get all active FCM tokens for authenticated user.

```http
GET /push-notifications/tokens
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User push tokens retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "token": "FCM_TOKEN",
      "platform": "web",
      "isActive": true,
      "createdAt": "2025-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### Send Test Notification

Send test notification to user's devices.

```http
POST /push-notifications/test
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Request Body:**

```json
{
  "title": "Test Notification",
  "body": "This is a test message",
  "data": {
    "type": "TEST",
    "customField": "value"
  }
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification sent to 2 device(s), 0 failed",
  "data": {
    "sent": 2,
    "failed": 0
  }
}
```

---

## 🔐 Session Management

### Get All User Sessions

Retrieve all login sessions (active and expired).

```http
GET /sessions/all
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User sessions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "sessionToken": "token_hash",
      "ipAddress": "192.168.1.1",
      "browser": "Chrome",
      "os": "Windows",
      "device": "Desktop",
      "country": "Bangladesh",
      "city": "Dhaka",
      "isActive": true,
      "loginAt": "2025-01-16T10:00:00.000Z",
      "lastActivity": "2025-01-16T12:00:00.000Z"
    }
  ]
}
```

---

### Get Active Sessions

Retrieve only active sessions.

```http
GET /sessions/active
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

### End Session

Logout from specific device.

```http
POST /sessions/end
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Request Body:**

```json
{
  "sessionToken": "token_hash"
}
```

---

### End All Sessions

Logout from all devices.

```http
POST /sessions/end-all
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

## 🔔 Notifications

### Get User Notifications

Retrieve user's notifications with optional limit.

```http
GET /notifications?limit=50
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Query Parameters:**

- `limit` (optional): Number of notifications (default: 50)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "GEOFENCE_WARNING",
      "title": "⚠️ Entering High-Crime Area",
      "message": "You are entering Gulshan Zone (HIGH risk)",
      "data": {
        "zoneName": "Gulshan Zone",
        "riskLevel": "HIGH"
      },
      "isRead": false,
      "isPush": true,
      "createdAt": "2025-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### Get Unread Notifications

Retrieve only unread notifications.

```http
GET /notifications/unread
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

### Mark Notification as Read

Mark specific notification as read.

```http
PATCH /notifications/:notificationId/read
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

### Mark All as Read

Mark all user's notifications as read.

```http
PATCH /notifications/mark-all-read
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

### Delete Notification

Delete specific notification.

```http
DELETE /notifications/:notificationId
```

**Auth Required:** ✅ Yes (USER, ADMIN)

---

## 🗺️ Geofencing

### Check User Location

Check if user is in a danger zone.

```http
POST /geofence/check
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Request Body:**

```json
{
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Location checked successfully",
  "data": {
    "inGeofence": true,
    "zone": {
      "id": "uuid",
      "name": "Gulshan High Crime Zone",
      "riskLevel": "HIGH",
      "distance": 150.5
    },
    "notificationSent": true
  }
}
```

---

### Get Geofence Zones

Retrieve all active geofence zones.

```http
GET /geofence/zones
```

**Auth Required:** ❌ No

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Geofence zones retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Gulshan High Crime Zone",
      "centerLatitude": 23.7808,
      "centerLongitude": 90.4217,
      "radiusMeters": 1000,
      "crimeCount": 45,
      "averageVerificationScore": 75.5,
      "riskLevel": "HIGH",
      "district": "Dhaka",
      "division": "Dhaka",
      "isActive": true
    }
  ]
}
```

---

### Create Geofence Zone

Create new geofence zone (admin only).

```http
POST /geofence/zones
```

**Auth Required:** ✅ Yes (ADMIN only)

**Request Body:**

```json
{
  "name": "Custom Zone",
  "centerLatitude": 23.8103,
  "centerLongitude": 90.4125,
  "radiusMeters": 500,
  "riskLevel": "MEDIUM",
  "district": "Dhaka",
  "division": "Dhaka"
}
```

---

### Get Location History

Retrieve user's location history.

```http
GET /geofence/history?limit=100
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Query Parameters:**

- `limit` (optional): Number of records (default: 100)

---

### Auto-Generate Zones

Auto-generate geofence zones from crime data (admin only).

```http
POST /geofence/auto-generate
```

**Auth Required:** ✅ Yes (ADMIN only)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Geofence zones auto-generated successfully",
  "data": null
}
```

---

## 📊 Analytics

### Crime Trends

Get crime trends with 7-day moving average.

```http
GET /analytics/crime-trend
```

**Auth Required:** ❌ No

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "day": "2025-01-10",
      "cnt": 15,
      "ma_7d": 12.5
    }
  ]
}
```

---

### Crime Type Distribution

Get distribution of crimes by category.

```http
GET /analytics/crime-type-distribution
```

**Auth Required:** ❌ No

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "category": "THEFT",
      "cnt": 120
    },
    {
      "category": "ASSAULT",
      "cnt": 85
    }
  ]
}
```

---

### Time Pattern Analysis

Get crime distribution by hour of day.

```http
GET /analytics/time-pattern
```

**Auth Required:** ❌ No

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "hour_of_day": 0,
      "cnt": 5
    },
    {
      "hour_of_day": 1,
      "cnt": 3
    }
  ]
}
```

---

### Hotspot Districts

Get top 10 crime hotspot districts.

```http
GET /analytics/hotspot-districts
```

**Auth Required:** ❌ No

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "district": "Gulshan",
      "cnt": 45,
      "lat": 23.7808,
      "lon": 90.4217
    }
  ]
}
```

---

## 🗺️ Heatmap

### Get Heatmap Points

Get crime data for heatmap visualization.

```http
GET /heatmap/points
```

**Query Parameters:**

- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `districts` (optional): Comma-separated district IDs
- `divisions` (optional): Comma-separated division IDs
- `status` (optional): PENDING | APPROVED | REJECTED
- `minVerificationScore` (optional): Minimum score (0-100)

**Response:**

```json
{
  "data": [
    {
      "lat": 23.8103,
      "lng": 90.4125,
      "weight": 0.75,
      "title": "Robbery at midnight",
      "description": "Armed robbery incident",
      "image": "https://...",
      "crimeDate": "2025-01-16T02:00:00.000Z",
      "district": "Gulshan",
      "division": "Dhaka",
      "postId": "uuid",
      "verificationScore": 85
    }
  ]
}
```

---

### Get District Stats

Get crime statistics aggregated by district.

```http
GET /heatmap/district-stats
```

**Response:**

```json
{
  "data": [
    {
      "district": "Gulshan",
      "division": "Dhaka",
      "crimeCount": 45,
      "recentCount": 12,
      "severity": 75,
      "lat": 23.7808,
      "lng": 90.4217
    }
  ]
}
```

---

## 📝 Posts (Existing - Key Endpoints)

### Create Post

```http
POST /posts
```

**Auth Required:** ✅ Yes (USER, ADMIN)

**Form Data:**

- `data`: JSON string with post data including `category`
- `image`: File upload

---

### Update Post

```http
PATCH /posts/:id
```

**Auth Required:** ✅ Yes (Owner or ADMIN)

**Request Body:**

```json
{
  "title": "Updated title",
  "category": "THEFT",
  "status": "APPROVED" // Admin only
}
```

**Note:** When admin changes status, push notification is sent to post author.

---

## 📱 Notification Types

### Types:

- `GEOFENCE_WARNING` - User entered danger zone
- `POST_APPROVED` - Admin approved user's post
- `POST_REJECTED` - Admin rejected user's post
- `COMMENT_REPLY` - Someone replied to comment
- `UPVOTE` - Someone upvoted post
- `FOLLOW` - Someone followed user
- `REPORT_REVIEWED` - Admin reviewed report
- `SYSTEM_ALERT` - System notification

---

## 🎯 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Response Format

All API responses follow this structure:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

Error responses:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field",
      "message": "Validation error"
    }
  ]
}
```

---

## 🛠️ Postman Collection

Import this collection to test all endpoints:

[Download Postman Collection](link_to_collection)

Or use the testing commands in `TESTING_GUIDE.md`.

---

**Happy coding! 🚀**
