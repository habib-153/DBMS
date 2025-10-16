"use client";
import ProfilePage from "./_profilePage/ProfilePage";

import ProfileSkeleton from "@/src/components/UI/ProfileSkeleton";
import { useGetMyProfile } from "@/src/hooks/auth.hook";

const Profile = () => {
  const { data } = useGetMyProfile()
  const profileData = data?.data

  return (
    <div className="">
       {profileData ? <ProfilePage user={profileData} /> : <ProfileSkeleton />}
    </div>
  );
};

export default Profile;