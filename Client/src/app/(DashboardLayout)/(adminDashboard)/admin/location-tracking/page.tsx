"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { Spinner } from "@heroui/spinner";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/src/libs/AxiosInstance";
import LocationStats from "@/src/components/modules/dashboard/AdminDashboard/LocationStats";

// Dynamic import for Mapbox (client-side only)
const MapContainer = dynamic(
  () =>
    import("@/src/components/modules/dashboard/AdminDashboard/MapContainer"),
  { ssr: false, loading: () => <Spinner label="Loading map..." /> }
);

const GeofenceManager = dynamic(
  () =>
    import("@/src/components/modules/dashboard/AdminDashboard/GeofenceManager"),
  { ssr: false, loading: () => <Spinner label="Loading..." /> }
);

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  profilePhoto?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: string;
  lastActivity: string;
  loginAt: string;
}

interface GeofenceZone {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  riskLevel: string;
  district?: string;
  division?: string;
  crimeCount?: number;
  isActive: boolean;
}

const LocationTrackingDashboard = () => {
  const [activeTab, setActiveTab] = useState("live-users");

  // Fetch active user sessions with location
  const {
    data: activeSessions,
    isLoading: loadingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/active-sessions");

      return data.data as ActiveSession[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch geofence zones
  const {
    data: geofenceZones,
    isLoading: loadingZones,
    refetch: refetchZones,
  } = useQuery({
    queryKey: ["geofence-zones"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/geofence/zones");

      return data.data as GeofenceZone[];
    },
  });

  // Fetch location tracking statistics
  const { data: locationStats, isLoading: loadingStats } = useQuery({
    queryKey: ["location-stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/location-stats");

      return data.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Location Tracking Dashboard</h1>
        <p className="text-default-500">
          Monitor active users, manage geofence zones, and track location
          statistics
        </p>
      </div>

      <Tabs
        aria-label="Location tracking options"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-[#a50034]",
          tab: "max-w-fit px-0 h-12",
        }}
        color="primary"
        selectedKey={activeTab}
        variant="underlined"
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab
          key="live-users"
          title={
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span>Live Users Map</span>
              {activeSessions && (
                <span className="bg-[#a50034] text-white text-xs rounded-full px-2 py-1">
                  {
                    activeSessions.filter((s) => s.latitude && s.longitude)
                      .length
                  }
                </span>
              )}
            </div>
          }
        >
          <Card className="mt-4">
            <CardHeader className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold">Active Users on Map</h2>
                <p className="text-sm text-default-500">
                  Real-time locations of logged-in users
                </p>
              </div>
              <button
                className="px-4 py-2 bg-[#a50034] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
                onClick={() => refetchSessions()}
              >
                🔄 Refresh
              </button>
            </CardHeader>
            <CardBody>
              {loadingSessions ? (
                <div className="h-[600px] flex items-center justify-center">
                  <Spinner label="Loading active users..." />
                </div>
              ) : (
                <div className="h-[600px]">
                  <MapContainer
                    activeSessions={activeSessions || []}
                    geofenceZones={geofenceZones || []}
                  />
                </div>
              )}

              {/* Active Users List */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSessions
                  ?.filter((s) => s.latitude && s.longitude)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{session.userName}</p>
                          <p className="text-xs text-default-500">
                            {session.userEmail}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Online
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {session.city && session.country && (
                          <p className="text-default-600">
                            📍 {session.city}, {session.country}
                          </p>
                        )}
                        <p className="text-default-500">
                          💻 {session.browser} on {session.os}
                        </p>
                        <p className="text-xs text-default-400">
                          Last active:{" "}
                          {new Date(session.lastActivity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="geofence"
          title={
            <div className="flex items-center space-x-2">
              <span>🛡️</span>
              <span>Geofence Zones</span>
            </div>
          }
        >
          <Card className="mt-4">
            <CardHeader>
              <div>
                <h2 className="text-xl font-semibold">Manage Geofence Zones</h2>
                <p className="text-sm text-default-500">
                  Create and edit danger zones for crime alerts
                </p>
              </div>
            </CardHeader>
            <CardBody>
              {loadingZones ? (
                <div className="h-[600px] flex items-center justify-center">
                  <Spinner label="Loading geofence zones..." />
                </div>
              ) : (
                <GeofenceManager
                  zones={geofenceZones || []}
                  onZoneUpdated={() => {
                    refetchZones();
                    refetchSessions();
                  }}
                />
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="statistics"
          title={
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Statistics</span>
            </div>
          }
        >
          <Card className="mt-4">
            <CardHeader>
              <div>
                <h2 className="text-xl font-semibold">
                  Location Tracking Statistics
                </h2>
                <p className="text-sm text-default-500">
                  Overview of location tracking and geofence activity
                </p>
              </div>
            </CardHeader>
            <CardBody>
              {loadingStats ? (
                <div className="h-[600px] flex items-center justify-center">
                  <Spinner label="Loading statistics..." />
                </div>
              ) : (
                <LocationStats stats={locationStats} />
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default LocationTrackingDashboard;
