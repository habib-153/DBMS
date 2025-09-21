"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
} from "@nextui-org/react";
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Flame,
  ShieldCheck,
  Timer,
  Plus,
  X,
  LocateIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";

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
import { IPost } from "@/src/types/post.types";

const SortOptions = [
  { key: "createdAt", name: "Latest", icon: Timer },
  { key: "votes", name: "Most Upvoted", icon: Flame },
  { key: "verification", name: "Verification Score", icon: ShieldCheck },
];

const PostCard = ({
  post,
  onVote,
  userId,
  isVoting,
}: {
  post: IPost;
  onVote: (postId: string, voteType: "up" | "down") => Promise<void>;
  userId?: string;
  isVoting: boolean;
}) => {
  const upVotes = post.votes?.filter((vote) => vote.type === "UP") || [];
  const downVotes = post.votes?.filter((vote) => vote.type === "DOWN") || [];
  const isUpvoted = upVotes.some((vote) => vote.userId === userId);
  const isDownvoted = downVotes.some((vote) => vote.userId === userId);
  const voteCount = upVotes.length - downVotes.length;

  const handleVote = async (voteType: "up" | "down") => {
    if (!userId) {
      toast.error("Please login to vote");

      return;
    }
    if (isVoting) return;

    try {
      await onVote(post.id, voteType);
    } catch (error) {
      toast.error("Failed to vote. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full h-full hover:shadow-xl transition-all duration-300 border-1 border-gray-200 dark:border-gray-700 group">
      <CardBody className="p-0 h-full flex flex-col">
        {/* Image */}
        {post.image && (
          <div className="relative overflow-hidden rounded-t-xl h-48">
            <img
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 enhanced-image"
              src={post.image}
            />
            <div className="absolute top-3 right-3">
              <Chip
                className="capitalize backdrop-blur-card"
                color={getStatusColor(post.status)}
                size="sm"
                variant="flat"
              >
                {post.status.toLowerCase()}
              </Chip>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar
              className="border-2 border-white shadow-sm flex-shrink-0"
              name={post.author.name}
              size="sm"
              src={post.author.profilePhoto}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {post.author.name}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {format(new Date(post.createdAt), "MMM d")}
                </span>
              </div>
              {/* <div className="flex items-center gap-1 mt-1">
                <MapPin className="text-gray-400 flex-shrink-0" size={12} />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {post.district}, {post.division}
                </span>
              </div> */}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-2">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 flex-1 mb-3">
            {post.description}
          </p>

          {/* Footer */}
          <div className="space-y-3 mt-auto">
            {/* Crime Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <CalendarDays size={12} />
              <span>
                Crime: {format(new Date(post.crimeDate), "MMM d, yyyy")}
              </span>
            </div>

            {/* Crime Location */}
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <MapPin size={12} />
              <span>
                Location: {post.location}
              </span>
            </div>
            </div>
            

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Vote Section */}
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  className={`${isUpvoted ? "text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"} transition-colors`}
                  isDisabled={isVoting}
                  size="sm"
                  style={
                    isUpvoted
                      ? {
                          background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)`,
                        }
                      : {}
                  }
                  variant="flat"
                  onClick={() => handleVote("up")}
                >
                  <ThumbsUp size={14} />
                </Button>
                <span
                  className={`font-bold text-sm ${voteCount > 0 ? "text-emerald-600" : voteCount < 0 ? "text-red-600" : "text-gray-600"}`}
                >
                  {voteCount}
                </span>
                <Button
                  isIconOnly
                  className={`${isDownvoted ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"} transition-colors`}
                  isDisabled={isVoting}
                  size="sm"
                  variant="flat"
                  onClick={() => handleVote("down")}
                >
                  <ThumbsDown size={14} />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  className="text-gray-600 hover:text-blue-600 transition-colors h-7 min-w-0 px-2"
                  size="sm"
                  startContent={<MessageCircle size={12} />}
                  variant="light"
                >
                  <span className="text-xs">{post._count.comments}</span>
                </Button>
                <Button
                  isIconOnly
                  className="text-gray-600 hover:text-red-600 transition-colors h-7 min-w-0 px-1"
                  size="sm"
                  variant="light"
                >
                  <AlertTriangle size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <Card className="w-full h-full">
    <CardBody className="p-0 h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48 rounded-t-xl" />

      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-20 h-2 rounded" />
          </div>
        </div>

        {/* Title */}
        <Skeleton className="w-3/4 h-4 rounded" />

        {/* Description */}
        <div className="space-y-2 flex-1">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-2/3 h-3 rounded" />
        </div>

        {/* Footer */}
        <div className="space-y-3 mt-auto">
          <Skeleton className="w-32 h-3 rounded" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-7 rounded" />
              <Skeleton className="w-6 h-4 rounded" />
              <Skeleton className="w-8 h-7 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

const Posts = () => {
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
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );

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
    if (!user?._id) {
      toast.error("Please login to vote");

      return;
    }

    setIsVoting(true);

    const post = posts.find((p) => p.id === postId);

    if (!post) return;

    const upVotes = post.votes?.filter((vote) => vote.type === "UP") || [];
    const downVotes = post.votes?.filter((vote) => vote.type === "DOWN") || [];
    const isUpvoted = upVotes.some((vote) => vote.userId === user._id);
    const isDownvoted = downVotes.some((vote) => vote.userId === user._id);

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

  // Fetch divisions
  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => response.json())
      .then((data) => setDivisions(data.data))
      .catch(() => toast.error("Failed to fetch divisions"));
  }, []);

  // Fetch districts
  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data))
        .catch(() => toast.error("Failed to fetch districts"));
    } else {
      setDistricts([]);
    }
  }, [selectedDivision]);

  const clearFilters = () => {
    setSearchInput("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSort("createdAt");
    setPage(1);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-xl font-semibold text-red-600 mb-2">
              Error loading posts
            </p>
            <p className="text-gray-600">Please try again later</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Crime Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Community-verified crime reports and safety alerts
          </p>
        </div>
        <Button
          className="bg-brand-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
          startContent={<Plus size={18} />}
          onClick={() => (user ? setOpenModal(true) : setOpenAuthModal(true))}
        >
          Create Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <Input
              className="lg:flex-1"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700",
              }}
              placeholder="Search crime reports..."
              startContent={<Search className="text-gray-400" size={20} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {/* Division Filter */}
            <Dropdown>
              <DropdownTrigger>
                <Button className="min-w-[150px]" variant="bordered">
                  {selectedDivision
                    ? divisions.find((d) => d.id === selectedDivision)?.name
                    : "All Divisions"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                items={[
                  { key: "", label: "All Divisions" },
                  ...divisions.map((division) => ({
                    key: division.id,
                    label: division.name,
                  })),
                ]}
                onAction={(key) => {
                  setSelectedDivision(key as string);
                  setSelectedDistrict("");
                  setPage(1);
                }}
              >
                {(item) => (
                  <DropdownItem key={item.key} textValue={item.label as string}>
                    {item.label}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            {/* District Filter */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="min-w-[150px]"
                  isDisabled={!selectedDivision}
                  variant="bordered"
                >
                  {selectedDistrict
                    ? districts.find((d) => d.id === selectedDistrict)?.name
                    : "All Districts"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                items={[
                  { key: "", label: "All Districts" },
                  ...districts.map((district) => ({
                    key: district.id,
                    label: district.name,
                  })),
                ]}
                onAction={(key) => {
                  setSelectedDistrict(key as string);
                  setPage(1);
                }}
              >
                {(item) => (
                  <DropdownItem key={item.key} textValue={item.label as string}>
                    {item.label}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            {/* Sort Filter */}
            <Dropdown>
              <DropdownTrigger>
                <Button className="min-w-[150px]" variant="bordered">
                  {SortOptions.find((option) => option.key === sort)?.name ||
                    "Sort By"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onAction={(key) => {
                  setSort(key as string);
                  setPage(1);
                }}
              >
                {SortOptions.map((option) => (
                  <DropdownItem
                    key={option.key}
                    startContent={<option.icon size={16} />}
                  >
                    {option.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Clear Filters */}
            {(searchInput ||
              selectedDivision ||
              selectedDistrict ||
              sort !== "createdAt") && (
              <Button
                color="warning"
                startContent={<X size={16} />}
                variant="flat"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Posts */}
      <div>
        {isLoading && page === 1 ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <InfiniteScroll
            dataLength={posts.length}
            endMessage={
              <Card className="mt-8 col-span-full">
                <CardBody className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    🎉 You&apos;ve seen all posts!
                  </p>
                </CardBody>
              </Card>
            }
            hasMore={hasMore}
            loader={
              <div
                className="grid grid-cols-1 md:grid-cols-2 
               gap-6 mt-6"
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            }
            next={() => setPage((prev) => prev + 1)}
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 
             gap-6"
            >
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  isVoting={isVoting}
                  post={post}
                  userId={user?._id}
                  onVote={handleVote}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          // No posts
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No crime reports found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to report or try adjusting your filters
              </p>
              <Button
                color="primary"
                startContent={<Plus size={18} />}
                onClick={() =>
                  user ? setOpenModal(true) : setOpenAuthModal(true)
                }
              >
                Create First Report
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AuthModal
        openAuthModal={openAuthModal}
        setOpenAuthModal={setOpenAuthModal}
      />
      <CreatePostModal isOpen={openModal} setIsOpen={setOpenModal} />
    </div>
  );
};

export default Posts;
