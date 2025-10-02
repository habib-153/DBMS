"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tab, Tabs } from "@heroui/tabs";
import {
  BadgeCheck,
  BookOpen,
  Edit,
  KeySquare,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { IUser } from "@/src/types";
import { IPost } from "@/src/types/post.types";
import { useGetAllPosts } from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import VerifyModal from "@/src/components/UI/modal/ProfileVerify/ProfileVerify";
import UpdateProfileModal from "@/src/components/UI/modal/ProfileVerify/UpdateProfileModal";
import { useFollowUser, useUnfollowUser } from "@/src/hooks/user.hook";
import ChangePassword from "@/src/components/UI/modal/ProfileVerify/ChangePassword";
import { PostCard } from "@/src/components/modules/Posts";
import { transformPostsData } from "@/src/utils/transformPostData";

const ProfilePage = ({ user }: { user: IUser }) => {
  const router = useRouter();
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openVerifyProfileModal, setOpenVerifyProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unFollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const {
    name,
    email,
    profilePhoto,
    status,
    isVerified,
    followers,
    following,
    totalUpVotes,
  } = user as IUser;
  console.log("user data in profile page:", user);

  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...{ authorEmail: email },
  }).toString()}`;

  const { data: postData, isLoading: isLoadingPosts } = useGetAllPosts(apiUrl);

  // Transform backend data to match frontend structure
  const posts = postData?.data ? transformPostsData(postData.data) : [];

  const isFollowingUser = (followerId: string) => {
    return following?.some((followedUser) => followedUser.id === followerId);
  };

  const handleFollow = (id: string, name: string) => {
    followUser({ id, name });
  };

  const handleUnFollow = (id: string, name: string) => {
    unFollowUser({ id, name });
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                  startContent={<Edit className="w-4 h-4" />}
                  variant="bordered"
                  onPress={() => setOpenEditProfileModal(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                  startContent={<KeySquare className="w-4 h-4" />}
                  variant="flat"
                  onPress={() => setOpenChangePasswordModal(true)}
                >
                  Change Password
                </Button>
                {!isVerified && totalUpVotes >= 1 && (
                  <Button
                    className="bg-brand-gradient text-white shadow-lg hover:shadow-xl transition-all"
                    startContent={<BadgeCheck className="w-4 h-4" />}
                    onPress={() => setOpenVerifyProfileModal(true)}
                  >
                    Get Verified
                  </Button>
                )}
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
                {posts.map((post: IPost, index: number) => (
                  <PostCard
                    key={post.id || index}
                    isVoting={false}
                    post={post}
                    userId={user?.id}
                    onVote={() => Promise.resolve()}
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
                    Start sharing your crime reports with the community.
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
                    isPressable
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-brand-primary"
                  >
                    <CardBody className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar
                          isBordered
                          className="w-16 h-16 cursor-pointer ring-2 ring-brand-primary/20"
                          color="danger"
                          src={follower?.profilePhoto}
                          onClick={() => handleUserClick(follower?.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <button
                            className="font-semibold text-lg flex gap-2 items-center hover:text-brand-primary transition-colors text-left"
                            onClick={() => handleUserClick(follower?.id)}
                          >
                            <span className="truncate">{follower?.name}</span>
                            {follower?.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                            )}
                          </button>
                          <p className="text-sm text-gray-500 truncate">
                            {follower?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        {!isFollowingUser(follower?.id) ? (
                          <Button
                            className="w-full bg-brand-primary text-white hover:bg-brand-secondary transition-colors"
                            isLoading={isFollowing}
                            size="sm"
                            startContent={
                              !isFollowing && <UserPlus className="w-4 h-4" />
                            }
                            onClick={() =>
                              handleFollow(
                                follower?.id as string,
                                follower?.name as string
                              )
                            }
                          >
                            Follow Back
                          </Button>
                        ) : (
                          <Button
                            isDisabled
                            className="w-full bg-green-100 text-green-700"
                            size="sm"
                            startContent={<BadgeCheck className="w-4 h-4" />}
                          >
                            Following
                          </Button>
                        )}
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
                    Share interesting content to gain followers.
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
                    isPressable
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-brand-primary"
                  >
                    <CardBody className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar
                          isBordered
                          className="w-16 h-16 cursor-pointer ring-2 ring-brand-primary/20"
                          color="danger"
                          src={followedUser?.profilePhoto}
                          onClick={() => handleUserClick(followedUser?.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <button
                            className="font-semibold text-lg flex gap-2 items-center hover:text-brand-primary transition-colors text-left"
                            onClick={() => handleUserClick(followedUser?.id)}
                          >
                            <span className="truncate">
                              {followedUser?.name}
                            </span>
                            {followedUser?.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                            )}
                          </button>
                          <p className="text-sm text-gray-500 truncate">
                            {followedUser?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          className="w-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                          isLoading={isUnfollowing}
                          size="sm"
                          startContent={
                            !isUnfollowing && <UserMinus className="w-4 h-4" />
                          }
                          onClick={() =>
                            handleUnFollow(
                              followedUser?.id as string,
                              followedUser?.name as string
                            )
                          }
                        >
                          Unfollow
                        </Button>
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
                    Discover and follow users to see their content here.
                  </p>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {openEditProfileModal && (
        <UpdateProfileModal
          isOpen={openEditProfileModal}
          user={user}
          onOpenChange={setOpenEditProfileModal}
        />
      )}
      {openChangePasswordModal && (
        <ChangePassword
          isOpen={openChangePasswordModal}
          onOpenChange={setOpenChangePasswordModal}
        />
      )}
      {openVerifyProfileModal && (
        <VerifyModal
          isOpen={openVerifyProfileModal}
          onOpenChange={setOpenVerifyProfileModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;
