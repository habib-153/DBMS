"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Eye } from "lucide-react";

import PostCard from "./PostCard";

import { IPost } from "@/src/types/post.types";

interface PostGridProps {
  posts: IPost[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onVote: (postId: string, voteType: "up" | "down") => Promise<void>;
  userId?: string;
  isVoting: boolean;
  onClearFilters?: () => void;
}

const LoadingSkeleton = () => (
  <Card className="w-full h-full">
    <CardBody className="p-0 h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48 rounded-t-xl" />

      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-20 h-2 rounded" />
          </div>
        </div>

        {/* Title */}
        <Skeleton className="w-3/4 h-4 rounded" />

        {/* Description */}
        <div className="space-y-2 flex-1">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-2/3 h-3 rounded" />
        </div>

        {/* Footer */}
        <div className="space-y-3 mt-auto">
          <Skeleton className="w-32 h-3 rounded" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-7 rounded" />
              <Skeleton className="w-6 h-4 rounded" />
              <Skeleton className="w-8 h-7 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <LoadingSkeleton key={index} />
    ))}
  </div>
);

const EmptyState = ({ onClearFilters }: { onClearFilters?: () => void }) => (
  <Card>
    <CardBody className="text-center py-12">
      <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
        No reports found
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {onClearFilters
          ? "Try adjusting your filters or search terms."
          : "Be the first to report a crime incident in your area."}
      </p>
      {onClearFilters && (
        <button
          className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
          onClick={onClearFilters}
        >
          Clear all filters
        </button>
      )}
    </CardBody>
  </Card>
);

export default function PostGrid({
  posts,
  isLoading,
  hasMore,
  onLoadMore,
  onVote,
  userId,
  isVoting,
  onClearFilters,
}: PostGridProps) {
  if (isLoading && posts.length === 0) {
    return <LoadingGrid />;
  }

  if (posts.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <InfiniteScroll
      dataLength={posts.length}
      endMessage={
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            🎉 You&apos;ve seen all the latest reports
          </p>
        </div>
      }
      hasMore={hasMore}
      loader={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      }
      next={onLoadMore}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            isVoting={isVoting}
            post={post}
            userId={userId}
            onVote={onVote}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}