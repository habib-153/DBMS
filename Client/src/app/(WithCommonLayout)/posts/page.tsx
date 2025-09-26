"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { toast } from "sonner";

import { useUser } from "@/src/context/user.provider";
import {
  useGetAllPosts,
  useAddUpVotePost,
  useAddDownVotePost,
  useRemoveUpVoteFromPost,
  useRemoveDownVoteFromPost,
} from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import CreatePostModal from "@/src/components/UI/modal/CreatePost/CreatePostModal";
import PostHeader from "@/src/components/modules/Posts/PostHeader";
import PostFilters from "@/src/components/modules/Posts/PostFilters";
import PostGrid from "@/src/components/modules/Posts/PostGrid";
import { IPost } from "@/src/types/post.types";

export default function PostsPage() {
  const { user } = useUser();

  // State
  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Voting hooks
  const { mutate: addUpvote } = useAddUpVotePost();
  const { mutate: removeUpvote } = useRemoveUpVoteFromPost();
  const { mutate: addDownvote } = useAddDownVotePost();
  const { mutate: removeDownvote } = useRemoveDownVoteFromPost();

  // Build API URL
  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
    ...(selectedDivision && { division: selectedDivision }),
    ...(selectedDistrict && { district: selectedDistrict }),
    ...(sort && { sortBy: sort, sortOrder: "desc" }),
    page: page.toString(),
    limit: "10",
  }).toString()}`;

  const { data: postData, isLoading, error } = useGetAllPosts(apiUrl);

  // Handle voting
  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!user?.id) {
      toast.error("Please login to vote");

      return;
    }

    setIsVoting(true);

    const post = posts.find((p) => p.id === postId);

    if (!post) return;

    const upVotes = post.votes?.filter((vote) => vote.type === "UP") || [];
    const downVotes = post.votes?.filter((vote) => vote.type === "DOWN") || [];
    const isUpvoted = upVotes.some((vote) => vote.userId === user.id);
    const isDownvoted = downVotes.some((vote) => vote.userId === user.id);

    try {
      if (voteType === "up") {
        if (isUpvoted) {
          removeUpvote({ id: postId });
        } else {
          addUpvote({ id: postId });
        }
      } else {
        if (isDownvoted) {
          removeDownvote({ id: postId });
        } else {
          addDownvote({ id: postId });
        }
      }
    } finally {
      setIsVoting(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Update posts when data changes
  useEffect(() => {
    if (postData?.data) {
      if (page === 1) {
        setPosts(postData.data);
      } else {
        setPosts((prev) => [...prev, ...postData.data]);
      }
      setHasMore(postData.data.length === 10);
    }
  }, [postData, page]);

  const clearFilters = () => {
    setSearchInput("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSort("createdAt");
    setPage(1);
  };

  const handleCreatePost = () => {
    if (user) {
      setOpenModal(true);
    } else {
      setOpenAuthModal(true);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Failed to load posts. Please try again later.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <PostHeader onCreatePost={handleCreatePost} />

      {/* Filters */}
      <PostFilters
        searchInput={searchInput}
        selectedDistrict={selectedDistrict}
        selectedDivision={selectedDivision}
        setSearchInput={setSearchInput}
        setSelectedDistrict={setSelectedDistrict}
        setSelectedDivision={setSelectedDivision}
        setSort={setSort}
        sort={sort}
        onClearFilters={clearFilters}
      />

      {/* Posts Grid */}
      <PostGrid
        hasMore={hasMore}
        isLoading={isLoading}
        isVoting={isVoting}
        posts={posts}
        userId={user?.id}
        onClearFilters={clearFilters}
        onLoadMore={() => setPage((prev) => prev + 1)}
        onVote={handleVote}
      />

      {/* Modals */}
      <AuthModal
        openAuthModal={openAuthModal}
        setOpenAuthModal={setOpenAuthModal}
      />
      <CreatePostModal isOpen={openModal} setIsOpen={setOpenModal} />
    </div>
  );
}
