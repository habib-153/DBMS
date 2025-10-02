"use client";

import { Card, CardBody, Avatar, Chip, Button } from "@heroui/react";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { IPost } from "@/src/types/post.types";
import { FollowButton } from "@/src/components/modules/Shared";

interface PostCardProps {
  post: IPost;
  onVote: (postId: string, voteType: "up" | "down") => Promise<void>;
  userId?: string;
  isVoting: boolean;
}

export default function PostCard({
  post,
  onVote,
  userId,
  isVoting,
}: PostCardProps) {
  const upVotes = post.votes?.filter((vote) => vote.type === "UP") || [];
  const downVotes = post.votes?.filter((vote) => vote.type === "DOWN") || [];
  const isUpvoted = upVotes.some((vote) => vote.userId === userId);
  const isDownvoted = downVotes.some((vote) => vote.userId === userId);
  const voteCount = upVotes.length - downVotes.length;

  const handleVote = async (voteType: "up" | "down") => {
    if (!userId) {
      toast.error("Please login to vote");

      return;
    }
    if (isVoting) return;

    try {
      await onVote(post.id, voteType);
    } catch (error) {
      toast.error("Failed to vote. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

      return format(date, "PPp");
    } catch {
      return "Recently";
    }
  };


  return (
    <Card className="w-full h-full hover:shadow-xl transition-all duration-300 border-1 border-gray-200 dark:border-gray-700 group">
      <CardBody className="p-0 h-full flex flex-col">
        {/* Image */}
        {post.image && (
          <div className="relative overflow-hidden rounded-t-xl h-48">
            <Image
              fill
              alt={post.title}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={post.image}
            />
            <div className="absolute top-3 right-3">
              <Chip
                className="backdrop-blur-md"
                color={getStatusColor(post.status)}
                size="sm"
                variant="flat"
              >
                {post.status}
              </Chip>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-2 mb-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar
                className="border-2 border-white shadow-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                name={post.author?.name}
                size="sm"
                src={post.author?.profilePhoto}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                className="hover:underline"
                href={`/profile/${post.author.id}`}
              >
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {post.author?.name}
                </p>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <FollowButton
                size="sm"
                userId={post.author.id}
                userName={post.author?.name || "User"}
                variant="light"
              />
            </div>
          </div>

          {/* Title */}
          <Link href={`/posts/${post.id}`}>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-2 hover:text-brand-primary transition-colors cursor-pointer">
              {post.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 flex-1 mb-3">
            {post.description}
          </p>

          {/* Footer */}
          <div className="space-y-3 mt-auto">
            {/* Location and Date Info */}
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                {post.location && (
                  <span className="truncate max-w-32">{post.location}</span>
                )}
                {post.crimeDate && (
                  <span>{format(new Date(post.crimeDate), "MMM dd")}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Vote Section */}
              <div className="flex items-center gap-1">
                <Button
                  className={`min-w-8 h-7 px-2 ${
                    isUpvoted
                      ? "text-white bg-brand-primary"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  } transition-colors`}
                  isDisabled={isVoting}
                  size="sm"
                  startContent={<ThumbsUp size={14} />}
                  variant="flat"
                  onClick={() => handleVote("up")}
                />

                <span
                  className={`font-bold text-sm px-2 ${
                    voteCount > 0
                      ? "text-emerald-600"
                      : voteCount < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {voteCount}
                </span>

                <Button
                  className={`min-w-8 h-7 px-2 ${
                    isDownvoted
                      ? "text-white bg-red-500"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  } transition-colors`}
                  isDisabled={isVoting}
                  size="sm"
                  startContent={<ThumbsDown size={14} />}
                  variant="flat"
                  onClick={() => handleVote("down")}
                />
              </div>

              {/* Share and View */}
              <div className="flex items-center gap-2">
                <Button
                  className="min-w-8 h-7 px-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-brand-primary hover:text-white transition-colors"
                  size="sm"
                  startContent={<Eye size={14} />}
                  variant="flat"
                >
                  <Link href={`/posts/${post.id}`}>View</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
