"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  Marker,
  Popup,
  MapRef,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl/mapbox";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/src/libs/AxiosInstance";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface ConnectionLocation {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  lastActivity?: string;
}

interface ConnectionsMapProps {
  userId: string;
  isOwnProfile: boolean;
}

const ConnectionsLocationMap: React.FC<ConnectionsMapProps> = ({
  userId,
  isOwnProfile,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionLocation | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "followers" | "following"
  >("all");

  // Fetch connections locations
  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ["connections-locations", userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/users/${userId}/connections-locations`
      );

      return data.data as {
        followers: ConnectionLocation[];
        following: ConnectionLocation[];
      };
    },
    enabled: !!userId,
  });

  // react-map-gl Map takes care of initialization; mark it loaded once mounted
  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Build the list of unique connections that have valid coords
  const uniqueConnections = useMemo(() => {
    if (!connectionsData) return [] as ConnectionLocation[];

    let connections: ConnectionLocation[] = [];

    if (filterType === "followers") {
      connections = connectionsData.followers || [];
    } else if (filterType === "following") {
      connections = connectionsData.following || [];
    } else {
      connections = [
        ...(connectionsData.followers || []),
        ...(connectionsData.following || []),
      ];
    }

    return connections
      .filter(
        (conn, index, self) =>
          index === self.findIndex((c) => c.id === conn.id) &&
          conn.latitude !== null &&
          conn.longitude !== null &&
          typeof conn.latitude === "number" &&
          typeof conn.longitude === "number"
      )
      .map((c) => c);
  }, [connectionsData, filterType]);

  // Fit map to markers when they change
  useEffect(() => {
    if (!mapRef.current || uniqueConnections.length === 0) return;

    try {
      const mapObj = mapRef.current.getMap();
      const bounds = new mapboxgl.LngLatBounds();

      uniqueConnections.forEach((c) => {
        bounds.extend([c.longitude as number, c.latitude as number]);
      });

      mapObj.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } catch (err) {
      // ignore
    }
  }, [uniqueConnections]);

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <Spinner label="Loading connections..." />
      </div>
    );
  }

  const totalFollowers = connectionsData?.followers?.length || 0;
  const totalFollowing = connectionsData?.following?.length || 0;
  const followersWithLocation =
    connectionsData?.followers?.filter((f) => f.latitude && f.longitude)
      .length || 0;
  const followingWithLocation =
    connectionsData?.following?.filter((f) => f.latitude && f.longitude)
      .length || 0;

  return (
    <Card>
      <CardBody>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            🗺️ {isOwnProfile ? "Your" : "User's"} Connections Map
          </h2>
          <p className="text-sm text-default-500">
            See where {isOwnProfile ? "your" : "their"} followers and following
            are located
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs
          aria-label="Connection filter"
          className="mb-4"
          color="primary"
          selectedKey={filterType}
          onSelectionChange={(key) => setFilterType(key as typeof filterType)}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>All Connections</span>
                <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                  {followersWithLocation + followingWithLocation}
                </span>
              </div>
            }
          />
          <Tab
            key="followers"
            title={
              <div className="flex items-center gap-2">
                <span>Followers</span>
                <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                  {followersWithLocation}
                </span>
              </div>
            }
          />
          <Tab
            key="following"
            title={
              <div className="flex items-center gap-2">
                <span>Following</span>
                <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                  {followingWithLocation}
                </span>
              </div>
            }
          />
        </Tabs>

        {/* Map */}
        <div className="w-full h-[500px] rounded-lg overflow-hidden">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: 90.4125,
              latitude: 23.8103,
              zoom: 6,
            }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ width: "100%", height: "500px" }}
          >
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />

            {uniqueConnections.map((connection) => (
              <Marker
                key={connection.id}
                anchor="center"
                latitude={connection.latitude as number}
                longitude={connection.longitude as number}
              >
                <button
                  aria-label={`Open ${connection.name} profile`}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer flex items-center justify-center bg-[#667eea] text-white font-semibold"
                  type="button"
                  onClick={() => setSelectedConnection(connection)}
                >
                  {connection.profilePhoto ? (
                    <img
                      alt={connection.name}
                      className="w-full h-full object-cover"
                      src={connection.profilePhoto}
                    />
                  ) : (
                    <span className="block text-white text-lg">
                      {connection.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
              </Marker>
            ))}

            {selectedConnection && (
              <Popup
                anchor="bottom"
                latitude={selectedConnection.latitude as number}
                longitude={selectedConnection.longitude as number}
                onClose={() => setSelectedConnection(null)}
              >
                <div style={{ minWidth: 200 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      alt={selectedConnection.name}
                      src={
                        selectedConnection.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConnection.name)}&background=667eea&color=fff`
                      }
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="font-medium">
                        {selectedConnection.name}
                      </div>
                      <div className="text-xs text-default-500">
                        {selectedConnection.email}
                      </div>
                    </div>
                  </div>
                  {selectedConnection.city && selectedConnection.country && (
                    <div className="text-xs">
                      📍 {selectedConnection.city}, {selectedConnection.country}
                    </div>
                  )}
                  {selectedConnection.lastActivity && (
                    <div className="text-xs text-default-500">
                      Last active:{" "}
                      {new Date(
                        selectedConnection.lastActivity
                      ).toLocaleString()}
                    </div>
                  )}
                  <a
                    className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                    href={`/profile/${selectedConnection.id}`}
                  >
                    View profile
                  </a>
                </div>
              </Popup>
            )}
          </Map>
        </div>

        {/* Connection List */}
        <div className="mt-4">
          <h3 className="font-semibold mb-3">
            {filterType === "all"
              ? "All Connections"
              : filterType === "followers"
                ? "Followers"
                : "Following"}{" "}
            on Map
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              let connections: ConnectionLocation[] = [];

              if (filterType === "followers") {
                connections = connectionsData?.followers || [];
              } else if (filterType === "following") {
                connections = connectionsData?.following || [];
              } else {
                connections = [
                  ...(connectionsData?.followers || []),
                  ...(connectionsData?.following || []),
                ];
              }

              return connections
                .filter(
                  (conn, index, self) =>
                    index === self.findIndex((c) => c.id === conn.id) &&
                    conn.latitude &&
                    conn.longitude
                )
                .map((connection) => (
                  <button
                    key={connection.id}
                    className="w-full text-left p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    type="button"
                    onClick={() => {
                      const mapObj = mapRef.current?.getMap();

                      if (mapObj && connection.latitude && connection.longitude) {
                        mapObj.flyTo({
                          center: [connection.longitude, connection.latitude],
                          zoom: 14,
                        });
                        // Open the popup for this connection
                        setSelectedConnection(connection);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={connection.name}
                        size="sm"
                        src={
                          connection.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=667eea&color=fff`
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {connection.name}
                        </p>
                        {connection.city && connection.country && (
                          <p className="text-xs text-default-500 truncate">
                            📍 {connection.city}, {connection.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ));
            })()}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ConnectionsLocationMap;
