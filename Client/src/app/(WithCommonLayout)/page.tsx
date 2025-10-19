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
import { MotionDiv } from "@/src/components/motion-components";

export default function HomePage() {
  const { user } = useUser();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openCreatePostModal, setOpenCreatePostModal] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);

  // Build API URL for recent posts (5 most recent by crime date)
  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    sortBy: "crimeDate",
    sortOrder: "desc",
    page: "1",
    limit: "5",
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial="hidden"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Hero Section */}
        <MotionDiv variants={itemVariants}>
          <HeroSection onRegisterClick={handleRegisterClick} />
        </MotionDiv>

        {/* Main Content Grid */}
        <MotionDiv
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={itemVariants}
        >
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
          <MotionDiv className="space-y-6" variants={floatingVariants}>
            <MotionDiv
              animate="animate"
              variants={floatingVariants}
              whileHover={{ scale: 1.02 }}
            >
              <CrimeHeatmap />
            </MotionDiv>
            <MotionDiv
              animate="animate"
              style={{ animationDelay: "1s" }}
              variants={floatingVariants}
              whileHover={{ scale: 1.02 }}
            >
              <EmergencyContacts />
            </MotionDiv>
          </MotionDiv>
        </MotionDiv>
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
    </MotionDiv>
  );
}
