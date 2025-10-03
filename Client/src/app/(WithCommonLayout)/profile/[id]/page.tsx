"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { BadgeCheck, BookOpen, Users } from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { Chip } from "@heroui/chip";

import { useGetAllPosts } from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import { IUser } from "@/src/types";
import { useGetSingleUser } from "@/src/hooks/user.hook";
import ProfileSkeleton from "@/src/components/UI/ProfileSkeleton";
import PostCard from "@/src/components/modules/Posts/PostCard";
import { transformPostsData } from "@/src/utils/transformPostData";

const UserProfile = () => {
  const { id } = useParams();
  const { data: userData, isLoading } = useGetSingleUser(id as string);

  const {
    name,
    email,
    profilePhoto,
    status,
    isVerified,
    followers,
    following,
  } = (userData?.data as IUser) || {};
  const [activeTab, setActiveTab] = useState("posts");

  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...{ authorEmail: email },
  }).toString()}`;

  const { data: postData, isLoading: isLoadingPosts } = useGetAllPosts(apiUrl);
  const posts = postData?.data ? transformPostsData(postData.data) : [];

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardBody className="p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4 mx-auto lg:mx-0">
              <div className="relative">
                <Avatar
                  isBordered
                  className="w-40 h-40"
                  color={status === "PREMIUM" ? "warning" : "danger"}
                  src={profilePhoto}
                />
                <Chip
                  className="absolute -top-2 -right-2"
                  color={status === "PREMIUM" ? "warning" : "danger"}
                  size="sm"
                  variant="shadow"
                >
                  {status}
                </Chip>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Name and Email */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{name}</h1>
                  {isVerified && (
                    <BadgeCheck className="w-7 h-7 text-brand-primary" />
                  )}
                </div>
                <p className="text-gray-500 text-lg">{email}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <button
                  className="text-center hover:opacity-80 transition-opacity"
                  onClick={() => setActiveTab("posts")}
                >
                  <p className="text-2xl font-bold text-brand-primary">
                    {posts.length}
                  </p>
                  <p className="text-gray-500 text-sm">Posts</p>
                </button>
                <button
                  className="text-center hover:opacity-80 transition-opacity"
                  onClick={() => setActiveTab("followers")}
                >
                  <p className="text-2xl font-bold text-brand-primary">
                    {followers?.length || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Followers</p>
                </button>
                <button
                  className="text-center hover:opacity-80 transition-opacity"
                  onClick={() => setActiveTab("following")}
                >
                  <p className="text-2xl font-bold text-brand-primary">
                    {following?.length || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Following</p>
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs Section - Centered */}
      <div className="flex justify-center mb-6">
        <Tabs
          classNames={{
            base: "w-full max-w-md",
            tabList: "bg-default-100 p-1 rounded-lg",
            tab: "data-[selected=true]:bg-brand-primary data-[selected=true]:text-white",
            cursor: "bg-brand-primary",
            tabContent: "group-data-[selected=true]:text-white",
          }}
          selectedKey={activeTab}
          size="lg"
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab
            key="posts"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">Posts</span>
              </div>
            }
          />
          <Tab
            key="followers"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Followers</span>
              </div>
            }
          />
          <Tab
            key="following"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Following</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "posts" && (
          <>
            {isLoadingPosts ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-96 animate-pulse" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post: any, index: number) => (
                  <PostCard
                    key={post.id || index}
                    isVoting={false}
                    post={post}
                    onVote={async () => {}}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Posts Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    This user hasn&apos;t shared any crime reports yet.
                  </p>
                </CardBody>
              </Card>
            )}
          </>
        )}

        {activeTab === "followers" && (
          <>
            {followers && followers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower, index) => (
                  <Card
                    key={follower?.id || index}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-brand-primary"
                  >
                    <CardBody className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar
                          isBordered
                          className="w-16 h-16 ring-2 ring-brand-primary/20"
                          color="danger"
                          src={follower?.profilePhoto}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg flex gap-2 items-center">
                            <span className="truncate">{follower?.name}</span>
                            {follower?.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {follower?.email}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Followers Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    This user doesn&apos;t have any followers yet.
                  </p>
                </CardBody>
              </Card>
            )}
          </>
        )}

        {activeTab === "following" && (
          <>
            {following && following.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((followedUser, index) => (
                  <Card
                    key={followedUser?.id || index}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-brand-primary"
                  >
                    <CardBody className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar
                          isBordered
                          className="w-16 h-16 ring-2 ring-brand-primary/20"
                          color="danger"
                          src={followedUser?.profilePhoto}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg flex gap-2 items-center">
                            <span className="truncate">
                              {followedUser?.name}
                            </span>
                            {followedUser?.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {followedUser?.email}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Not Following Anyone
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    This user isn&apos;t following anyone yet.
                  </p>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
