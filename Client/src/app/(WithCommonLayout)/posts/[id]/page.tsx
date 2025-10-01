"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Chip,
  Divider,
  Textarea,
} from "@heroui/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  AlertTriangle,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { useGetSinglePost } from "@/src/hooks/post.hook";
import {
  useAddUpVotePost,
  useAddDownVotePost,
  useRemoveUpVoteFromPost,
  useRemoveDownVoteFromPost,
} from "@/src/hooks/post.hook";
import { useUser } from "@/src/context/user.provider";
import AuthModal from "@/src/components/UI/modal/AuthModal/AuthModal";
import { usePostAComment, useGetPostComments } from "@/src/hooks/comment.hook";
import CommentVoteButtons from "@/src/components/Comment/CommentVoteButtons";
import { FollowButton } from "@/src/components/modules/Shared";

const PostDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetSinglePost(id as string);
  const postData = data?.data;
  const { user } = useUser();

  const [isVoting, setIsVoting] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [comment, setComment] = useState("");
  const { mutateAsync: postComment } = usePostAComment();
  const { data: commentsData } = useGetPostComments(id as string);

  // Voting hooks
  const { mutate: addUpvote } = useAddUpVotePost();
  const { mutate: removeUpvote } = useRemoveUpVoteFromPost();
  const { mutate: addDownvote } = useAddDownVotePost();
  const { mutate: removeDownvote } = useRemoveDownVoteFromPost();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <Card>
          <CardBody className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Post not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The post you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button color="primary" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  interface Vote {
    type: "UP" | "DOWN";
    userId: string;
  }

  const upVotes: Vote[] =
    postData.votes?.filter((vote: Vote) => vote.type === "UP") || [];
  const downVotes: Vote[] =
    postData.votes?.filter((vote: Vote) => vote.type === "DOWN") || [];
  const isUpvoted = upVotes.some((vote: Vote) => vote.userId === user?.id);
  const isDownvoted = downVotes.some((vote: Vote) => vote.userId === user?.id);
  const voteCount = upVotes.length - downVotes.length;

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

  const handleVote = async (voteType: "up" | "down") => {
    if (!user?.id) {
      setOpenAuthModal(true);

      return;
    }

    setIsVoting(true);

    try {
      if (voteType === "up") {
        if (isUpvoted) {
          removeUpvote({ id: postData.id });
        } else {
          addUpvote({ id: postData.id });
        }
      } else {
        if (isDownvoted) {
          removeDownvote({ id: postData.id });
        } else {
          addDownvote({ id: postData.id });
        }
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postData.title,
          text: postData.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      setOpenAuthModal(true);

      return;
    }
    if (!comment.trim()) return;
    try {
      await postComment({ postId: id as string, content: comment });
      setComment("");
    } catch (err) {
      // error handled by hook onError (toast), keep input intact
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          startContent={<ArrowLeft size={16} />}
          variant="light"
          onClick={() => router.back()}
        >
          Back to Reports
        </Button>
      </div>

      {/* Main Post Card */}
      <Card className="mb-6">
        <CardBody className="p-0">
          {/* Image */}
          {postData.image && (
            <div className="relative h-96 overflow-hidden rounded-t-xl">
              <Image
                fill
                alt={postData.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                src={postData.image}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;

                  target.src = "/api/placeholder/800/400";
                }}
              />
              <div className="absolute top-4 right-4">
                <Chip
                  className="backdrop-blur-md"
                  color={getStatusColor(postData.status)}
                  size="lg"
                  variant="flat"
                >
                  {postData.status}
                </Chip>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <Link
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                href={`/profile/${postData.authorId}`}
              >
                <Avatar
                  className="border-2 border-white shadow-sm"
                  name={postData.authorName}
                  size="md"
                  src={postData.authorProfilePhoto}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {postData.authorName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    <span>
                      Posted {format(new Date(postData.createdAt), "PPp")}
                    </span>
                  </div>
                </div>
              </Link>
              <FollowButton
                className="ml-auto"
                size="sm"
                userId={postData.authorId}
                userName={postData.authorName}
                variant="bordered"
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {postData.title}
            </h1>

            {/* Description */}
            <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {postData.description}
              </p>
            </div>

            {/* Crime Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="text-brand-primary" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Crime Date
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(new Date(postData.crimeDate), "PPPP")}
                  </p>
                </div>
              </div>

              {postData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="text-brand-primary" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {postData.location}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="text-brand-primary" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    District
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {postData.location.split(",")[0]?.trim() || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-brand-primary" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Division
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {postData.location.split(",")[1]?.trim() || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              {/* Vote Section */}
              <div className="flex items-center gap-3">
                <Button
                  className={`${
                    isUpvoted
                      ? "text-white bg-brand-primary"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  } transition-colors`}
                  isDisabled={isVoting}
                  startContent={<ThumbsUp size={16} />}
                  variant="flat"
                  onClick={() => handleVote("up")}
                >
                  {upVotes.length}
                </Button>

                <span
                  className={`font-bold text-lg ${
                    voteCount > 0
                      ? "text-emerald-600"
                      : voteCount < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {voteCount}
                </span>

                <Button
                  className={`${
                    isDownvoted
                      ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  } transition-colors`}
                  isDisabled={isVoting}
                  startContent={<ThumbsDown size={16} />}
                  variant="flat"
                  onClick={() => handleVote("down")}
                >
                  {downVotes.length}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  startContent={<Share2 size={16} />}
                  variant="light"
                  onClick={handleShare}
                >
                  Share
                </Button>
                <Button
                  color="warning"
                  startContent={<AlertTriangle size={16} />}
                  variant="light"
                >
                  Report
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="text-brand-primary" size={20} />
            <h3 className="text-lg font-semibold">
              Comments ({postData.commentCounts})
            </h3>
          </div>
        </CardHeader>
        <CardBody>
          {user ? (
            <div className="space-y-4">
              <Textarea
                className="w-full"
                placeholder="Share your thoughts or additional information..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  className="bg-brand-primary text-white"
                  isDisabled={!comment.trim()}
                  onClick={handleCommentSubmit}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Join the Discussion
              </h4>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                You need to be logged in to comment on this post.
              </p>
              <Button color="primary" onClick={() => setOpenAuthModal(true)}>
                Sign In to Comment
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="mt-6 space-y-4">
            {commentsData &&
            commentsData.data &&
            commentsData.data.length > 0 ? (
              commentsData.data.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <Link href={`/profile/${c.authorId}`}>
                      <Avatar
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        name={c.authorName}
                        size="sm"
                        src={c.authorProfilePhoto}
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          className="hover:underline"
                          href={`/profile/${c.authorId}`}
                        >
                          <h4 className="font-medium">{c.authorName}</h4>
                        </Link>
                        <span className="text-sm text-gray-500">
                          {format(new Date(c.createdAt), "PPp")}
                        </span>
                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FollowButton
                            size="sm"
                            userId={c.authorId}
                            userName={c.authorName}
                            variant="light"
                          />
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {c.content}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <CommentVoteButtons
                        commentId={c.id}
                        postId={id as string}
                        votes={c.votes}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Related Posts */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Related Reports</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Related reports feature coming soon...
            </p>
            <Link href="/posts">
              <Button className="mt-4" color="primary" variant="light">
                Browse All Reports
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Auth Modal */}
      <AuthModal
        openAuthModal={openAuthModal}
        setOpenAuthModal={setOpenAuthModal}
      />
    </div>
  );
};

export default PostDetails;
