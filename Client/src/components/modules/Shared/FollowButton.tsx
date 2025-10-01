"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";

import { useUser } from "@/src/context/user.provider";
import {
  useFollowUser,
  useUnfollowUser,
  useCheckFollowStatus,
} from "@/src/hooks/user.hook";

interface FollowButtonProps {
  userId: string;
  userName: string;
  size?: "sm" | "md" | "lg";
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  className?: string;
}

export default function FollowButton({
  userId,
  userName,
  size = "sm",
  variant = "solid",
  className = "",
}: FollowButtonProps) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !user || user.id === userId;
console.log(userId)
  const { data: followStatusData, refetch } = useCheckFollowStatus(userId);
  const { mutate: follow, isPending: isFollowing_Pending } = useFollowUser();
  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUser();

  useEffect(() => {
    if (followStatusData?.data?.isFollowing !== undefined) {
      setIsFollowing(followStatusData.data.isFollowing);
    }
  }, [followStatusData]);

  // Don't show button if user is viewing their own profile
  if (isOwnProfile) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (isFollowing) {
      unfollow(
        { id: userId, name: userName },
        {
          onSuccess: () => {
            setIsFollowing(false);
            refetch();
          },
        }
      );
    } else {
      follow(
        { id: userId, name: userName },
        {
          onSuccess: () => {
            setIsFollowing(true);
            refetch();
          },
        }
      );
    }
  };

  return (
    <Button
      className={className}
      color={isFollowing ? "default" : "primary"}
      isLoading={isFollowing_Pending || isUnfollowing}
      size={size}
      variant={variant}
      onPress={handleFollowToggle}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
