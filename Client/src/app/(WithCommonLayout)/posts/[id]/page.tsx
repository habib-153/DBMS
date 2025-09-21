"use client";
import { useParams } from "next/navigation";
import React from "react";

import { useGetSinglePost } from "@/src/hooks/post.hook";
import PostCardSkeleton from "@/src/components/UI/PostCardSkeleton";
import PostCard from "@/src/components/UI/PostCard";
import CommentSection from "@/src/components/modules/post/Comment";
import { useUser } from "@/src/context/user.provider";

const PostDetails = () => {
  const { id } = useParams();
  const { data, isLoading} = useGetSinglePost(id as string);
  const postData = data?.data;
  const { user } = useUser();

  return (
    <div>
      {isLoading ? (
        <PostCardSkeleton />
      ) : (
        <div>
          <PostCard full={true} post={postData} />
          {
            user ? <CommentSection postId={id as string} user={user} /> 
            : <div className="my-4 p-4 border border-gray-300 rounded-md text-center bg-gray-50">
            <p className="text-gray-700">
              You need to <a className="text-blue-500 underline" href="/login">login</a> to comment on this post.
            </p>
          </div>
          }
          
        </div>
      )}
    </div>
  );
};

export default PostDetails;
