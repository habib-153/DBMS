"use client";

import PostManagementTable from "@/src/components/modules/dashboard/PostManagementTable";

const PostManagementPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a50034] to-pink-600 bg-clip-text text-transparent">
          Post Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Review, approve, reject, and manage all posts
        </p>
      </div>

      {/* Post Management Table */}
      <PostManagementTable />
    </div>
  );
};

export default PostManagementPage;
