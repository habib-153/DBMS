"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Map, {
  Marker,
  Popup,
  MapRef,
  NavigationControl,
  FullscreenControl,
  Layer,
  Source,
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CircleLayer } from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

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
}

interface GeofenceZone {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  riskLevel: string;
  district?: string;
  isActive: boolean;
}

interface MapContainerProps {
  activeSessions: ActiveSession[];
  geofenceZones: GeofenceZone[];
}

const MapContainer: React.FC<MapContainerProps> = ({
  activeSessions,
  geofenceZones,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(
    null
  );

  // Fit map to show all active sessions
  useEffect(() => {
    if (!mapRef.current || !activeSessions || activeSessions.length === 0)
      return;

    const sessionsWithLocation = activeSessions.filter(
      (s) => s.latitude && s.longitude
    );

    if (sessionsWithLocation.length === 0) return;

    try {
      const mapObj = mapRef.current.getMap();
      const bounds = new mapboxgl.LngLatBounds();

      sessionsWithLocation.forEach((session) => {
        bounds.extend([
          session.longitude as number,
          session.latitude as number,
        ]);
      });

      mapObj.fitBounds(bounds, { padding: 80, maxZoom: 12 });
    } catch (err) {
      // ignore
    }
  }, [activeSessions]);

  // Build geofence GeoJSON
  const geofenceGeoJSON = useMemo(() => {
    if (!geofenceZones || geofenceZones.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: geofenceZones
        .filter((zone) => zone.isActive)
        .map((zone) => ({
          type: "Feature" as const,
          properties: {
            id: zone.id,
            name: zone.name,
            riskLevel: zone.riskLevel,
            radius: zone.radiusMeters,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [zone.centerLongitude, zone.centerLatitude],
          },
        })),
    };
  }, [geofenceZones]);

  const geofenceLayer: CircleLayer = {
    id: "geofence-circles",
    source: "geofence-data",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        2,
        15,
        ["*", ["get", "radius"], 2],
        18,
        ["*", ["get", "radius"], 10],
      ],
      "circle-color": [
        "match",
        ["get", "riskLevel"],
        "CRITICAL",
        "#ef4444",
        "HIGH",
        "#f97316",
        "MEDIUM",
        "#eab308",
        "LOW",
        "#22c55e",
        "#6b7280",
      ],
      "circle-opacity": 0.3,
      "circle-stroke-width": 2,
      "circle-stroke-color": [
        "match",
        ["get", "riskLevel"],
        "CRITICAL",
        "#dc2626",
        "HIGH",
        "#ea580c",
        "MEDIUM",
        "#ca8a04",
        "LOW",
        "#16a34a",
        "#4b5563",
      ],
    },
  };

  const sessionsWithLocation = activeSessions.filter(
    (s) => s.latitude && s.longitude
  );

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full rounded-lg overflow-hidden">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 90.4125,
            latitude: 23.8103,
            zoom: 6,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* Geofence Zones */}
          {geofenceGeoJSON && (
            <Source data={geofenceGeoJSON} id="geofence-data" type="geojson">
              <Layer {...geofenceLayer} />
            </Source>
          )}

          {/* User Markers */}
          {sessionsWithLocation.map((session) => (
            <Marker
              key={session.id}
              anchor="center"
              latitude={session.latitude as number}
              longitude={session.longitude as number}
            >
              <button
                aria-label={`Open session for ${session.userName || session.userEmail || session.id}`}
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a50034] overflow-hidden"
                type="button"
                onClick={() => setSelectedSession(session)}
              >
                {session.profilePhoto ? (
                  <img
                    alt={`${session.userName || "User"} profile`}
                    className="w-full h-full object-cover"
                    src={session.profilePhoto}
                  />
                ) : (
                  <div className="w-full h-full bg-[#a50034] flex items-center justify-center text-white text-lg">
                    👤
                  </div>
                )}
              </button>
            </Marker>
          ))}

          {/* Popup for selected session */}
          {selectedSession && (
            <Popup
              anchor="bottom"
              closeButton={true}
              closeOnClick={false}
              latitude={selectedSession.latitude as number}
              longitude={selectedSession.longitude as number}
              onClose={() => setSelectedSession(null)}
            >
              <div style={{ minWidth: 200 }}>
                <h3 className="font-bold mb-2">{selectedSession.userName}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  {selectedSession.userEmail}
                </p>
                {selectedSession.city && selectedSession.country && (
                  <p className="text-xs mb-1">
                    📍 {selectedSession.city}, {selectedSession.country}
                  </p>
                )}
                <p className="text-xs mb-1">
                  💻 {selectedSession.browser || "Unknown"} on{" "}
                  {selectedSession.os || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  Last active:{" "}
                  {new Date(selectedSession.lastActivity).toLocaleString()}
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-2 text-sm">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#a50034] border-2 border-white" />
            <span>Active User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-50" />
            <span>Critical Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 opacity-50" />
            <span>High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-50" />
            <span>Medium Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 opacity-50" />
            <span>Low Risk Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
