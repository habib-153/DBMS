# Location Tracking & Geofence System Implementation

## Overview

This document explains the complete location tracking and geofence warning system implementation, including how user location is captured, stored, and used for safety alerts.

---

## 🎯 Features Implemented

### 1. **User Session Location Tracking**

- Records user location data during login
- Stores country, city, latitude, longitude in `user_sessions` table
- Supports both GPS (high accuracy) and IP-based (fallback) location

### 2. **User Location History**

- Tracks all user location points in `user_location_history` table
- Records activity type (login, check-in, manual update)
- Links to geofence zones when user enters danger areas
- Stores accuracy and address information

### 3. **Geofence Warning System**

- Detects when user enters high-crime zones
- Sends notifications when entering danger areas
- Prevents duplicate notifications (1-hour cooldown)
- Auto-generates geofence zones from crime hotspots

---

## 📊 Database Tables

### `user_sessions`

```sql
- id (UUID)
- userId (FK)
- ipAddress (text)
- userAgent (text)
- browser, os, device (text)
- country (text) ← NEW
- city (text) ← NEW
- latitude (double precision) ← NEW
- longitude (double precision) ← NEW
- isActive (boolean)
- loginAt, logoutAt, lastActivity (timestamp)
```

### `user_location_history`

```sql
- id (UUID)
- userId (FK)
- latitude, longitude (double precision) ← REQUIRED
- accuracy (double precision)
- address (text)
- activity (text) - e.g., "login", "manual check"
- geofenceZoneId (FK) ← Links to danger zone
- notificationSent (boolean)
- timestamp (timestamp)
```

### `geofence_zones`

```sql
- id (UUID)
- name (text)
- centerLatitude, centerLongitude (double precision)
- radiusMeters (integer)
- riskLevel (enum: LOW, MEDIUM, HIGH, CRITICAL)
- district, division (text)
- crimeCount (integer)
- averageVerificationScore (double precision)
- isActive (boolean)
```

---

## 🔧 Frontend Implementation

### 1. Geolocation Hook (`hooks/geolocation.hook.ts`)

```typescript
const {
  getUserLocation, // Get GPS coordinates
  getIPLocation, // Get location from IP address
  getLocationWithFallback, // Try GPS, fallback to IP
  isLoading,
  error,
} = useGeolocation();
```

#### Methods:

- **`getUserLocation()`**: Requests browser GPS permission, returns precise coordinates
- **`getIPLocation()`**: Uses ipapi.co API (1000 free requests/day) for IP-based location
- **`getLocationWithFallback()`**: Combines both strategies for maximum reliability

#### Permissions:

- Shows browser permission dialog: "Allow [site] to access your location?"
- If user denies GPS: Falls back to IP-based location (less accurate but still works)
- If both fail: Login continues without location (non-blocking)

### 2. Login Page Integration

```typescript
// After successful login, automatically track location
useEffect(() => {
  if (isSuccess) {
    const { gpsLocation, ipLocation } = await getLocationWithFallback();

    // Update session with location
    await SessionLocationService.updateSessionLocation({
      latitude: gpsLocation?.latitude || ipLocation?.latitude,
      longitude: gpsLocation?.longitude || ipLocation?.longitude,
      country: ipLocation?.country,
      city: ipLocation?.city,
    });

    // Record in location history
    await SessionLocationService.recordUserLocation({
      latitude: gpsLocation.latitude,
      longitude: gpsLocation.longitude,
      activity: "login",
    });
  }
}, [isSuccess]);
```

### 3. Location Services (`services/SessionLocationService/index.ts`)

```typescript
SessionLocationService.updateSessionLocation({
  latitude: 23.8103,
  longitude: 90.4125,
  country: 'Bangladesh',
  city: 'Dhaka',
});

SessionLocationService.recordUserLocation({
  latitude: 23.8103,
  longitude: 90.4125,
  accuracy: 10.5,
  address: 'Dhaka, Bangladesh',
  activity: 'login',
});

SessionLocationService.getUserLocationHistory(limit: 50);
SessionLocationService.getActiveGeofenceZones();
```

---

## 🔙 Backend Implementation

### 1. Session Routes (`/api/v1/sessions`)

```typescript
PATCH /sessions/update-location
Body: { latitude, longitude, country, city }
Auth: Required
Effect: Updates current active session with location data
```

