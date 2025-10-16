"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface LocationStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    usersWithLocation: number;
    totalLocationRecords: number;
    geofenceWarningsSent: number;
    topCountries: Array<{ country: string; count: number }>;
    topCities: Array<{ city: string; count: number }>;
    locationsByDay: Array<{ date: string; count: number }>;
    riskLevelDistribution: Array<{ riskLevel: string; count: number }>;
  };
}

const COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const LocationStats: React.FC<LocationStatsProps> = ({ stats }) => {
  // Ensure all data arrays exist and have default values
  const topCountries = stats?.topCountries || [];
  const topCities = stats?.topCities || [];
  const locationsByDay = stats?.locationsByDay || [];
  const riskLevelDistribution = stats?.riskLevelDistribution || [];

  // Default values for numeric stats
  const totalUsers = stats?.totalUsers || 0;
  const activeUsers = stats?.activeUsers || 0;
  const usersWithLocation = stats?.usersWithLocation || 0;
  const totalLocationRecords = stats?.totalLocationRecords || 0;
  const geofenceWarningsSent = stats?.geofenceWarningsSent || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-primary">{totalUsers}</p>
            <p className="text-sm text-default-500">Total Users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            <p className="text-sm text-default-500">Active Users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {usersWithLocation}
            </p>
            <p className="text-sm text-default-500">Users with Location</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {geofenceWarningsSent}
            </p>
            <p className="text-sm text-default-500">Geofence Warnings Sent</p>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Users by Country</h3>
          </CardHeader>
          <CardBody>
            {topCountries.length > 0 ? (
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={topCountries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-default-400">No country data available</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Users by City</h3>
          </CardHeader>
          <CardBody>
            {topCities.length > 0 ? (
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={topCities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-default-400">No city data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Tracking Over Time */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Location Records Over Time
            </h3>
          </CardHeader>
          <CardBody>
            {locationsByDay.length > 0 ? (
              <ResponsiveContainer height={300} width="100%">
                <LineChart data={locationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    dataKey="count"
                    name="Locations"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-default-400">
                  No location history available
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Geofence Zones by Risk Level
            </h3>
          </CardHeader>
          <CardBody>
            {riskLevelDistribution.length > 0 ? (
              <ResponsiveContainer height={300} width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={riskLevelDistribution}
                    dataKey="count"
                    fill="#8884d8"
                    label={({ riskLevel, count }) => `${riskLevel}: ${count}`}
                    labelLine={false}
                    outerRadius={100}
                  >
                    {riskLevelDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.riskLevel as keyof typeof COLORS] ||
                          "#6b7280"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-default-400">No risk level data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Detailed Statistics</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Location Records:</span>
                <span className="text-primary font-semibold">
                  {stats.totalLocationRecords}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Location Tracking Rate:</span>
                <span className="text-primary font-semibold">
                  {stats.totalUsers > 0
                    ? (
                        (stats.usersWithLocation / stats.totalUsers) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Active Session Rate:</span>
                <span className="text-primary font-semibold">
                  {stats.totalUsers > 0
                    ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Avg Records per User:</span>
                <span className="text-primary font-semibold">
                  {stats.usersWithLocation > 0
                    ? (
                        stats.totalLocationRecords / stats.usersWithLocation
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Geofence Warning Rate:</span>
                <span className="text-primary font-semibold">
                  {stats.totalLocationRecords > 0
                    ? (
                        (stats.geofenceWarningsSent /
                          stats.totalLocationRecords) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Countries Tracked:</span>
                <span className="text-primary font-semibold">
                  {stats.topCountries.length}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LocationStats;
