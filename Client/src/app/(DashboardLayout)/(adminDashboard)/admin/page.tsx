"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Users,
  FileText,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";

import { useGetAdminStats } from "@/src/hooks/admin.hook";

const AdminDashboard = () => {
  const { data: statsData, isLoading } = useGetAdminStats();
  const stats = statsData?.data;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-6">
                <div className="h-24" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Users",
      value: stats?.users?.active || 0,
      icon: <UserCheck className="w-6 h-6" />,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgLight: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Blocked Users",
      value: stats?.users?.blocked || 0,
      icon: <XCircle className="w-6 h-6" />,
      color: "bg-red-500",
      textColor: "text-red-500",
      bgLight: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Verified Users",
      value: stats?.users?.verified || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-[#a50034]",
      textColor: "text-[#a50034]",
      bgLight: "bg-pink-50 dark:bg-pink-950",
    },
    {
      title: "Total Posts",
      value: stats?.posts?.total || 0,
      icon: <FileText className="w-6 h-6" />,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Pending Posts",
      value: stats?.posts?.pending || 0,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgLight: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Approved Posts",
      value: stats?.posts?.approved || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Admin Users",
      value: stats?.users?.admins || 0,
      icon: <Shield className="w-6 h-6" />,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      bgLight: "bg-indigo-50 dark:bg-indigo-950",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a50034] to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your platform statistics
          </p>
        </div>
        <Chip
          className="bg-[#a50034] text-white"
          startContent={<TrendingUp className="w-4 h-4" />}
        >
          Live Stats
        </Chip>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="border-2 border-gray-200 dark:border-gray-700 hover:border-[#a50034] transition-all duration-300 hover:shadow-lg"
          >
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#a50034]" />
            Recent Activity (Last 7 Days)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New Users
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.recentActivity?.newUsers || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New Posts
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.recentActivity?.newPosts || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New Votes
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.recentActivity?.newVotes || 0}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top Locations */}
      {stats?.topLocations && stats.topLocations.length > 0 && (
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold mb-4">Top Crime Locations</h2>
            <div className="space-y-3">
              {stats.topLocations.map((location: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium">{location.location}</span>
                  <Chip className="bg-[#a50034] text-white" size="sm">
                    {location.count} reports
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
