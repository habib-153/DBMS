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

  // Heatmap layer configuration optimized for large datasets
  const heatmapLayer: LayerProps = {
    id: "crime-heat",
    type: "heatmap",
    maxzoom: 15,
    paint: {
      // Increase weight influence based on zoom level
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", "weight"],
        0,
        0,
        1,
        2 // Increased max weight for better visibility
      ],
      // Enhanced intensity scaling for better visualization of dense areas
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 1,
        9, 4,
        15, 8
      ],
      // Subtle heatmap coloring for light theme
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(165, 0, 52, 0)",
        0.1,
        "rgba(254, 226, 226, 0.5)",
        0.3,
        "rgba(254, 202, 202, 0.6)",
        0.5,
        "rgba(165, 0, 52, 0.5)",
        0.7,
        "rgba(165, 0, 52, 0.7)",
        1,
        "rgba(165, 0, 52, 0.8)"
      ],
      // Adjusted radius based on zoom for better clustering
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 4,    // Smaller initial radius
        9, 30,   // Medium zoom
        15, 50   // Maximum zoom
      ],
      // Improved opacity scaling
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 1,     // Full opacity at low zoom
        9, 0.9,   // Slight fade at medium zoom
        15, 0.7   // More transparent at high zoom
      ],
    },
  };

  // Clean pointer design with subtle glow effect
  const circleLayer: LayerProps = {
    id: "crime-point",
    type: "circle",
    minzoom: 8,
    paint: {
      // Core pointer size
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        ["interpolate", ["linear"], ["get", "weight"], 0, 4, 1, 6],
        12,
        ["interpolate", ["linear"], ["get", "weight"], 0, 6, 1, 8],
        16,
        ["interpolate", ["linear"], ["get", "weight"], 0, 8, 1, 10]
      ],
      // Single brand red color (solid center)
      "circle-color": "#a50034",
      // Ensure no stroke is drawn
      "circle-stroke-width": 0,
      // No blur for the core dot
      "circle-blur": 0,
      // Full opacity for the core marker
      "circle-opacity": 1
    },
  };

  // Outer glow effect
  const circleBlurLayer: LayerProps = {
    id: "crime-point-blur",
    type: "circle",
    minzoom: 8,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        ["interpolate", ["linear"], ["get", "weight"], 0, 15, 1, 20],
        12,
        ["interpolate", ["linear"], ["get", "weight"], 0, 20, 1, 25],
        16,
        ["interpolate", ["linear"], ["get", "weight"], 0, 25, 1, 30]
      ],
      // translucent blur using rgba so it fades into background without
      // creating lighter opaque halos
      "circle-color": "rgba(165,0,52,0.14)",
      "circle-blur": 2.5,
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 0.15,
        10, 0.2,
        12, 0.25
      ],
    },
  };

  // Cluster layer to group many points at low zoom and avoid overplotting
  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "crime-points",
    filter: ["has", "point_count"],
    paint: {
      // size based on point count
      "circle-radius": [
        "step",
        ["get", "point_count"],
        15,
        50,
        20,
        200,
        30,
      ],
      // color progression for clusters
      "circle-color": [
        "step",
        ["get", "point_count"],
        "rgba(165,0,52,0.25)",
        50,
        "rgba(165,0,52,0.45)",
        200,
        "rgba(165,0,52,0.65)",
      ],
      "circle-opacity": 0.9,
      "circle-blur": 1.6,
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "crime-points",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
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
            <div className="h-[500px] w-full rounded-lg overflow-hidden relative shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <Map
                initialViewState={{
                  longitude: 90.4125,
                  latitude: 23.8103,
                  zoom: 6.5,
                }}
                interactiveLayerIds={["crime-point", "crime-heat"]}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                onClick={onClick}
              >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {geojson && (
                  <Source
                    data={geojson}
                    id="crime-points"
                    type="geojson"
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                  >
                    {/* Heatmap provides context for density */}
                    <Layer {...heatmapLayer} />

                    {/* Clusters at low zoom to avoid overplotting */}
                    <Layer {...clusterLayer} />
                    <Layer {...clusterCountLayer} />

                    {/* Blurred halo under individual points */}
                    <Layer {...circleBlurLayer} />

                    {/* Core point marker */}
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
                    <div className="p-3 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-3 w-3 rounded-full mt-1 ${
                              popupInfo.weight > 0.75
                                ? "bg-brand-secondary"
                                : popupInfo.weight > 0.5
                                  ? "bg-brand-primary"
                                  : popupInfo.weight > 0.25
                                    ? "bg-red-400"
                                    : "bg-red-200"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                            {popupInfo.title}
                          </h3>
                          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <div>
                              <strong>Location:</strong> {popupInfo.district}, {popupInfo.division}
                            </div>
                            <div>
                              <strong>Date:</strong>{" "}
                              {new Date(popupInfo.crimeDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">Severity</span>
                                <span className="font-semibold">{(popupInfo.weight * 100).toFixed(0)}%</span>
                              </div>
                              <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                {/* eslint-disable-next-line */}
                                <div
                                  className={`h-2 rounded-full ${
                                    popupInfo.weight > 0.75
                                      ? "bg-brand-secondary"
                                      : popupInfo.weight > 0.5
                                        ? "bg-brand-primary"
                                        : popupInfo.weight > 0.25
                                          ? "bg-red-400"
                                          : "bg-red-200"
                                  }`}
                                  style={{ width: `${popupInfo.weight * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
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
                Crime Intensity
              </h4>
              <div className="flex flex-col gap-2">
                <div className="h-6 w-full rounded-md overflow-hidden ring-1 ring-gray-100 dark:ring-gray-700">
                  {/* gradient from very light blue to deep blue */}
                  <div className="h-full w-full" style={{
                    background: 'linear-gradient(90deg, #FEE2E2 0%, #FECACA 25%, #F87171 50%, #a50034 75%, #8b0000 100%)'
                  }} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Darker red indicates higher crime density. Zoom in to see individual points.
                </p>
              </div>
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
