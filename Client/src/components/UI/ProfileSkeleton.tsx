import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Tab, Tabs } from "@heroui/tabs";
import { BookOpen, Users } from "lucide-react";

const ProfileSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Skeleton */}
          <div className="md:w-1/4">
            <Skeleton className="rounded-full w-24 h-24" />
          </div>

          {/* Profile Info Skeleton */}
          <div className="md:w-2/3 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="w-48 h-8 rounded-lg" />
                <Skeleton className="w-36 h-4 rounded-lg" />
              </div>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center space-y-1">
                    <Skeleton className="w-16 h-6 rounded-lg" />
                    <Skeleton className="w-12 h-4 rounded-lg" />
                  </div>
                ))}
              </div>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Tabs>
          <Tab
            key="posts"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Posts</span>
              </div>
            }
          />
          <Tab
            key="followers"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Followers</span>
              </div>
            }
          />
          <Tab
            key="following"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Following</span>
              </div>
            }
          />
        </Tabs>

        {/* Skeleton Grid for Posts/Followers/Following */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="rounded-full w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4 rounded-lg" />
                  <Skeleton className="w-1/2 h-4 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;