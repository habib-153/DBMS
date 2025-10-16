"use client";

import type { MapMouseEvent } from "react-map-gl/mapbox";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";
import { MapPin, Layers, Filter, Globe } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  FullscreenControl,
  Layer,
  LayerProps,
  NavigationControl,
  Popup,
  Source,
  MapRef,
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

interface CrimeReport {
  title: string;
  description: string;
  image: string;
  crimeDate: string;
  postId: string;
  verificationScore: number;
  weight: number;
  district: string;
  division: string;
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  district: string;
  division: string;
  reports: CrimeReport[];
}

export default function InteractiveHeatmap({ className }: HeatmapProps) {
  const [viewMode, setViewMode] = useState<"heatmap" | "choropleth">("heatmap");
  const [showFilters, setShowFilters] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>("all");
  const mapRef = useRef<MapRef>(null);

  // Fetch data
  const { data: heatmapData, isLoading: heatmapLoading } =
    useGetHeatmapPoints();
  const { isLoading: districtLoading } = useGetDistrictStats();

  // Convert crime data to GeoJSON with proper filtering
  const geojson = useMemo(() => {
    if (!heatmapData?.data) return null;

    let filteredData = heatmapData.data;

    // Apply district filter
    if (selectedDistricts.length > 0) {
      filteredData = filteredData.filter((point: any) =>
        selectedDistricts.includes(point.district)
      );
    }

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const daysAgo =
        dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
      const cutoffDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );

      filteredData = filteredData.filter((point: any) => {
        const crimeDate = new Date(point.crimeDate);

        return crimeDate >= cutoffDate;
      });
    }

    return {
      type: "FeatureCollection" as const,
      features: filteredData.map((point: any) => ({
        type: "Feature" as const,
        properties: {
          weight: point.weight || 0.5,
          title: point.title || "Crime Report",
          description: point.description || "",
          image: point.image || "",
          district: point.district || "Unknown",
          division: point.division || "Unknown",
          crimeDate: point.crimeDate || new Date().toISOString(),
          postId: point.postId || "",
          verificationScore: point.verificationScore || 0,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat],
        },
      })),
    };
  }, [heatmapData, selectedDistricts, dateRange]);

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
        2, // Increased max weight for better visibility
      ],
      // Enhanced intensity scaling for better visualization of dense areas
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        9,
        4,
        15,
        8,
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
        "rgba(165, 0, 52, 0.8)",
      ],
      // Adjusted radius based on zoom for better clustering
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        4, // Smaller initial radius
        9,
        30, // Medium zoom
        15,
        50, // Maximum zoom
      ],
      // Improved opacity scaling
      "heatmap-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7,
        1, // Full opacity at low zoom
        9,
        0.9, // Slight fade at medium zoom
        15,
        0.7, // More transparent at high zoom
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
        ["interpolate", ["linear"], ["get", "weight"], 0, 8, 1, 10],
      ],
      // Single brand red color (solid center)
      "circle-color": "#a50034",
      // Ensure no stroke is drawn
      "circle-stroke-width": 0,
      // No blur for the core dot
      "circle-blur": 0,
      // Full opacity for the core marker
      "circle-opacity": 1,
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
        ["interpolate", ["linear"], ["get", "weight"], 0, 25, 1, 30],
      ],
      // translucent blur using rgba so it fades into background without
      // creating lighter opaque halos
      "circle-color": "rgba(165,0,52,0.14)",
      "circle-blur": 2.5,
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        0.15,
        10,
        0.2,
        12,
        0.25,
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
      "circle-radius": ["step", ["get", "point_count"], 15, 50, 20, 200, 30],
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

  // 3D Buildings layer
  const buildingsLayer: LayerProps = {
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 13,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        0,
        13.05,
        ["get", "height"],
      ],
      "fill-extrusion-base": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        0,
        13.05,
        ["get", "min_height"],
      ],
      "fill-extrusion-opacity": 0.6,
    },
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "heatmap" ? "choropleth" : "heatmap"));
  };

  const toggle3D = () => {
    const map = mapRef.current?.getMap();

    if (!map) return;

    setShow3D((prev) => {
      const new3DState = !prev;

      if (new3DState) {
        // Enable 3D view
        map.easeTo({
          pitch: 50,
          bearing: -17.6,
          duration: 1000,
        });
      } else {
        // Disable 3D view
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000,
        });
      }

      return new3DState;
    });
  };

  // Enhanced click handler with proper event typing
  const onClick = useCallback(
    (event: MapMouseEvent) => {
      // Close any existing popup first
      setPopupInfo(null);

      const features = event.features;

      if (!features || features.length === 0) return;

      const feature = features[0];

      // Extract coordinates from the clicked feature
      let longitude: number;
      let latitude: number;

      if (
        feature.geometry.type === "Point" &&
        Array.isArray(feature.geometry.coordinates)
      ) {
        [longitude, latitude] = feature.geometry.coordinates;
      } else if (event.lngLat) {
        longitude = event.lngLat.lng;
        latitude = event.lngLat.lat;
      } else {
        return;
      }

      // Find all reports at this location (within a small threshold for coordinate matching)
      const threshold = 0.0001; // ~11 meters
      const reportsAtLocation: CrimeReport[] = [];

      if (heatmapData?.data) {
        heatmapData.data.forEach((point: any) => {
          const latDiff = Math.abs(point.lat - latitude);
          const lngDiff = Math.abs(point.lng - longitude);

          if (latDiff < threshold && lngDiff < threshold) {
            reportsAtLocation.push({
              title: point.title || "Crime Report",
              description: point.description || "",
              image: point.image || "",
              district: point.district || "Unknown",
              division: point.division || "Unknown",
              crimeDate: point.crimeDate || new Date().toISOString(),
              postId: point.postId || "",
              verificationScore: parseFloat(point.verificationScore) || 0,
              weight: Math.max(0, Math.min(1, parseFloat(point.weight) || 0.5)),
            });
          }
        });
      }

      // If no reports found by proximity, use the clicked feature's properties
      if (reportsAtLocation.length === 0 && feature.properties) {
        const props = feature.properties;

        reportsAtLocation.push({
          title: props.title || "Crime Report",
          description: props.description || "",
          image: props.image || "",
          district: props.district || "Unknown",
          division: props.division || "Unknown",
          crimeDate: props.crimeDate || new Date().toISOString(),
          postId: props.postId || "",
          verificationScore: parseFloat(props.verificationScore) || 0,
          weight: Math.max(0, Math.min(1, parseFloat(props.weight) || 0.5)),
        });
      }

      if (reportsAtLocation.length > 0) {
        const firstReport = reportsAtLocation[0];

        console.log("🎯 Setting popup with:", {
          district: firstReport.district,
          division: firstReport.division,
          reportsCount: reportsAtLocation.length,
        });

        setPopupInfo({
          longitude,
          latitude,
          district: firstReport.district,
          division: firstReport.division,
          reports: reportsAtLocation,
        });
        setCurrentSlide(0); // Reset to first slide
      } else {
        console.warn("⚠️ No reports found at clicked location");
      }
    },
    [heatmapData]
  );

  // Get unique districts for filter
  const uniqueDistricts = useMemo(() => {
    if (!heatmapData?.data) return [];
    const districts = new Set<string>();

    heatmapData.data.forEach((point: any) => {
      if (point.district && point.district !== "Unknown") {
        districts.add(point.district);
      }
    });

    return Array.from(districts).sort();
  }, [heatmapData]);

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
            color={showFilters ? "primary" : "default"}
            size="sm"
            title="Toggle filters"
            variant="flat"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            isIconOnly
            color={show3D ? "primary" : "default"}
            size="sm"
            title="Toggle 3D buildings"
            variant="flat"
            onPress={toggle3D}
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            isIconOnly
            color={viewMode === "choropleth" ? "primary" : "default"}
            size="sm"
            title="Toggle view mode"
            variant="flat"
            onPress={toggleViewMode}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-default-100 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Time Range"
                placeholder="Select time range"
                selectedKeys={[dateRange]}
                size="sm"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setDateRange(selected);
                }}
              >
                <SelectItem key="all">All Time</SelectItem>
                <SelectItem key="7days">Last 7 Days</SelectItem>
                <SelectItem key="30days">Last 30 Days</SelectItem>
                <SelectItem key="90days">Last 90 Days</SelectItem>
              </Select>

              {uniqueDistricts.length > 0 && (
                <Select
                  label="Districts"
                  placeholder="Filter by district"
                  selectedKeys={selectedDistricts}
                  selectionMode="multiple"
                  size="sm"
                  onSelectionChange={(keys) => {
                    setSelectedDistricts(Array.from(keys) as string[]);
                  }}
                >
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district}>{district}</SelectItem>
                  ))}
                </Select>
              )}
            </div>

            {(selectedDistricts.length > 0 || dateRange !== "all") && (
              <Button
                color="danger"
                size="sm"
                variant="flat"
                onPress={() => {
                  setSelectedDistricts([]);
                  setDateRange("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {heatmapLoading || districtLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Spinner size="lg" />
            <p className="ml-2">Loading map data...</p>
          </div>
        ) : (
          <>
            <div className="h-[500px] w-full rounded-lg overflow-hidden relative shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <Map
                ref={mapRef}
                initialViewState={{
                  longitude: 90.4125,
                  latitude: 23.8103,
                  zoom: 6.5,
                }}
                interactiveLayerIds={[
                  "crime-point",
                  "crime-point-blur",
                  "clusters",
                  "cluster-count",
                ]}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
                onClick={onClick}
              >
                <NavigationControl position="top-right" visualizePitch={true} />
                <FullscreenControl position="top-right" />

                {/* 3D Buildings Layer */}
                {show3D && <Layer {...buildingsLayer} />}

                {geojson && (
                  <Source
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                    data={geojson}
                    id="crime-points"
                    type="geojson"
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

                {popupInfo && popupInfo.reports.length > 0 && (
                  <Popup
                    anchor="bottom"
                    className="crime-popup"
                    closeButton={true}
                    closeOnClick={true}
                    latitude={popupInfo.latitude}
                    longitude={popupInfo.longitude}
                    maxWidth="360px"
                    onClose={() => {
                      setPopupInfo(null);
                      setCurrentSlide(0);
                    }}
                  >
                    <div className="p-0 max-w-sm">
                      {/* Multiple Reports Indicator */}
                      {popupInfo.reports.length > 1 && (
                        <div className="bg-brand-primary text-white text-xs font-medium px-3 py-1.5 flex items-center justify-between">
                          <span>
                            {popupInfo.reports.length} Reports at this location
                          </span>
                          <span className="text-xs opacity-90">
                            {currentSlide + 1} / {popupInfo.reports.length}
                          </span>
                        </div>
                      )}

                      {/* Current Report */}
                      {(() => {
                        const report = popupInfo.reports[currentSlide];

                        return (
                          <>
                            {/* Crime Image */}
                            {report.image && (
                              <div className="w-full h-40 overflow-hidden relative">
                                <img
                                  alt={report.title}
                                  className="w-full h-full object-cover"
                                  src={report.image}
                                />
                                {/* Navigation Arrows for Images */}
                                {popupInfo.reports.length > 1 && (
                                  <>
                                    <button
                                      aria-label="prev"
                                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSlide((prev) =>
                                          prev > 0
                                            ? prev - 1
                                            : popupInfo.reports.length - 1
                                        );
                                      }}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          d="M15 19l-7-7 7-7"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      aria-label="Next"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSlide((prev) =>
                                          prev < popupInfo.reports.length - 1
                                            ? prev + 1
                                            : 0
                                        );
                                      }}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          d="M9 5l7 7-7 7"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                        />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`h-3 w-3 rounded-full mt-1 ${
                                      report.weight > 0.75
                                        ? "bg-brand-secondary"
                                        : report.weight > 0.5
                                          ? "bg-brand-primary"
                                          : report.weight > 0.25
                                            ? "bg-red-400"
                                            : "bg-red-200"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                                    {report.title}
                                  </h3>

                                  {/* Description */}
                                  {report.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                      {report.description}
                                    </p>
                                  )}

                                  <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    <div>
                                      <strong>Location:</strong>{" "}
                                      {popupInfo.district}, {popupInfo.division}
                                    </div>
                                    <div>
                                      <strong>Date:</strong>{" "}
                                      {new Date(
                                        report.crimeDate
                                      ).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                    <div>
                                      <strong>Verification Score:</strong>{" "}
                                      <span
                                        className={`font-medium ${
                                          report.verificationScore >= 75
                                            ? "text-green-600"
                                            : report.verificationScore >= 50
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                        }`}
                                      >
                                        {report.verificationScore.toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">
                                          Severity
                                        </span>
                                        <span className="font-semibold">
                                          {(report.weight * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            report.weight > 0.75
                                              ? "bg-brand-secondary"
                                              : report.weight > 0.5
                                                ? "bg-brand-primary"
                                                : report.weight > 0.25
                                                  ? "bg-red-400"
                                                  : "bg-red-200"
                                          }`}
                                          style={{
                                            width: `${report.weight * 100}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* View Details Button */}
                                  {report.postId && (
                                    <a
                                      className="mt-3 block w-full text-center text-xs font-medium text-brand-primary hover:text-brand-secondary border border-brand-primary hover:border-brand-secondary rounded-md py-1.5 transition-colors"
                                      href={`/posts/${report.postId}`}
                                    >
                                      View Full Details
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Slide Indicators */}
                              {popupInfo.reports.length > 1 && (
                                <div className="flex justify-center gap-1.5 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  {popupInfo.reports.map((_, index) => (
                                    <button
                                      key={index}
                                      aria-label={`Slide to report {index + 1}`}
                                      className={`h-1.5 rounded-full transition-all ${
                                        index === currentSlide
                                          ? "w-6 bg-brand-primary"
                                          : "w-1.5 bg-gray-300 dark:bg-gray-600"
                                      }`}
                                      onClick={() => setCurrentSlide(index)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
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
                  <div
                    className="h-full w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #FEE2E2 0%, #FECACA 25%, #F87171 50%, #a50034 75%, #8b0000 100%)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Darker red indicates higher crime density. Zoom in to see
                  individual points.
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