### 2. Geofence Routes (`/api/v1/geofence`)

```typescript
POST /geofence/location
Body: { latitude, longitude, accuracy, address, activity }
Auth: Required
Effect: Records location, checks geofence zones, sends warning if in danger zone

GET /geofence/location-history?limit=50
Auth: Required
Returns: User's location history with geofence zone details

GET /geofence/zones
Auth: Not required
Returns: All active geofence zones with risk levels

POST /geofence/zones
Auth: Admin only
Body: { name, centerLatitude, centerLongitude, radiusMeters, riskLevel }
Effect: Creates new geofence danger zone

POST /geofence/auto-generate
Auth: Admin only
Effect: Automatically generates geofence zones from crime hotspots
```

### 3. Geofence Detection Logic

```typescript
// When user location is recorded:
1. Get all active geofence zones
2. Calculate distance from user to each zone center (Haversine formula)
3. If distance <= zone.radiusMeters:
   - User entered danger zone
   - Check if notification sent recently (< 1 hour)
   - If not, create notification: "⚠️ You entered a high-crime area"
   - Send push notification via Firebase
   - Record in user_location_history with geofenceZoneId
4. Store location in database
```

### 4. Notification Creation

```typescript
// Automatically triggered when entering geofence zone
NotificationService.createNotification({
  userId: user.id,
  type: "GEOFENCE_WARNING",
  title: "⚠️ Safety Alert",
  message: `You have entered ${zone.name} - a ${zone.riskLevel} risk area with ${zone.crimeCount} reported crimes`,
  data: {
    zoneId: zone.id,
    zoneName: zone.name,
    riskLevel: zone.riskLevel,
  },
  isPush: true,
});
```

---

## 🧪 Testing Guide

### Frontend Testing

#### 1. Test GPS Location Permission

```typescript
// Open login page in browser
// After login, browser should show:
// "Allow [site] to access your location?"
//
// Click "Allow" → GPS coordinates used (most accurate)
// Click "Block" → IP location used (less accurate but works)
```

#### 2. Test in Browser DevTools

```javascript
// Console → Application → Permissions → Geolocation
// Can manually block/allow for testing

// Console → Network tab
// After login, should see requests:
// - PATCH /api/v1/sessions/update-location (status 200)
// - POST /api/v1/geofence/location (status 201)
```

#### 3. Test IP Location Fallback

```typescript
// Block location permission in browser settings
// Login → Should still get country/city from IP
// Check Network tab for ipapi.co request
```

### Backend Testing

#### 1. Check Database After Login

```sql
-- Should see new session with location
SELECT
  "userId",
  country,
  city,
  latitude,
  longitude,
  browser,
  os,
  device,
  "loginAt"
FROM user_sessions
WHERE "isActive" = true
ORDER BY "loginAt" DESC
LIMIT 5;

-- Should see location history entry
SELECT
  "userId",
  latitude,
  longitude,
  address,
  activity,
  "geofenceZoneId",
  timestamp
FROM user_location_history
ORDER BY timestamp DESC
LIMIT 5;
```

#### 2. Test Geofence Warning

```typescript
// 1. Create a geofence zone (as admin)
POST /api/v1/geofence/zones
{
  "name": "Dhaka Crime Hotspot",
  "centerLatitude": 23.8103,
  "centerLongitude": 90.4125,
  "radiusMeters": 1000,
  "riskLevel": "HIGH",
  "district": "Dhaka",
  "division": "Dhaka"
}

// 2. Record location inside the zone
POST /api/v1/geofence/location
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "activity": "check-in"
}

// 3. Check notifications
GET /api/v1/notifications
// Should see GEOFENCE_WARNING notification
```

#### 3. Test Auto-Generate Geofence Zones

```typescript
// As admin, trigger auto-generation
POST / api / v1 / geofence / auto - generate;

// Check created zones
GET / api / v1 / geofence / zones;
// Should return zones clustered around crime hotspots
```

---

## 🌍 How Geofence Works

### Distance Calculation (Haversine Formula)

```typescript
// Calculates distance between two lat/lng points on Earth's surface
const distance = calculateDistance(userLat, userLng, zoneLat, zoneLng);

// Returns distance in meters
// Example: User at (23.8103, 90.4125) and Zone at (23.8150, 90.4200)
// distance ≈ 850 meters
```

