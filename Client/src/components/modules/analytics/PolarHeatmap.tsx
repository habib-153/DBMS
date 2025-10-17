"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PolarHeatmapProps {
  className?: string;
}

interface CrimeData {
  hour_of_day: number;
  day_of_week: number;
  crime_count: string;
  categories: string[];
  avg_distance: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CRIME_CATEGORIES = [
  { key: "ALL", label: "All Categories" },
  { key: "MURDER", label: "Murder" },
  { key: "THEFT", label: "Theft" },
  { key: "ASSAULT", label: "Assault" },
  { key: "FRAUD", label: "Fraud" },
  { key: "VANDALISM", label: "Vandalism" },
  { key: "BURGLARY", label: "Burglary" },
  { key: "DACOITY", label: "Dacoity" },
  { key: "KIDNAPPING", label: "Kidnapping" },
  { key: "PICKPOCKET", label: "Pickpocket" },
  { key: "OTHERS", label: "Others" },
];

// Color gradient for crime intensity (Viridis-inspired)
const getColorForIntensity = (value: number, max: number): string => {
  if (max === 0) return "rgba(68, 1, 84, 0.3)";
  const normalized = value / max;

  if (normalized < 0.2) return `rgba(68, 1, 84, ${0.3 + normalized * 2})`;
  if (normalized < 0.4) return `rgba(59, 82, 139, ${0.5 + normalized})`;
  if (normalized < 0.6) return `rgba(33, 145, 140, ${0.6 + normalized})`;
  if (normalized < 0.8) return `rgba(253, 231, 37, ${0.7 + normalized})`;

  return `rgba(253, 231, 37, ${0.8 + normalized * 0.2})`;
};

export default function PolarHeatmap({ className }: PolarHeatmapProps) {
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 23.8103, longitude: 90.4125 });
  const [radius, setRadius] = useState("2");
  const [category, setCategory] = useState("ALL");
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const initMap = async () => {
      try {
        if (!mapRef.current) {
          const container = mapContainerRef.current as HTMLElement;
          const map = L.map(container).setView(
            [selectedCoords.latitude, selectedCoords.longitude],
            12
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);

          const marker = L.marker(
            [selectedCoords.latitude, selectedCoords.longitude],
            {
              draggable: true,
            }
          ).addTo(map);

          markerRef.current = marker;
          mapRef.current = map;

          marker.on("dragend", () => {
            const pos = marker.getLatLng();

            setSelectedCoords({ latitude: pos.lat, longitude: pos.lng });
          });

          map.on("click", (e: any) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            marker.setLatLng([lat, lng]);
            setSelectedCoords({ latitude: lat, longitude: lng });
          });
        }
      } catch (err) {
        console.error("Failed to load map", err);
      }
    };

    initMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap]);

  // Fetch polar heatmap data
  const {
    data: heatmapData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "polarHeatmap",
      selectedCoords.latitude,
      selectedCoords.longitude,
      radius,
      category,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: selectedCoords.latitude.toString(),
        longitude: selectedCoords.longitude.toString(),
        radius: radius,
      });

      if (category !== "ALL") {
        params.append("category", category);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/polar-heatmap?${params}`
      );

      if (!res.ok) throw new Error("Failed to fetch polar heatmap data");

      return res.json();
    },
    enabled: false,
  });

  // Process data into matrix
  const { crimeMatrix, maxCount } = useMemo(() => {
    if (!heatmapData?.data) {
      return {
        crimeMatrix: Array(7)
          .fill(null)
          .map(() => Array(24).fill(0)),
        maxCount: 0,
      };
    }

    const matrix = Array(7)
      .fill(null)
      .map(() => Array(24).fill(0));
    let max = 0;

    heatmapData.data.forEach((item: CrimeData) => {
      const count = parseInt(item.crime_count);

      matrix[item.day_of_week][item.hour_of_day] = count;
      if (count > max) max = count;
    });

    return { crimeMatrix: matrix, maxCount: max };
  }, [heatmapData]);

  // Draw polar heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || !heatmapData?.data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 80;
    const ringWidth = maxRadius / 7;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw polar heatmap
    for (let day = 0; day < 7; day++) {
      const innerRadius = day * ringWidth;
      const outerRadius = (day + 1) * ringWidth;

      for (let hour = 0; hour < 24; hour++) {
        const startAngle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
        const endAngle = ((hour + 1) / 24) * 2 * Math.PI - Math.PI / 2;

        const value = crimeMatrix[day][hour];
        const color = getColorForIntensity(value, maxCount);

        // Draw segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Draw hour labels
    ctx.fillStyle = "currentColor";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelRadius = maxRadius + 35;
    const hours = [0, 3, 6, 9, 12, 15, 18, 21];

    hours.forEach((hour) => {
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;

      ctx.fillText(`${hour}:00`, x, y);
    });

    // Draw day labels
    ctx.font = "12px Arial";
    DAY_NAMES.forEach((day, index) => {
      const radius = (index + 0.5) * ringWidth;

      ctx.save();
      ctx.translate(centerX - radius - 50, centerY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(day.substring(0, 3), 0, 0);
      ctx.restore();
    });

    // Draw center label
    ctx.fillStyle = "currentColor";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Crime", centerX, centerY - 12);
    ctx.fillText("Hotspot", centerX, centerY + 12);
  }, [heatmapData, crimeMatrix, maxCount]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!heatmapData?.data || heatmapData.data.length === 0) {
      return {
        totalCrimes: 0,
        peakHour: "N/A",
        peakDay: "N/A",
        peakCount: 0,
      };
    }

    const data = heatmapData.data;
    const totalCrimes = data.reduce(
      (sum: number, item: CrimeData) => sum + parseInt(item.crime_count),
      0
    );

    let maxCount = 0;
    let peakHour = 0;
    let peakDay = 0;

    data.forEach((item: CrimeData) => {
      const count = parseInt(item.crime_count);

      if (count > maxCount) {
        maxCount = count;
        peakHour = item.hour_of_day;
        peakDay = item.day_of_week;
      }
    });

    return {
      totalCrimes,
      peakHour: `${peakHour.toString().padStart(2, "0")}:00`,
      peakDay: DAY_NAMES[peakDay],
      peakCount: maxCount,
    };
  }, [heatmapData]);

  const handleAnalyze = () => {
    refetch();
  };

  const handleQuickLocation = (lat: number, lng: number) => {
    setSelectedCoords({ latitude: lat, longitude: lng });
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 12);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 pb-0">
        <div className="w-full">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#a50034] to-[#8b0000] bg-clip-text text-transparent">
            Crime Hotspot Polar Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Discover when crimes occur most frequently by hour and day within a{" "}
            {radius} km radius
          </p>
        </div>

        {/* Filters */}
        <div className="w-full space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              className="max-w-[200px]"
              label="Latitude"
              size="sm"
              type="number"
              value={selectedCoords.latitude.toString()}
              onChange={(e) =>
                setSelectedCoords({
                  ...selectedCoords,
                  latitude: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              className="max-w-[200px]"
              label="Longitude"
              size="sm"
              type="number"
              value={selectedCoords.longitude.toString()}
              onChange={(e) =>
                setSelectedCoords({
                  ...selectedCoords,
                  longitude: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              className="max-w-[150px]"
              label="Radius (km)"
              max="10"
              min="0.5"
              size="sm"
              step="0.5"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            />
            <Select
              className="max-w-[200px]"
              label="Crime Type"
              selectedKeys={[category]}
              size="sm"
              onChange={(e) => setCategory(e.target.value)}
            >
              {CRIME_CATEGORIES.map((cat) => (
                <SelectItem key={cat.key}>{cat.label}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Quick Location Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onClick={() => handleQuickLocation(23.8103, 90.4125)}
            >
              📍 Dhaka
            </Button>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onClick={() => handleQuickLocation(22.3569, 91.7832)}
            >
              📍 Chittagong
            </Button>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onClick={() => handleQuickLocation(24.3636, 88.6241)}
            >
              📍 Rajshahi
            </Button>
            <Button
              color="secondary"
              size="sm"
              variant="flat"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
            </Button>
            <Button
              className="bg-[#a50034] text-white"
              size="sm"
              onClick={handleAnalyze}
            >
              🔍 Analyze Area
            </Button>
          </div>

          {/* Map Container */}
          {showMap && (
            <div
              ref={mapContainerRef}
              className="w-full h-[400px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
              style={{ zIndex: 1 }}
            />
          )}
        </div>
      </CardHeader>

      <CardBody className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">
            <Spinner label="Analyzing crime patterns..." size="lg" />
          </div>
        ) : !heatmapData?.data || heatmapData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold">No Data Available</p>
            <p className="text-sm mt-2">
              Click &quot;🔍 Analyze Area&quot; to generate the polar heatmap
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Selected location: {selectedCoords.latitude.toFixed(4)},{" "}
              {selectedCoords.longitude.toFixed(4)}
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Crimes
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics.totalCrimes}
                </p>
                <p className="text-xs text-gray-500 mt-1">in selected area</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Peak Hour
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {statistics.peakHour}
                </p>
                <p className="text-xs text-gray-500 mt-1">most dangerous</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Peak Day
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {statistics.peakDay}
                </p>
                <p className="text-xs text-gray-500 mt-1">highest activity</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Peak Count
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.peakCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">at peak time</p>
              </div>
            </div>

            {/* Polar Heatmap Visualization */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-center">
                  Circular Crime Pattern Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  Hour of day (0-24) around circle • Day of week: Sunday
                  (center) to Saturday (outer)
                </p>

                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full"
                    height={700}
                    width={700}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold mb-3">
                  Color Intensity Scale (Viridis)
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Low
                  </span>
                  <div
                    className="flex-1 h-6 rounded"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(68, 1, 84, 0.3), rgba(59, 82, 139, 0.7), rgba(33, 145, 140, 0.8), rgba(253, 231, 37, 0.9))",
                    }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    High
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mt-3">
                  {DAY_NAMES.map((day, index) => (
                    <div key={day} className="text-xs">
                      <div className="font-semibold">{day.substring(0, 3)}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Ring {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  📖 How to Read This Visualization
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>
                    The circle represents 24 hours, starting from midnight (top)
                    going clockwise
                  </li>
                  <li>
                    Each ring represents a day: Sunday (innermost) to Saturday
                    (outermost)
                  </li>
                  <li>
                    Brighter/warmer colors indicate higher crime frequency at
                    that specific hour and day
                  </li>
                  <li>
                    Use the Viridis color scale to identify crime hotspots
                    instantly
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
