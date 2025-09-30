"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

import { useUser } from "@/src/context/user.provider";

import {
  useAddCommentUpvote,
  useAddCommentDownvote,
  useRemoveCommentUpvote,
  useRemoveCommentDownvote,
} from "@/src/hooks/commentVote.hook";

interface Props {
  commentId: string;
  postId?: string;
  votes?: { type: "UP" | "DOWN"; userId: string }[];
}

const CommentVoteButtons: React.FC<Props> = ({ commentId, postId, votes }) => {
  const { user } = useUser();
  const upVotes = votes?.filter((v) => v.type === "UP") || [];
  const downVotes = votes?.filter((v) => v.type === "DOWN") || [];
  const isUpvoted = upVotes.some((v) => v.userId === user?.id);
  const isDownvoted = downVotes.some((v) => v.userId === user?.id);

  const addUp = useAddCommentUpvote(postId);
  const addDown = useAddCommentDownvote(postId);
  const removeUp = useRemoveCommentUpvote(postId);
  const removeDown = useRemoveCommentDownvote(postId);

  const handleUp = async () => {
    if (!user) {
      toast.error("Please sign in to vote");

      return;
    }

    if (isUpvoted) {
      removeUp.mutate({ commentId, userId: user.id });
    } else {
      addUp.mutate({ commentId, userId: user.id });
    }
  };

  const handleDown = async () => {
    if (!user) {
      toast.error("Please sign in to vote");

      return;
    }

    if (isDownvoted) {
      removeDown.mutate({ commentId, userId: user.id });
    } else {
      addDown.mutate({ commentId, userId: user.id });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        className={isUpvoted ? "text-white bg-brand-primary" : ""}
        startContent={<ThumbsUp size={14} />}
        variant="flat"
        onClick={handleUp}
      >
        {upVotes.length}
      </Button>

      <Button
        className={isDownvoted ? "text-white bg-red-600" : ""}
        startContent={<ThumbsDown size={14} />}
        variant="flat"
        onClick={handleDown}
      >
        {downVotes.length}
      </Button>
    </div>
  );
};

export default CommentVoteButtons;
