"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tab, Tabs } from "@heroui/tabs";
import { BadgeCheck, BookOpen, Edit, KeySquare, Users } from "lucide-react";
import { useState } from "react";

import { IPost, IUser } from "@/src/types";
import { useGetAllPosts } from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import PostCard from "@/src/components/UI/PostCard";
import VerifyModal from "@/src/components/UI/modal/ProfileVerify/ProfileVerify";
import UpdateProfileModal from "@/src/components/UI/modal/ProfileVerify/UpdateProfileModal";
import { useFollowUser, useUnfollowUser } from "@/src/hooks/user.hook";
import ChangePassword from "@/src/components/UI/modal/ProfileVerify/ChangePassword";

const ProfilePage = ({ user }: { user: IUser }) => {
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openVerifyProfileModal, setOpenVerifyProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const { mutate: followUser } = useFollowUser();
  const { mutate: unFollowUser } = useUnfollowUser();

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

  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...{ searchTerm: email },
  }).toString()}`;

  const { data: postData } = useGetAllPosts(apiUrl);
  const posts = postData?.data;

  const isFollowing = (followerId: string) => {
    return following?.some((followedUser) => followeduser.id === followerId);
  };

  const handleFollow = (id: string, name: string) => {
    followUser({ id, name });
  };

  const handleUnFollow = (id: string, name: string) => {
    unFollowUser({ id, name });
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="md:w-1/4">
            <div className="relative w-36 mx-auto">
              <Avatar
                className="w-full my-auto h-full aspect-square"
                imgProps={{
                  className: "object-cover h-full",
                }}
                src={profilePhoto}
              />
              <Chip
                className="absolute top-0 -right-3"
                color={status === "PREMIUM" ? "warning" : "primary"}
                variant="shadow"
              >
                {status}
              </Chip>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="md:w-2/3 mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{name}</h1>
                    {isVerified && (
                      <BadgeCheck className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <p className="text-gray-500">{email}</p>
                </div>
                <div>
                  <Button
                    color="primary"
                    startContent={<Edit className="w-4 h-4" />}
                    variant="bordered"
                    onPress={() => setOpenEditProfileModal(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {posts ? posts.length : 0}
                </p>
                <p className="text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {followers?.length || 0}
                </p>
                <p className="text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">
                  {following?.length || 0}
                </p>
                <p className="text-gray-500">Following</p>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col items-center justify-center gap-5 ">
            <Button
              color="primary"
              startContent={<KeySquare className="w-4 h-4" />}
              variant="bordered"
              onPress={() => setOpenChangePasswordModal(true)}
            >
              Change Password
            </Button>
            {!isVerified && totalUpVotes >= 1 && (
              <Button
                color="primary"
                startContent={<BadgeCheck className="w-4 h-4" />}
                variant="flat"
                onPress={() => setOpenVerifyProfileModal(true)}
              >
                Get Verified
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab
            key="posts"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Posts</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {posts?.map((post: IPost, index: number) => (
                <PostCard key={index} full={false} post={post} />
              ))}
            </div>
          </Tab>
          <Tab
            key="followers"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Followers</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {followers?.map((follower, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" src={follower?.profilePhoto} />
                    <div>
                      <p className="font-semibold flex gap-2 items-center">
                        {follower?.name}

                        {isVerified && (
                          <BadgeCheck className="w-6 h-6 text-primary" />
                        )}
                      </p>
                      {!isFollowing(follower?._id) && (
                        <Button
                          color="primary"
                          size="sm"
                          variant="flat"
                          onClick={() =>
                            handleFollow(
                              follower?._id as string,
                              follower?.name as string
                            )
                          }
                        >
                          Follow Back
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>
          <Tab
            key="following"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Following</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {following?.map((followedUser, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" src={followedUser?.profilePhoto} />
                    <div className="space-y-1">
                      <p className="font-semibold flex gap-2 items-center">
                        {followedUser?.name}
                        {isVerified && (
                          <BadgeCheck className="w-6 h-6 text-primary" />
                        )}
                      </p>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() =>
                          handleUnFollow(
                            followedUser?._id as string,
                            followedUser?.name as string
                          )
                        }
                      >
                        Unfollow
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>

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
