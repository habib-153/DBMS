"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Tabs, Tab } from "@heroui/tabs";
import Link from "next/link";

import { useGetFollowers, useGetFollowing } from "@/src/hooks/user.hook";

interface FollowListProps {
  userId: string;
  defaultTab?: "followers" | "following";
}

export default function FollowList({
  userId,
  defaultTab = "followers",
}: FollowListProps) {
  const [selected, setSelected] = useState(defaultTab);

  const { data: followersData, isLoading: loadingFollowers } =
    useGetFollowers(userId);
  const { data: followingData, isLoading: loadingFollowing } =
    useGetFollowing(userId);

  const followers = followersData?.data || [];
  const following = followingData?.data || [];

  const renderUserList = (users: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex justify-center p-8">
          <p className="text-gray-500">No users to display</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((user: any) => {
          const userData =
            selected === "followers"
              ? {
                  id: user.followerUserId,
                  name: user.followerName,
                  email: user.followerEmail,
                  photo: user.followerProfilePhoto,
                }
              : {
                  id: user.followingUserId,
                  name: user.followingName,
                  email: user.followingEmail,
                  photo: user.followingProfilePhoto,
                };

          return (
            <Card
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <CardBody>
                <Link href={`/profile/${userData.id}`}>
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={userData.name}
                      size="md"
                      src={userData.photo || "/default-avatar.png"}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{userData.name}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                </Link>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs
        fullWidth
        aria-label="Follow tabs"
        selectedKey={selected}
        onSelectionChange={(key) =>
          setSelected(key as "followers" | "following")
        }
      >
        <Tab key="followers" title={`Followers (${followers.length})`}>
          {renderUserList(followers, loadingFollowers)}
        </Tab>
        <Tab key="following" title={`Following (${following.length})`}>
          {renderUserList(following, loadingFollowing)}
        </Tab>
      </Tabs>
    </div>
  );
}
