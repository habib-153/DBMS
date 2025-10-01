"use client";

import { useGetFollowStats } from "@/src/hooks/user.hook";

interface FollowStatsProps {
  userId: string;
  className?: string;
}

export default function FollowStats({
  userId,
  className = "",
}: FollowStatsProps) {
  const { data: followStats, isLoading } = useGetFollowStats(userId);

  if (isLoading) {
    return (
      <div className={`flex gap-4 ${className}`}>
        <div className="animate-pulse">
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  const stats = followStats?.data || { followers: 0, following: 0 };

  return (
    <div className={`flex gap-6 ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold">{stats.followers}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Followers
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold">{stats.following}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Following
        </span>
      </div>
    </div>
  );
}
