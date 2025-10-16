"use client";

import { Card, CardBody } from "@heroui/react";
import { MapPin, TrendingUp, AlertTriangle } from "lucide-react";

import InteractiveHeatmap from "@/src/components/modules/Home/InteractiveHeatmap";
import {
  useGetDistrictStats,
  useGetDivisionStats,
} from "@/src/hooks/heatmap.hook";
import Container from "@/src/components/UI/Container";

export default function HeatmapPage() {
  const { data: districtData, isLoading: districtLoading } =
    useGetDistrictStats();
  const { data: divisionData, isLoading: divisionLoading } =
    useGetDivisionStats();

  const topDistricts = districtData?.data?.slice(0, 5) || [];
  const topDivisions = divisionData?.data?.slice(0, 3) || [];

  return (
    <Container>
      <div className="pb-5 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MapPin className="h-8 w-8 text-brand-primary" />
            <h1 className="text-3xl font-bold">Crime Heatmap</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Visualize crime incidents across Bangladesh. Explore hotspots, view
            statistics, and stay informed about safety in different regions.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Districts
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {districtLoading ? "..." : districtData?.data?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Divisions
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {divisionLoading ? "..." : divisionData?.data?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Incidents
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {districtLoading
                      ? "..."
                      : districtData?.data?.reduce(
                          (sum: number, d: any) => sum + d.crimeCount,
                          0
                        ) || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Interactive Heatmap */}
        <InteractiveHeatmap className="w-full" />

        {/* Top Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Top Districts */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-primary" />
                Top 5 Districts by Crime Count
              </h3>
              {districtLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topDistricts.map((district: any, index: number) => (
                    <div
                      key={district.district}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{district.district}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {district.division} Division
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-primary">
                          {district.crimeCount}
                        </p>
                        <p className="text-xs text-gray-500">incidents</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Top Divisions */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Top 3 Divisions by Crime Count
              </h3>
              {divisionLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topDivisions.map((division: any, index: number) => (
                    <div
                      key={division.division}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500/10 text-orange-500 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{division.division}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {division.districts} districts
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-500">
                          {division.crimeCount}
                        </p>
                        <p className="text-xs text-gray-500">incidents</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gradient-to-br from-brand-primary/5 to-transparent">
            <CardBody className="p-6">
              <h4 className="font-semibold mb-2 text-brand-primary">
                How to Use the Heatmap
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-0.5">•</span>
                  <span>Zoom in/out to see more details or broader areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-0.5">•</span>
                  <span>Click on crime points to view incident details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-0.5">•</span>
                  <span>
                    Darker blue areas indicate higher crime density; a
                    single-color (monochrome) palette is used for clarity and
                    improved accessibility.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary mt-0.5">•</span>
                  <span>Use fullscreen mode for better visualization</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardBody className="p-6">
              <h4 className="font-semibold mb-2 text-blue-500">
                Understanding Crime Weight
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>
                    Crime intensity is calculated based on multiple factors
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Verification score contributes 40% to the weight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Report count contributes 30% to the weight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Recent crimes are weighted higher than older ones</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
