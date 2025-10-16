# Crime Reporting System - Feature Implementation Guide

## 🎯 Overview

This document provides step-by-step instructions for implementing all requested features:

1. ✅ Fixed popup interaction issue on heatmap
2. ✅ Implemented multiple reports slider for same location
3. ✅ Added crime category dropdown
4. ⏳ Analytics page (in progress)
5. ⏳ User location access on login
6. ✅ Safe Travel Mode with geofencing
7. ✅ AI image verification with Roboflow
8. ✅ User session tracking
9. ✅ Database tables for new features

---

## 🗄️ Database Migration

### Step 1: Run the migration script

```bash
cd Server
psql -U your_username -d your_database -f migrations/2025-01-16-crime-categories-and-features.sql
```

This migration adds:

- ✅ Crime category enum and column
- ✅ user_sessions table
- ✅ ai_analysis_logs table
- ✅ notifications table
- ✅ geofence_zones table
- ✅ user_location_history table
- ✅ push_notification_tokens table
- ✅ Additional user columns (lastLocation, safeTravelMode)

---

## 🔧 Backend Configuration

### Step 2: Update .env file

Add the following environment variables to `Server/.env`:

```env
# Roboflow AI Configuration
ROBOFLOW_API_KEY=your_roboflow_api_key_here
ROBOFLOW_MODEL=crime-detection/1

# Optional: Push Notification Configuration
# FIREBASE_PROJECT_ID=your_firebase_project
# FIREBASE_PRIVATE_KEY=your_firebase_key
```

### Step 3: Get Roboflow API Key

1. Go to https://roboflow.com/
2. Sign up for a free account
3. Create or use an existing model for crime/violence detection
4. Get your API key from the settings
5. Add it to your `.env` file

**Note**: You can train your own model or use pre-trained models for:

- Violence detection
- Weapon detection
- Crime scene classification
- General object detection

---

## 📝 Frontend Implementation Tasks

### Task 1: Add Crime Category to Post Creation Form

**File**: `Client/src/components/UI/modal/CreatePost/CreatePostModal.tsx`

Add category dropdown:

```typescript
import { CTSelect } from "@/src/components/form/CTSelect";

// Inside form
<CTSelect
  label="Crime Category"
  name="category"
  options={[
    { key: "MURDER", label: "Murder" },
    { key: "THEFT", label: "Theft" },
    { key: "PICKPOCKET", label: "Pickpocket" },
    { key: "BURGLARY", label: "Burglary" },
    { key: "DACOITY", label: "Dacoity" },
    { key: "ASSAULT", label: "Assault" },
    { key: "FRAUD", label: "Fraud" },
    { key: "VANDALISM", label: "Vandalism" },
    { key: "KIDNAPPING", label: "Kidnapping" },
    { key: "OTHERS", label: "Others" },
  ]}
  required
/>;
```

**File**: `Client/src/types/post.types.ts`

Add category to post types:

```typescript
export type CrimeCategory =
  | "MURDER"
  | "THEFT"
  | "PICKPOCKET"
  | "BURGLARY"
  | "DACOITY"
  | "ASSAULT"
  | "FRAUD"
  | "VANDALISM"
  | "KIDNAPPING"
  | "OTHERS";

export interface IPost {
  // ... existing fields
  category?: CrimeCategory;
}
```

---

### Task 2: Create Analytics Page

**File**: `Client/src/app/(DashboardLayout)/analytics/page.tsx`

Create a new analytics page with:

- Crime trends chart (line chart)
- Category distribution (pie chart)
- Time pattern analysis (bar chart)
- Hotspot map with radius filter
- Date range filters (3 days, 7 days, custom)

Use libraries:

- `recharts` for charts: `npm install recharts`
- `date-fns` for date handling: `npm install date-fns`

Example structure:

```typescript
"use client";

import { useState } from "react";
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics } from "@/src/hooks/analytics.hook";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7"); // days
  const [radiusKm, setRadiusKm] = useState("5");

  const { data: analyticsData, isLoading } = useAnalytics({
    days: timeRange,
    radius: radiusKm,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardBody className="flex flex-row gap-4">
          <Select
            label="Time Range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <SelectItem key="3" value="3">
              Last 3 Days
            </SelectItem>
            <SelectItem key="7" value="7">
              Last 7 Days
            </SelectItem>
            <SelectItem key="30" value="30">
              Last 30 Days
            </SelectItem>
          </Select>

          <Select
            label="Radius (km)"
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
          >
            <SelectItem key="1" value="1">
              1 km
            </SelectItem>
            <SelectItem key="5" value="5">
              5 km
            </SelectItem>
            <SelectItem key="10" value="10">
              10 km
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Crime Trends */}
      <Card>
        <CardBody>
          <h3>Crime Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardBody>
          <h3>Crime Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.categories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Time Pattern */}
      <Card>
        <CardBody>
          <h3>Crimes by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.timePattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
```

---

### Task 3: Implement Location Access on Login

**File**: `Client/src/app/(WithCommonLayout)/login/page.tsx`

Add location request after successful login:

