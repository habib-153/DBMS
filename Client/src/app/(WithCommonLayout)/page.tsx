"use client";

import React, { useState, useEffect } from "react";

import { useUser } from "@/src/context/user.provider";
import { useGetAllPosts } from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import CreatePostModal from "@/src/components/UI/modal/CreatePost/CreatePostModal";
import { IPost } from "@/src/types/post.types";
import {
  HeroSection,
  RecentCrimeReports,
  CrimeHeatmap,
  EmergencyContacts,
} from "@/src/components/modules/Home";

export default function HomePage() {
  const { user } = useUser();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openCreatePostModal, setOpenCreatePostModal] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);

  // Build API URL for recent posts
  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    sortBy: "createdAt",
    sortOrder: "desc",
    page: "1",
    limit: "10",
  }).toString()}`;

  const { data: postData, isLoading } = useGetAllPosts(apiUrl);

  // Update posts when data changes
  useEffect(() => {
    if (postData?.data) {
      setPosts(postData.data);
    }
  }, [postData]);

  const handleRegisterClick = () => {
    if (!user) {
      setOpenAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Hero Section */}
        <HeroSection onRegisterClick={handleRegisterClick} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Recent Crime Reports */}
          <div className="lg:col-span-2">
            <RecentCrimeReports
              isLoading={isLoading}
              posts={posts}
              showCreateButton={true}
              showFilters={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CrimeHeatmap />
            <EmergencyContacts />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        openAuthModal={openAuthModal}
        setOpenAuthModal={setOpenAuthModal}
      />
      <CreatePostModal
        isOpen={openCreatePostModal}
        setIsOpen={setOpenCreatePostModal}
      />
    </div>
  );
}
