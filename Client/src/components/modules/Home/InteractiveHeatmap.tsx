"use client";

import { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { MapPin, Layers, Filter } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  FullscreenControl,
  Layer,
  LayerProps,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/mapbox";

import {
  useGetHeatmapPoints,
  useGetDistrictStats,
} from "@/src/hooks/heatmap.hook";

// Mapbox token
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiaGFiaWIxNTMiLCJhIjoiY21nZXZ1ajN6MDF1czJrc2MwbHQwc2MydSJ9.aSaVggHUcQ_7bGf_0Cz_Jw";

interface HeatmapProps {
  className?: string;
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  title: string;
  district: string;
  division: string;
  crimeDate: string;
  weight: number;
}

export default function InteractiveHeatmap({ className }: HeatmapProps) {
  const [viewMode, setViewMode] = useState<"heatmap" | "choropleth">("heatmap");
  const [showFilters, setShowFilters] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  // Fetch data
  const { data: heatmapData, isLoading: heatmapLoading } =
    useGetHeatmapPoints();
  const { data: districtData, isLoading: districtLoading } =
    useGetDistrictStats();

  // Convert crime data to GeoJSON
  const geojson = useMemo(() => {
    if (!heatmapData?.data) return null;

    return {
      type: "FeatureCollection" as const,
      features: heatmapData.data.map((point: any) => ({
        type: "Feature" as const,
        properties: {
          weight: point.weight || 0.5,
          title: point.title || "Crime Report",
          district: point.district || "Unknown",
          division: point.division || "Unknown",
          crimeDate: point.crimeDate || new Date().toISOString(),
        },
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat],
        },
      })),
    };
  }, [heatmapData]);

  // Heatmap layer configuration with custom color scheme
  const heatmapLayer: LayerProps = {
    id: "crime-heat",
    type: "heatmap",
    maxzoom: 15,
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", "weight"],
        0,
        0,
        1,
        1,
      ],
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
      // Blue → Green → Yellow → Orange → Red
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(59, 130, 246, 0)", // Transparent Blue
        0.2,
        "rgb(59, 130, 246)", // Blue - Low
        0.4,
        "rgb(34, 197, 94)", // Green - Safe
        0.6,
        "rgb(234, 179, 8)", // Yellow - Medium
        0.8,
        "rgb(249, 115, 22)", // Orange - High
        1,
        "rgb(239, 68, 68)", // Red - Very High
      ],
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 6, 9, 40],
      "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.8, 9, 0.6],
    },
  };

  // Circle layer for individual points at high zoom
  const circleLayer: LayerProps = {
    id: "crime-point",
    type: "circle",
    minzoom: 7,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7,
        ["interpolate", ["linear"], ["get", "weight"], 0, 2, 1, 6],
        16,
        ["interpolate", ["linear"], ["get", "weight"], 0, 8, 1, 60],
      ],
      // Blue → Green → Yellow → Orange → Red based on weight
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "weight"],
        0,
        "#3B82F6", // Blue - Low
        0.25,
        "#22C55E", // Green - Safe
        0.5,
        "#EAB308", // Yellow - Medium
        0.75,
        "#F97316", // Orange - High
        1,
        "#EF4444", // Red - Very High
      ],
      "circle-stroke-color": "white",
      "circle-stroke-width": 2,
      "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 0.8],
      "circle-stroke-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7,
        0,
        8,
        1,
      ],
    },
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "heatmap" ? "choropleth" : "heatmap"));
  };

  const onClick = (event: any) => {
    // Try to read a feature (if clicking an interactive layer). If not available,
    // fall back to the clicked lng/lat from the event (react-map-gl provides
    // event.lngLat as [lng, lat]). This avoids cases where aggregated/heatmap
    // features don't include geometry or when the feature is missing.
    const feature = event.features?.[0];

    let longitude: number | undefined;
    let latitude: number | undefined;

    if (
      feature &&
      feature.geometry &&
      Array.isArray(feature.geometry.coordinates)
    ) {
      longitude = feature.geometry.coordinates[0];
      latitude = feature.geometry.coordinates[1];
    } else if (event.lngLat) {
      // react-map-gl provides lngLat either as an array [lng, lat] or an object
      if (Array.isArray(event.lngLat)) {
        [longitude, latitude] = event.lngLat;
      } else {
        longitude = event.lngLat?.lng;
        latitude = event.lngLat?.lat;
      }
    }

    if (longitude == null || latitude == null) return;

    const getProp = (key: string, fallback: any) => {
      return feature?.properties?.[key] ?? fallback;
    };

    setPopupInfo({
      longitude,
      latitude,
      title: getProp("title", "Crime Report"),
      district: getProp("district", "Unknown"),
      division: getProp("division", "Unknown"),
      crimeDate: getProp("crimeDate", new Date().toISOString()),
      // ensure numeric weight and clamp to [0,1]
      weight: Math.max(
        0,
        Math.min(1, parseFloat(getProp("weight", 0.5)) || 0.5)
      ),
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex justify-between items-center pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="text-brand-primary h-5 w-5" />
          <h3 className="font-semibold text-lg">Crime Heatmap</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button isIconOnly size="sm" variant="flat" onPress={toggleViewMode}>
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {heatmapLoading || districtLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Spinner size="lg" />
            <p className="ml-2">Loading map data...</p>
          </div>
        ) : (
          <>
            <div className="h-[500px] w-full rounded-lg overflow-hidden relative">
              <Map
                initialViewState={{
                  longitude: 90.4125,
                  latitude: 23.8103,
                  zoom: 6.5,
                }}
                interactiveLayerIds={["crime-point", "crime-heat"]}
                mapStyle="mapbox://styles/mapbox/outdoors-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                onClick={onClick}
              >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {geojson && (
                  <Source data={geojson} id="crime-points" type="geojson">
                    <Layer {...heatmapLayer} />
                    <Layer {...circleLayer} />
                  </Source>
                )}

                {popupInfo && (
                  <Popup
                    anchor="bottom"
                    className="crime-popup"
                    closeButton={true}
                    closeOnClick={true}
                    latitude={popupInfo.latitude}
                    longitude={popupInfo.longitude}
                    onClose={() => setPopupInfo(null)}
                  >
                    <div className="p-3">
                      <h3 className="font-bold text-base mb-2 text-gray-900">
                        {popupInfo.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-primary" />
                          <span>
                            <strong>Location:</strong> {popupInfo.district},{" "}
                            {popupInfo.division}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📅</span>
                          <span>
                            <strong>Date:</strong>{" "}
                            {new Date(popupInfo.crimeDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-500">⚠️</span>
                          <span>
                            <strong>Severity:</strong>
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            {/* eslint-disable-next-line */}
                            <div
                              className={`h-2 rounded-full ${
                                popupInfo.weight > 0.75
                                  ? "bg-red-500"
                                  : popupInfo.weight > 0.5
                                    ? "bg-orange-500"
                                    : popupInfo.weight > 0.25
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                              style={{ width: `${popupInfo.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">
                            {(popupInfo.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>

            {/* Legend - Crime Intensity */}
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Crime Intensity Legend
              </h4>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-full rounded bg-[#3B82F6]" />
                  <span className="text-gray-600 dark:text-gray-400">Low</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-full rounded bg-[#22C55E]" />
                  <span className="text-gray-600 dark:text-gray-400">Safe</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-full rounded bg-[#EAB308]" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Medium
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-full rounded bg-[#F97316]" />
                  <span className="text-gray-600 dark:text-gray-400">High</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-full rounded bg-[#EF4444]" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Very High
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Zoom in to see individual crime points
              </p>
            </div>

            {/* Stats */}
            {heatmapData?.data && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {heatmapData.data.length > 0 ? (
                  <>Showing {heatmapData.data.length} crime incidents</>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-orange-500 font-medium">
                      No crime data available
                    </p>
                    <p className="text-xs mt-1">
                      This could be due to: no approved posts, missing district
                      coordinates, or database connection issues.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