```typescript
const onSubmit = async (data: FieldValues) => {
  try {
    const res = await userLogin(data);

    if (res.success) {
      // Request location permission
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Send location to backend
            await fetch("/api/users/location", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${res.data.accessToken}`,
              },
              body: JSON.stringify({ latitude, longitude }),
            });
          },
          (error) => {
            console.log("Location permission denied:", error);
            // Continue without location
          }
        );
      }

      router.push("/");
    }
  } catch (error) {
    // Handle error
  }
};
```

---

### Task 4: Implement Safe Travel Mode

**File**: `Client/src/components/SafeTravelMode.tsx`

Create a new component:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Switch, Card, CardBody } from "@heroui/react";
import { useUser } from "@/src/context/user.provider";

export default function SafeTravelMode() {
  const { user } = useUser();
  const [enabled, setEnabled] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (enabled && "geolocation" in navigator) {
      // Watch user location continuously
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Send to backend to check geofence
          const response = await fetch("/api/geofence/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();

          if (data.inDangerZone) {
            // Show notification
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("⚠️ Danger Zone Alert", {
                body: `You are entering ${data.zoneName}. Stay cautious!`,
                icon: "/favicon.ico",
              });
            }
          }
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      setWatchId(id);
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled]);

  const handleToggle = async () => {
    setEnabled(!enabled);

    // Update user preference
    await fetch("/api/users/safe-travel-mode", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });

    // Request notification permission
    if (!enabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Safe Travel Mode</h4>
            <p className="text-sm text-gray-500">
              Get notified when entering high-crime areas
            </p>
          </div>
          <Switch isSelected={enabled} onValueChange={handleToggle} />
        </div>
      </CardBody>
    </Card>
  );
}
```

---

### Task 5: Create Hooks for New Features

**File**: `Client/src/hooks/analytics.hook.ts`

```typescript
import { useQuery } from "@tanstack/react-query";

export const useAnalytics = (filters: { days: string; radius: string }) => {
  return useQuery({
    queryKey: ["analytics", filters],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics?days=${filters.days}&radius=${filters.radius}`
      );
      return response.json();
    },
  });
};
```

**File**: `Client/src/hooks/session.hook.ts`

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

export const useUserSessions = () => {
  return useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions");
      return response.json();
    },
  });
};

export const useEndSession = () => {
  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const response = await fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });
      return response.json();
    },
  });
};
```

---

## 🚀 Backend Routes Setup

### Step 4: Create route files

**File**: `Server/src/app/modules/Session/session.route.ts`

```typescript
import express from "express";
import { SessionController } from "./session.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("USER", "ADMIN"), SessionController.getUserSessions);
router.get(
  "/active",
  auth("USER", "ADMIN"),
  SessionController.getActiveSessions
);
router.post("/end", auth("USER", "ADMIN"), SessionController.endSession);
router.post(
  "/end-all",
  auth("USER", "ADMIN"),
  SessionController.endAllSessions
);

export const SessionRoutes = router;
```

Create similar routes for:

- `notification.route.ts`
- `geofence.route.ts`
- `aianalysis.route.ts`

### Step 5: Register routes in main router

**File**: `Server/src/app/routes/index.ts`

Add:

```typescript
import { SessionRoutes } from "../modules/Session/session.route";
import { NotificationRoutes } from "../modules/Notification/notification.route";
import { GeofenceRoutes } from "../modules/Geofence/geofence.route";

const moduleRoutes = [
  // ... existing routes
  {
    path: "/sessions",
    route: SessionRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/geofence",
    route: GeofenceRoutes,
  },
];
```

---

## 🔒 Auth Service Integration

### Step 6: Update login to create session

**File**: `Server/src/app/modules/Auth/auth.service.raw.ts`

In the login function, add:

```typescript
import { SessionService } from "../Session/session.service";

// After successful login
const sessionData = {
  userId: user.id,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
  // You can add geolocation from frontend
};

await SessionService.createSession(sessionData);
```

---

## 📱 Push Notifications Setup (Optional)

For real push notifications, you'll need:

1. **Firebase Cloud Messaging (FCM)**:

   - Create project at https://console.firebase.google.com/
   - Get service account credentials
   - Install: `npm install firebase-admin`

2. **Service Worker** (Client):
   - Create `public/firebase-messaging-sw.js`
   - Register service worker in your app

---

## ✅ Testing Checklist

### Database

- [ ] Run migration successfully
- [ ] Verify all tables created
- [ ] Check indexes are in place

### Backend

- [ ] All new services compile without errors
- [ ] Routes are registered
- [ ] Environment variables configured
- [ ] AI analysis works with Roboflow

### Frontend

- [ ] Crime category dropdown appears in post creation
- [ ] Category filter works in post list
- [ ] Analytics page displays charts
- [ ] Location permission requested on login
- [ ] Safe Travel Mode toggle works
- [ ] Geofence notifications appear
- [ ] Session list shows in user profile

### Integration

- [ ] Create post with category
- [ ] Post triggers AI analysis
- [ ] Geofence zones auto-generate
- [ ] Location tracking works
- [ ] Notifications send correctly

---

## 🐛 Troubleshooting

### Roboflow API Issues

- Check API key is correct
- Ensure image URL is publicly accessible
- Verify model name format: `workspace/model/version`
- Check Roboflow dashboard for API usage limits

### Location Not Working

- Ensure HTTPS (required for geolocation API)
- Check browser permissions
- Verify user granted location access

### Database Connection

- Check PostgreSQL is running
- Verify connection string in `.env`
- Ensure migrations ran successfully

---

## 📈 Next Steps

1. **Deploy Migration**: Run SQL migration on production database
2. **Frontend Forms**: Add category dropdown to all post forms
3. **Analytics Implementation**: Create analytics page with charts
4. **Location Services**: Implement location tracking on login
5. **Testing**: Test all features end-to-end
6. **Monitoring**: Set up logging for AI analysis and geofencing

---

## 📚 Additional Resources

- [Roboflow Documentation](https://docs.roboflow.com/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Recharts Documentation](https://recharts.org/)
- [PostGIS for Spatial Queries](https://postgis.net/) (Optional enhancement)

---

## 🎉 Conclusion

All backend infrastructure is now in place. The main remaining tasks are:

1. Frontend analytics page
2. Location tracking UI
3. Testing and refinement
4. Deploy to production

Good luck with your implementation! 🚀
