"use client";
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Tabs, Tab } from "@heroui/react";
import { ParentSize } from "@visx/responsive";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import Loading from "../../loading";

import {
  EnhancedBarChart,
  EnhancedPieChart,
} from "@/src/components/modules/analytics/EnhancedCharts";
import PolarHeatmap from "@/src/components/modules/analytics/PolarHeatmap";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B9D",
  "#C0C0C0",
  "#FF9999",
];

const CATEGORY_COLORS: Record<string, string> = {
  MURDER: "#FF0000",
  THEFT: "#FFA500",
  ASSAULT: "#FF6B6B",
  FRAUD: "#9B59B6",
  VANDALISM: "#F39C12",
  BURGLARY: "#E74C3C",
  DACOITY: "#C0392B",
  KIDNAPPING: "#8E44AD",
  PICKPOCKET: "#D35400",
  OTHERS: "#95A5A6",
};

const EnhancedAnalytics = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch all analytics data
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["crimeTrend"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/crime-trend`
      );

      if (!res.ok) throw new Error("Failed to fetch crime trends");

      return res.json();
    },
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["crimeCategory"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/crime-type-distribution`
      );

      if (!res.ok) throw new Error("Failed to fetch category data");

      return res.json();
    },
  });

  const { data: hotspotData, isLoading: hotspotLoading } = useQuery({
    queryKey: ["hotspotDistricts"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/hotspot-districts`
      );

      if (!res.ok) throw new Error("Failed to fetch hotspot data");

      return res.json();
    },
  });

  const { data: crimeHourData, isLoading: crimeHourLoading } = useQuery({
    queryKey: ["crimeByHour"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/time-pattern`
      );

      if (!res.ok) throw new Error("Failed to fetch crime hour data");

      return res.json();
    },
  });

  const { data: divisionData, isLoading: divisionLoading } = useQuery({
    queryKey: ["divisionStats"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/division-stats`
      );

      if (!res.ok) throw new Error("Failed to fetch division data");

      return res.json();
    },
  });

  const { data: dayOfWeekData, isLoading: dayOfWeekLoading } = useQuery({
    queryKey: ["crimesByDay"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/analytics/crimes-by-day`
      );

      if (!res.ok) throw new Error("Failed to fetch day of week data");

      return res.json();
    },
  });

  const { data: recentActivityData, isLoading: recentActivityLoading } =
    useQuery({
      queryKey: ["recentActivity"],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/analytics/recent-activity`
        );

        if (!res.ok) throw new Error("Failed to fetch recent activity");

        return res.json();
      },
    });

  const isLoading =
    trendLoading ||
    categoryLoading ||
    hotspotLoading ||
    crimeHourLoading ||
    divisionLoading ||
    dayOfWeekLoading ||
    recentActivityLoading 

  if (isLoading) {
    return <Loading />;
  }

  // Process data
  const trends = trendData?.data || [];
  const categories = categoryData?.data || [];
  const hotspots = hotspotData?.data || [];
  const crimeByHour = crimeHourData?.data || [];
  const divisions = divisionData?.data || [];
  const dayOfWeek = dayOfWeekData?.data || [];
  const recentActivity = recentActivityData?.data || [];

  // Transform data for charts
  const trendChartData = trends.map((item: any) => ({
    date: new Date(item.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    crimes: parseInt(item.cnt),
    movingAvg: parseFloat(item.ma_7d || item.cnt),
  }));

  const categoryChartData = categories.map((item: any, index: number) => ({
    label:
      item.category?.charAt(0) + item.category?.slice(1).toLowerCase() ||
      "Unknown",
    value: parseInt(item.cnt),
    color: CATEGORY_COLORS[item.category] || COLORS[index % COLORS.length],
  }));

  const crimeHourChartData = crimeByHour.map((item: any) => ({
    hour: `${item.hour_of_day}:00`,
    crimes: parseInt(item.cnt),
  }));

  const divisionChartData = divisions.map((item: any) => ({
    division: item.division || "Unknown",
    crimes: parseInt(item.cnt),
  }));

  const dayOfWeekChartData = dayOfWeek.map((item: any) => ({
    day: item.day_name?.trim() || "Unknown",
    crimes: parseInt(item.cnt),
  }));

  const recentActivityChartData = recentActivity
    .slice(0, 14)
    .reverse()
    .map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      crimes: parseInt(item.cnt),
    }));

  const totalCrimes = categories.reduce(
    (sum: number, item: { cnt: string }) => sum + parseInt(item.cnt),
    0
  );
  const mostCommonCrime = categories[0]?.category || "N/A";
  const topHotspot = hotspots[0]?.district || "N/A";

  // Create timeline data from trend data - group by weeks and calculate trends
  const timelineData = (() => {
    if (!trends.length) return [];

    // Group by weeks and calculate metrics
    const weeklyData: { [key: string]: number[] } = {};

    trends.forEach((item: any) => {
      const date = new Date(item.day);
      const weekStart = new Date(date);

      weekStart.setDate(date.getDate() - date.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(parseInt(item.cnt));
    });

    // Convert to timeline format with trends
    const weeks = Object.keys(weeklyData).sort().slice(-8); // Last 8 weeks

    return weeks.map((week, index) => {
      const crimes = weeklyData[week];
      const avgCrimes = crimes.reduce((a, b) => a + b, 0) / crimes.length;

      // Calculate trend compared to previous week
      let trend: "up" | "down" | "stable" = "stable";

      if (index > 0) {
        const prevCrimes = weeklyData[weeks[index - 1]];
        const prevAvg =
          prevCrimes.reduce((a, b) => a + b, 0) / prevCrimes.length;
        const change = ((avgCrimes - prevAvg) / prevAvg) * 100;

        if (change > 10) trend = "up";
        else if (change < -10) trend = "down";
      }

      // Calculate intensity (0-1 scale based on all weeks)
      const allAverages = weeks.map(
        (w) => weeklyData[w].reduce((a, b) => a + b, 0) / weeklyData[w].length
      );
      const maxAvg = Math.max(...allAverages);
      const minAvg = Math.min(...allAverages);
      const intensity =
        maxAvg === minAvg ? 0.5 : (avgCrimes - minAvg) / (maxAvg - minAvg);

      return {
        period: `Week ${index + 1}`,
        crimes: Math.round(avgCrimes),
        trend,
        intensity: Math.max(0.1, Math.min(1, intensity)), // Clamp between 0.1 and 1
      };
    });
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            Crime Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Real-time insights and patterns from reported crimes across
            Bangladesh
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
            <CardBody className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    Total Reports
                  </p>
                  <p className="text-4xl font-bold">{totalCrimes}</p>
                  <p className="text-blue-100 text-xs mt-2">
                    +{recentActivity.length} in last 14 days
                  </p>
                </div>
                <div className="text-6xl opacity-20">📈</div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600">
            <CardBody className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">
                    Most Common Crime
                  </p>
                  <p className="text-3xl font-bold capitalize">
                    {mostCommonCrime.toLowerCase()}
                  </p>
                  <p className="text-orange-100 text-xs mt-2">
                    {categories[0]?.cnt} reported cases
                  </p>
                </div>
                <div className="text-6xl opacity-20">🚨</div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600">
            <CardBody className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Top Crime Hotspot
                  </p>
                  <p className="text-3xl font-bold">{topHotspot}</p>
                  <p className="text-purple-100 text-xs mt-2">
                    {hotspots[0]?.cnt} reported incidents
                  </p>
                </div>
                <div className="text-6xl opacity-20">📍</div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs for Different Views */}
        <Tabs
          className="mb-6"
          selectedKey={selectedTab}
          size="lg"
          variant="underlined"
          onSelectionChange={(key) => setSelectedTab(key as string)}
        >
          <Tab key="overview" title="📊 Overview" />
          <Tab key="trends" title="📈 Trends" />
          <Tab key="geographic" title="🗺️ Geographic" />
          <Tab key="temporal" title="⏰ Temporal" />
          <Tab key="polar" title="🎯 Polar Analytics" />
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crime Category Distribution - Enhanced Pie Chart */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">
                    Crime Category Distribution
                  </h2>
                  <p className="text-sm text-gray-500">
                    Breakdown by crime type
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ParentSize>
                  {({ width }) => (
                    <EnhancedPieChart
                      data={categoryChartData}
                      height={400}
                      width={width}
                    />
                  )}
                </ParentSize>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {categoryChartData.map(
                    (
                      cat: {
                        color: any;
                        label:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<AwaitedReactNode>
                          | null
                          | undefined;
                        value:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<AwaitedReactNode>
                          | null
                          | undefined;
                      },
                      i: Key | null | undefined
                    ) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {cat.label}: {cat.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Crime by Hour of Day */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">Most Dangerous Hours</h2>
                  <p className="text-sm text-gray-500">
                    Crimes by hour of day (last 60 days)
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ResponsiveContainer height={400} width="100%">
                  <LineChart data={crimeHourChartData}>
                    <CartesianGrid opacity={0.1} strokeDasharray="3 3" />
                    <XAxis dataKey="hour" fontSize={12} stroke="currentColor" />
                    <YAxis fontSize={12} stroke="currentColor" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Line
                      activeDot={{ r: 6 }}
                      dataKey="crimes"
                      dot={{ r: 4 }}
                      stroke="#FF8042"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Peak Hour:</strong>{" "}
                    {crimeHourChartData.length > 0
                      ? crimeHourChartData.reduce((max: any, item: any) =>
                          item.crimes > max.crimes ? item : max
                        ).hour
                      : "N/A"}{" "}
                    with{" "}
                    {crimeHourChartData.length > 0
                      ? crimeHourChartData.reduce((max: any, item: any) =>
                          item.crimes > max.crimes ? item : max
                        ).crimes
                      : 0}{" "}
                    crimes
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Crime Activity Timeline - Shows patterns across time periods */}
            {/* <Card className="lg:col-span-2">
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">Crime Activity Timeline</h2>
                  <p className="text-sm text-gray-500">
                    Crime reporting patterns across different time periods with
                    trend analysis
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ParentSize>
                  {({ width }) => (
                    <CrimeActivityTimeline
                      data={timelineData}
                      height={450}
                      width={width}
                    />
                  )}
                </ParentSize>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Insight:</strong> This timeline shows crime activity
                    patterns with trend indicators. Darker bars indicate higher
                    intensity periods. 📈 = increasing trend, 📉 = decreasing
                    trend, ➡️ = stable.
                  </p>
                </div>
              </CardBody>
            </Card> */}
          </div>
        )}

        {/* Trends Tab */}
        {selectedTab === "trends" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Crime Trends Over Time */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">
                    Crime Trends (Last 90 Days)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Daily reports with 7-day moving average
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ResponsiveContainer height={400} width="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient
                        id="colorCrimes"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FF8042"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FF8042"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid opacity={0.1} strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} stroke="currentColor" />
                    <YAxis fontSize={12} stroke="currentColor" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Legend />
                    <Area
                      dataKey="crimes"
                      fill="url(#colorCrimes)"
                      fillOpacity={1}
                      name="Daily Reports"
                      stroke="#FF8042"
                      type="monotone"
                    />
                    <Line
                      dataKey="movingAvg"
                      dot={false}
                      name="7-Day Average"
                      stroke="#0088FE"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">
                    Recent Activity (14 Days)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Daily crime reports trend
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ResponsiveContainer height={300} width="100%">
                  <LineChart data={recentActivityChartData}>
                    <CartesianGrid opacity={0.1} strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} stroke="currentColor" />
                    <YAxis fontSize={12} stroke="currentColor" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Line
                      activeDot={{ r: 7 }}
                      dataKey="crimes"
                      dot={{ r: 5 }}
                      stroke="#8884D8"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Geographic Tab */}
        {selectedTab === "geographic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Division Statistics */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">Division Statistics</h2>
                  <p className="text-sm text-gray-500">
                    Crime distribution across divisions
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ParentSize>
                  {({ width }) => (
                    <EnhancedBarChart
                      data={divisionChartData.map(
                        (d: { division: any; crimes: any }) => ({
                          label: d.division,
                          value: d.crimes,
                          color: "#00C49F",
                        })
                      )}
                      height={400}
                      width={width}
                    />
                  )}
                </ParentSize>
              </CardBody>
            </Card>

            {/* District Hotspots with Categories */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">District Crime Details</h2>
                  <p className="text-sm text-gray-500">
                    Top districts with crime category breakdown
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotspots.slice(0, 10).map((district: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">
                          {district.district}
                        </h3>
                        <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-bold">
                          {district.cnt} crimes
                        </span>
                      </div>
                      {district.top_categories && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {district.top_categories.map(
                            (cat: string, j: number) => (
                              <span
                                key={j}
                                className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-gray-300 dark:border-gray-600"
                              >
                                {cat}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Polar Analytics Tab */}
        {selectedTab === "polar" && (
          <div className="grid grid-cols-1 gap-6">
            <PolarHeatmap />
          </div>
        )}

        {/* Temporal Tab */}
        {selectedTab === "temporal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Day of Week Analysis */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">Crimes by Day of Week</h2>
                  <p className="text-sm text-gray-500">
                    Weekly pattern analysis
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ResponsiveContainer height={350} width="100%">
                  <RadarChart data={dayOfWeekChartData}>
                    <PolarGrid stroke="rgba(128,128,128,0.3)" />
                    <PolarAngleAxis
                      dataKey="day"
                      fontSize={12}
                      stroke="currentColor"
                    />
                    <PolarRadiusAxis fontSize={11} stroke="currentColor" />
                    <Radar
                      dataKey="crimes"
                      fill="#8884D8"
                      fillOpacity={0.6}
                      name="Crime Count"
                      stroke="#8884D8"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Day of Week Bar Chart */}
            <Card>
              <CardHeader className="pb-0">
                <div>
                  <h2 className="text-xl font-bold">
                    Weekly Crime Distribution
                  </h2>
                  <p className="text-sm text-gray-500">Reports by day</p>
                </div>
              </CardHeader>
              <CardBody className="pt-4">
                <ParentSize>
                  {({ width }) => (
                    <EnhancedBarChart
                      data={dayOfWeekChartData.map(
                        (d: { day: any; crimes: any }) => ({
                          label: d.day,
                          value: d.crimes,
                          color: "#8884D8",
                        })
                      )}
                      height={350}
                      width={width}
                    />
                  )}
                </ParentSize>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
