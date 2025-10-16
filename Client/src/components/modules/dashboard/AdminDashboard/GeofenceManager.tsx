"use client";

import React, { useRef, useState, useCallback } from "react";
import Map, {
  MapRef,
  NavigationControl,
  Layer,
  Source,
} from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { toast } from "sonner";
import { CircleLayer } from "mapbox-gl";
import { SymbolLayer } from "mapbox-gl";

import axiosInstance from "@/src/libs/AxiosInstance";
import { SessionLocationService } from "@/src/services/SessionLocationService";

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

interface GeofenceManagerProps {
  zones: GeofenceZone[];
  onZoneUpdated: () => void;
}

const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  zones,
  onZoneUpdated,
}) => {
  const mapRef = useRef<MapRef>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // Admin test-check form state
  const [testForm, setTestForm] = useState({
    userId: "",
    latitude: 0,
    longitude: 0,
  });
  const [testResult, setTestResult] = useState<any | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    division: "",
    riskLevel: "MEDIUM",
    centerLatitude: 0,
    centerLongitude: 0,
    radiusMeters: 500,
  });

  // Initialize MapboxDraw controls
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();

    if (!map || draw.current) return;

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        trash: true,
      },
    });

    map.addControl(draw.current);

    // Handle draw creation
    map.on("draw.create", (e: any) => {
      const point = e.features[0];

      if (point.geometry.type === "Point") {
        const [lng, lat] = point.geometry.coordinates;

        setFormData((prev) => ({
          ...prev,
          centerLatitude: lat,
          centerLongitude: lng,
        }));
        setIsCreating(true);
      }
    });

    setMapLoaded(true);
  }, []);

  // Display existing zones
  const zoneGeoJSON = React.useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: zones.map((zone) => ({
        type: "Feature" as const,
        properties: {
          id: zone.id,
          name: zone.name,
          riskLevel: zone.riskLevel,
          radius: zone.radiusMeters,
          isActive: zone.isActive,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [zone.centerLongitude, zone.centerLatitude],
        },
      })),
    };
  }, [zones]);
  // Circle layer for zones
  const circleLayer: CircleLayer = {
    id: "zones-circles",
    type: "circle",
    source: "zones-data",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        ["get", "radius"],
        15,
        ["*", ["get", "radius"], 50],
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
      "circle-opacity": ["case", ["get", "isActive"], 0.4, 0.2],
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
  // Label layer for zones
  const labelLayer: SymbolLayer = {
    id: "zones-labels",
    type: "symbol",
    source: "zones-data",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, 2],
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#fff",
      "text-halo-width": 2,
    },
  };

  // Handle zone click
  const handleZoneClick = useCallback(
    (e: any) => {
      if (e.features && e.features[0]) {
        const zoneId = e.features[0].properties.id;
        const zone = zones.find((z) => z.id === zoneId);

        if (zone) {
          setSelectedZone(zone);
          setFormData({
            name: zone.name,
            district: zone.district || "",
            division: zone.division || "",
            riskLevel: zone.riskLevel,
            centerLatitude: zone.centerLatitude,
            centerLongitude: zone.centerLongitude,
            radiusMeters: zone.radiusMeters,
          });
          setShowEditModal(true);
        }
      }
    },
    [zones]
  );

  const handleCreateZone = async () => {
    try {
      await axiosInstance.post("/geofence/zones", formData);
      toast.success("Geofence zone created successfully!");
      setIsCreating(false);
      setFormData({
        name: "",
        district: "",
        division: "",
        riskLevel: "MEDIUM",
        centerLatitude: 0,
        centerLongitude: 0,
        radiusMeters: 500,
      });
      if (draw.current) {
        draw.current.deleteAll();
      }
      onZoneUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create zone");
    }
  };

  const handleUpdateZone = async () => {
    if (!selectedZone) return;
    try {
      await axiosInstance.patch(`/geofence/zones/${selectedZone.id}`, formData);
      toast.success("Geofence zone updated successfully!");
      setShowEditModal(false);
      setSelectedZone(null);
      onZoneUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update zone");
    }
  };

  const handleDeleteZone = async () => {
    if (!selectedZone) return;
    if (!confirm(`Are you sure you want to delete "${selectedZone.name}"?`))
      return;

    try {
      await axiosInstance.delete(`/geofence/zones/${selectedZone.id}`);
      toast.success("Geofence zone deleted successfully!");
      setShowEditModal(false);
      setSelectedZone(null);
      onZoneUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete zone");
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 23.8103,
          longitude: 90.4125,
          zoom: 6,
        }}
        interactiveLayerIds={["zones-circles"]}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onClick={handleZoneClick}
        onLoad={onMapLoad}
        onMouseEnter={() => {
          const map = mapRef.current?.getMap();

          if (map) map.getCanvas().style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          const map = mapRef.current?.getMap();

          if (map) map.getCanvas().style.cursor = "";
        }}
      >
        <NavigationControl position="top-right" />

        {/* Geofence zones */}
        <Source data={zoneGeoJSON} id="zones-data" type="geojson">
          <Layer {...circleLayer} />
          <Layer {...labelLayer} />
        </Source>
      </Map>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
        <h4 className="font-semibold mb-2">🛡️ Geofence Manager</h4>
        <p className="text-sm text-gray-600">
          Click the <strong>point tool</strong> in the top-left to place a new
          geofence zone on the map. Click existing zones to edit or delete them.
        </p>
      </div>

      {/* Zone List */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs max-h-96 overflow-y-auto">
        <h4 className="font-semibold mb-2">Existing Zones ({zones.length})</h4>
        {/* Admin Test Check Panel */}
        <div className="mb-3 border-t pt-3">
          <h5 className="font-medium text-sm mb-2">
            Admin: Run geofence check
          </h5>
          <input
            className="w-full border px-2 py-1 mb-1"
            placeholder="User ID"
            value={testForm.userId}
            onChange={(e) =>
              setTestForm({ ...testForm, userId: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              className="w-full border px-2 py-1"
              placeholder="Latitude"
              value={testForm.latitude?.toString()}
              onChange={(e) =>
                setTestForm({
                  ...testForm,
                  latitude: parseFloat(e.target.value) || 0,
                })
              }
            />
            <input
              className="w-full border px-2 py-1"
              placeholder="Longitude"
              value={testForm.longitude?.toString()}
              onChange={(e) =>
                setTestForm({
                  ...testForm,
                  longitude: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={async () => {
                try {
                  setTestResult(null);
                  const res = await SessionLocationService.testGeofenceCheck({
                    userId: testForm.userId,
                    latitude: testForm.latitude,
                    longitude: testForm.longitude,
                  });

                  setTestResult(res);
                  toast.success("Test check run — see result below");
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message || "Failed to run test check"
                  );
                }
              }}
            >
              Run Test
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setTestResult(null)}
            >
              Clear
            </button>
          </div>
          {testResult && (
            <pre className="mt-2 max-h-40 overflow-auto text-xs bg-gray-50 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
        <div className="space-y-2">
          {zones.map((zone) => (
            <button
              key={zone.id}
              aria-label={`View ${zone.name} on map`}
              className="w-full text-left p-2 border rounded hover:bg-gray-50"
              type="button"
              onClick={() => {
                mapRef.current?.flyTo({
                  center: [zone.centerLongitude, zone.centerLatitude],
                  zoom: 13,
                });
              }}
            >
              <p className="font-medium text-sm">{zone.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    zone.riskLevel === "CRITICAL"
                      ? "bg-red-100 text-red-800"
                      : zone.riskLevel === "HIGH"
                        ? "bg-orange-100 text-orange-800"
                        : zone.riskLevel === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {zone.riskLevel}
                </span>
                <span className="text-xs text-gray-500">
                  {zone.radiusMeters}m radius
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create Zone Modal */}
      {isCreating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create Geofence Zone</h3>
          <div className="space-y-3">
            <Input
              label="Zone Name"
              placeholder="e.g., Downtown High Crime Area"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="District"
                placeholder="e.g., Dhaka"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
              />
              <Input
                label="Division"
                placeholder="e.g., Dhaka"
                value={formData.division}
                onChange={(e) =>
                  setFormData({ ...formData, division: e.target.value })
                }
              />
            </div>
            <Select
              label="Risk Level"
              selectedKeys={[formData.riskLevel]}
              onChange={(e) =>
                setFormData({ ...formData, riskLevel: e.target.value })
              }
            >
              <SelectItem key="LOW">Low Risk</SelectItem>
              <SelectItem key="MEDIUM">Medium Risk</SelectItem>
              <SelectItem key="HIGH">High Risk</SelectItem>
              <SelectItem key="CRITICAL">Critical Risk</SelectItem>
            </Select>
            <Input
              label="Radius (meters)"
              type="number"
              value={formData.radiusMeters.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  radiusMeters: parseInt(e.target.value) || 500,
                })
              }
            />
            <div className="flex gap-2 pt-2">
              <Button color="primary" onClick={handleCreateZone}>
                Create Zone
              </Button>
              <Button
                variant="flat"
                onClick={() => {
                  setIsCreating(false);
                  if (draw.current) draw.current.deleteAll();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      <Modal
        isOpen={showEditModal}
        size="2xl"
        onClose={() => setShowEditModal(false)}
      >
        <ModalContent>
          <ModalHeader>Edit Geofence Zone</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <Input
                label="Zone Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="District"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                />
                <Input
                  label="Division"
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({ ...formData, division: e.target.value })
                  }
                />
              </div>
              <Select
                label="Risk Level"
                selectedKeys={[formData.riskLevel]}
                onChange={(e) =>
                  setFormData({ ...formData, riskLevel: e.target.value })
                }
              >
                <SelectItem key="LOW">Low Risk</SelectItem>
                <SelectItem key="MEDIUM">Medium Risk</SelectItem>
                <SelectItem key="HIGH">High Risk</SelectItem>
                <SelectItem key="CRITICAL">Critical Risk</SelectItem>
              </Select>
              <Input
                label="Radius (meters)"
                type="number"
                value={formData.radiusMeters.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    radiusMeters: parseInt(e.target.value) || 500,
                  })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onClick={handleDeleteZone}>
              Delete Zone
            </Button>
            <Button variant="flat" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleUpdateZone}>
              Update Zone
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GeofenceManager;
