"use client";

import { Card, CardBody, Chip, Avatar, Button } from "@heroui/react";
import { MapPin, Calendar, Eye, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import PostFilters from "../Posts/PostFilters";
import CreatePostModal from "../../UI/modal/CreatePost/CreatePostModal";
import AuthModal from "../../UI/modal/AuthModal/AuthModal";

import { IPost } from "@/src/types/post.types";
import { useUser } from "@/src/context/user.provider";

interface RecentCrimeReportsProps {
  posts: IPost[];
  isLoading: boolean;
  showFilters?: boolean;
  showCreateButton?: boolean;
}

const CrimeReportCard = ({ post }: { post: IPost }) => {
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
    <Card className="hover:shadow-lg h-40 transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <CardBody className="p-0">
        <div className="flex">
          {/* Image */}
          {post.image && (
            <div className="relative w-32 h-[156px] flex-shrink-0 overflow-hidden rounded-l-lg">
              <Image
                fill
                alt={post.title}
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 128px, 128px"
                src={post.image}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                {post.title}
              </h3>
              <Chip
                color={getStatusColor(post.status)}
                size="sm"
                variant="flat"
              >
                {post.status}
              </Chip>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {post.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Avatar
                    className="w-5 h-5"
                    name={post.author?.name}
                    size="sm"
                    src={post.author?.profilePhoto}
                  />
                  <span>Posted by {post.author?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>

              <Link
                className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                href={`/posts/${post.id}`}
              >
                View Details
              </Link>
            </div>

            {post.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{post.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <>
    {[1, 2, 3].map((index) => (
      <Card key={index} className="border border-gray-200 dark:border-gray-700">
        <CardBody className="p-0">
          <div className="flex">
            <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-l-lg" />
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    ))}
  </>
);

export default function RecentCrimeReports({
  posts,
  isLoading,
  showFilters = false,
  showCreateButton = false,
}: RecentCrimeReportsProps) {
  const { user } = useUser();
  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);

  // Filter states (for when showFilters is true)
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const recentPosts = posts.slice(0, 6); // Show only recent 6 posts

  const clearFilters = () => {
    setSearchInput("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSort("createdAt");
  };

  const handleCreatePost = () => {
    if (user) {
      setOpenModal(true);
    } else {
      setOpenAuthModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recent Crime Reports
        </h2>
        <div className="flex items-center gap-4">
          {showCreateButton && (
            <Button
              className="bg-brand-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
              size="sm"
              startContent={<Plus size={16} />}
              onClick={handleCreatePost}
            >
              Create Report
            </Button>
          )}
          <Link
            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            href="/posts"
          >
            View All Reports →
          </Link>
        </div>
      </div>

      {/* Filters - Only show if enabled */}
      {showFilters && (
        <PostFilters
          searchInput={searchInput}
          selectedDistrict={selectedDistrict}
          selectedDivision={selectedDivision}
          setSearchInput={setSearchInput}
          setSelectedDistrict={setSelectedDistrict}
          setSelectedDivision={setSelectedDivision}
          setSort={setSort}
          showCard={false}
          sort={sort}
          onClearFilters={clearFilters}
        />
      )}

      <div className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <CrimeReportCard key={post.id} post={post} />
          ))
        ) : (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardBody className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No Reports Available
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Be the first to report a crime incident in your area.
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal isOpen={openModal} setIsOpen={setOpenModal} />
      <AuthModal
        openAuthModal={openAuthModal}
        setOpenAuthModal={setOpenAuthModal}
      />
    </div>
  );
}