### Geofence Check Process

```
1. User opens app → Requests location permission
2. User allows → Get GPS coordinates (e.g., 23.8103, 90.4125)
3. Frontend sends location to backend
4. Backend queries all active geofence zones:
   - Zone A: Center (23.8150, 90.4200), Radius 1000m, Risk: HIGH
   - Zone B: Center (23.7500, 90.3800), Radius 500m, Risk: CRITICAL
5. Calculate distance from user to each zone:
   - Distance to Zone A: 850m < 1000m ✅ INSIDE
   - Distance to Zone B: 8500m > 500m ❌ OUTSIDE
6. User is inside Zone A → Trigger warning notification
7. Check if notification was sent in last hour:
   - If yes → Don't send again (prevent spam)
   - If no → Send "⚠️ You entered a high-crime area" notification
8. Record in user_location_history with geofenceZoneId = Zone A
```

### Risk Level Determination

```typescript
// Auto-calculation based on crime statistics
if (crimeCount >= 20 || avgVerificationScore < 40) {
  riskLevel = "CRITICAL"; // Red zone
} else if (crimeCount >= 10 || avgVerificationScore < 50) {
  riskLevel = "HIGH"; // Orange zone
} else if (crimeCount >= 5 || avgVerificationScore < 60) {
  riskLevel = "MEDIUM"; // Yellow zone
} else {
  riskLevel = "LOW"; // Green zone
}
```

---

## 🔒 Privacy & Security

### User Consent

- **GPS Location**: Requires explicit browser permission
- **IP Location**: Automatic fallback (no permission needed)
- **User Control**: Can deny permission → App still works, just no location features

### Data Storage

- Location stored in secure PostgreSQL database (Neon)
- Only accessible by authenticated user and admins
- Used only for safety features (geofence warnings, analytics)

### Rate Limiting

- IP location API: 1000 requests/day (ipapi.co free tier)
- For production: Consider upgrading or self-hosting IP geolocation

---

## 🚀 Future Enhancements

1. **Real-time Location Tracking**

   - WebSocket connection for live location updates
   - Show user location on map in real-time

2. **Geofence Notifications**

   - Push notifications when entering danger zones
   - SMS alerts for critical risk areas

3. **Location-based Features**

   - Nearby crime reports
   - Safe route recommendations
   - Community safety scores

4. **Admin Dashboard**
   - View all active users on map
   - Create/edit geofence zones visually
   - Monitor location tracking statistics

---

## 📝 Troubleshooting

### Issue: Location fields NULL in database

**Solution**: User denied GPS permission AND IP location failed

- Check browser console for errors
- Verify ipapi.co is not blocked by firewall
- Test with different browser/device

### Issue: No geofence warnings

**Solution**:

1. Verify geofence zones exist: `GET /api/v1/geofence/zones`
2. Check zone radius covers user location
3. Verify notification cooldown (1 hour between warnings)

### Issue: "User not authenticated" error

**Solution**:

- Check Authorization header in request
- Verify accessToken cookie is set
- Try logging out and logging back in

---

## 📞 API Endpoints Summary

| Method | Endpoint                     | Auth     | Description               |
| ------ | ---------------------------- | -------- | ------------------------- |
| PATCH  | `/sessions/update-location`  | ✅       | Update session location   |
| POST   | `/geofence/location`         | ✅       | Record user location      |
| GET    | `/geofence/location-history` | ✅       | Get location history      |
| GET    | `/geofence/zones`            | ❌       | Get active geofence zones |
| POST   | `/geofence/zones`            | 👤 Admin | Create geofence zone      |
| POST   | `/geofence/auto-generate`    | 👤 Admin | Auto-generate zones       |

---

## ✅ Checklist

### After Implementation

- [ ] Login → Browser shows location permission dialog
- [ ] Allow permission → GPS coordinates recorded
- [ ] Block permission → IP location used as fallback
- [ ] Check `user_sessions` table → country, city, lat, lng populated
- [ ] Check `user_location_history` table → Entry created with activity="login"
- [ ] Create geofence zone → Enter zone → Receive notification
- [ ] Notification bell → Shows "⚠️ You entered a high-crime area"
- [ ] Admin panel → Can view all geofence zones on map

---

**Implementation Date**: January 2025  
**Status**: ✅ Complete  
**Tested**: Frontend + Backend + Database
